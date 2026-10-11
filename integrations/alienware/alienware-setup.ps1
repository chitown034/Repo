<#
.SYNOPSIS
  Steven's ALIENWARE (Windows) setup helper: checks and installs Orca, Laya, Bonsai 2 27B,
  and optionally Ollama, AnyDesk and Tailscale.

.DESCRIPTION
  PowerShell 5.1 compatible. Run it as a NORMAL user (not "Run as administrator").
  Written in a Linux cloud sandbox and NEVER executed on Windows - read what it prints.

  -Action Doctor     (default) read-only checks, writes nothing, changes nothing.
  -Action Install    asks Y/N before EACH change (Enter = No). Add -DryRun to only preview.
  -Action Report     prints ONE JSON line of status words for the Command Deck. No prompts.
  -Action OrcaServe  serve Orca on a private/Tailscale/LAN address only (port of orca-remote.sh).
  -Action OrcaPair   pair to another Orca server with a hidden prompt (port of orca-remote.sh).

  -DryRun works on every action: it prints what it WOULD run and runs nothing.
  -Only limits Install to some parts: Prereqs, Orca, Laya, Bonsai, Ollama, AnyDesk, Tailscale.

  If Windows refuses to run scripts, paste this ONE line in the same PowerShell window first
  (it only affects that window and ends when you close it):
      Set-ExecutionPolicy RemoteSigned -Scope Process

  Secrets: this script never stores or logs a password, token or pairing link. It does not use
  PowerShell's built-in transcript recorder (that would capture typed input). Its own log scrubs links and codes.
  It never downloads and then runs a script, and never builds commands from strings.
#>
[CmdletBinding()]
param(
    [ValidateSet('Doctor', 'Install', 'Report', 'OrcaServe', 'OrcaPair')]
    [string]$Action = 'Doctor',

    [switch]$DryRun,

    [ValidateSet('All', 'Prereqs', 'Orca', 'Laya', 'Bonsai', 'Ollama', 'AnyDesk', 'Tailscale')]
    [string[]]$Only = @('All'),

    # OrcaServe only
    [string]$Address = '',
    [ValidateRange(0, 65535)]
    [int]$Port = 0,
    [switch]$Phone,
    [switch]$GrantDesktopControl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ----------------------------------------------------------------------------------------------
# Constants (pins)
# ----------------------------------------------------------------------------------------------
$UserHome = [Environment]::GetEnvironmentVariable('USERPROFILE')
$AiDir = Join-Path $UserHome 'ai'
$LogDir = Join-Path $AiDir 'logs'
$LayaVenv = Join-Path $AiDir 'laya-venv'
$BonsaiDir = Join-Path $AiDir 'Bonsai-demo'
$LayaVersion = '0.3.21'                 # repo pin; confirmed to exist on PyPI with serve+mcp extras
$LayaSpec = 'laya[serve,mcp]==' + $LayaVersion
$LayaRepoId = 'convaiinnovations/laya'
$BonsaiRepoUrl = 'https://github.com/PrismML-Eng/Bonsai-demo.git'
$BonsaiCommit = 'd5ea901004ae983f5bea86dd2e3f5fa1fe915e2c'   # the clone read in the cloud, 2026-10-10
$BonsaiUrl = 'http://localhost:8080'
$BonsaiHealth = 'http://127.0.0.1:8080/health'
$OllamaModel = 'MichelRosselli/bonsai-27b'
$OrcaPage = 'https://github.com/stablyai/orca/releases'
$MinDiskGb = 25
$NeedVramGb = 8

$script:LogFile = $null

# ----------------------------------------------------------------------------------------------
# Output + log (log never records secrets: links, codes, tokens are scrubbed)
# ----------------------------------------------------------------------------------------------
function Protect-Text {
    param([string]$Text)
    if ($null -eq $Text) { return '' }
    $t = $Text
    $t = [regex]::Replace($t, 'orca://\S*', '[link hidden]')
    $t = [regex]::Replace($t, '(?i)\b(code|token|authkey|password|passwd|pwd|secret)\s*[=:]\s*\S+', '$1=[hidden]')
    $t = [regex]::Replace($t, 'tskey-\S+', '[hidden]')
    $t = [regex]::Replace($t, 'hf_[A-Za-z0-9]{10,}', '[hidden]')
    return $t
}

function Write-Log {
    param([string]$Message)
    if ($null -eq $script:LogFile) { return }
    try {
        $line = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss') + ' ' + (Protect-Text $Message)
        Add-Content -LiteralPath $script:LogFile -Value $line -Encoding UTF8
    } catch {
        # logging must never stop the script
    }
}

function Say {
    param([string]$Message, [string]$Color = '')
    $p = Protect-Text $Message
    if ($Color -ne '') { Write-Host $p -ForegroundColor $Color } else { Write-Host $p }
    Write-Log $p
}

function Say-Ok {
    param([string]$m)
    Say ('  OK    ' + $m) 'Green'
}
function Say-Warn {
    param([string]$m)
    Say ('  WARN  ' + $m) 'Yellow'
}
function Say-Info {
    param([string]$m)
    Say ('  INFO  ' + $m)
}
$script:Fails = 0
function Say-Bad {
    param([string]$m)
    $script:Fails = $script:Fails + 1
    Say ('  FAIL  ' + $m) 'Red'
}

function Start-Log {
    if ($DryRun) { return }
    try {
        if (-not (Test-Path -LiteralPath $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
        $script:LogFile = Join-Path $LogDir ('alienware-setup-' + (Get-Date -Format 'yyyy-MM-dd') + '.log')
        Write-Log ('--- start action=' + $Action + ' (no secrets are recorded in this file)')
    } catch {
        $script:LogFile = $null
        Write-Host 'Could not create the log folder; continuing without a log file.' -ForegroundColor Yellow
    }
}

function Get-Env {
    param([string]$Name)
    return [Environment]::GetEnvironmentVariable($Name)
}

function Format-Arg {
    param([string]$A)
    if ($A -match '[\s\[\]"]') { return '"' + $A + '"' }
    return $A
}

function Confirm-Step {
    # Default is No. Enter = No. In -DryRun nothing is asked and nothing runs.
    param([string]$Question)
    if ($DryRun) {
        Say ('[dry run] would ask: ' + $Question + ' [y/N]')
        return $true
    }
    $ans = ''
    try { $ans = Read-Host ($Question + ' [y/N]') } catch { $ans = '' }
    $ans = ([string]$ans).Trim().ToLowerInvariant()
    if ($ans -eq 'y' -or $ans -eq 'yes') { Write-Log ('answered yes: ' + $Question); return $true }
    Say '  -> No (nothing changed).'
    return $false
}

# Run an external program: echo first, then run, show its output on screen (not in the log).
function Invoke-Ext {
    param([string]$Exe, [string[]]$Arguments = @())
    $shown = '> ' + $Exe
    foreach ($a in $Arguments) { $shown = $shown + ' ' + (Format-Arg $a) }
    Say $shown 'Cyan'
    if ($DryRun) { Say '  (dry run - not executed)'; return 0 }
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $rc = 0
    try {
        $global:LASTEXITCODE = 0
        & $Exe @Arguments | Out-Host
        $rc = $global:LASTEXITCODE
    } catch {
        $rc = -1
        Say ('  could not start: ' + $_.Exception.Message) 'Red'
    } finally {
        $ErrorActionPreference = $prev
    }
    if ($rc -ne 0) { Say ('  exit code ' + $rc) 'Yellow' }
    return $rc
}

# Quietly run a program and capture text (read-only checks).
function Invoke-Capture {
    param([string]$Exe, [string[]]$Arguments = @())
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $out = ''
    $rc = -1
    try {
        $global:LASTEXITCODE = 0
        $out = (& $Exe @Arguments 2>&1 | Out-String)
        $rc = $global:LASTEXITCODE
    } catch {
        $out = ''
        $rc = -1
    } finally {
        $ErrorActionPreference = $prev
    }
    return [pscustomobject]@{ Rc = $rc; Out = $out }
}

function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $merged = $machine + ';' + $user + ';' + $env:Path
    $seen = @{}
    $keep = @()
    foreach ($p in ($merged -split ';')) {
        $k = $p.TrimEnd('\').ToLowerInvariant()
        if ($k -and -not $seen.ContainsKey($k)) { $seen[$k] = $true; $keep += $p }
    }
    $env:Path = ($keep -join ';')
}

function Get-CleanLabel {
    param([string]$Text, [int]$Max = 40)
    if ($null -eq $Text) { return '' }
    $t = [regex]::Replace($Text, '[^A-Za-z0-9 ._()@+\-]', '')
    if ($t.Length -gt $Max) { $t = $t.Substring(0, $Max) }
    return $t.Trim()
}

function Test-Http {
    param([string]$Url, [int]$Seconds = 2)
    try {
        $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $Seconds
        return (([int]$r.StatusCode -ge 200) -and ([int]$r.StatusCode -lt 300))
    } catch {
        return $false
    }
}

# ----------------------------------------------------------------------------------------------
# Address policy (port of is_private_addr in orca-remote.sh)
# Private LAN, CGNAT/Tailscale 100.64/10, loopback, link-local, .local, .ts.net, .home.arpa
# ----------------------------------------------------------------------------------------------
function Test-PrivateAddress {
    param([string]$A)
    if ([string]::IsNullOrWhiteSpace($A)) { return $false }
    if ($A -match '://' -or $A -match '/' -or $A -match '@' -or $A -match '\s') { return $false }
    $l = $A.ToLowerInvariant()
    if ($l -match '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$' -and $l -notmatch '^[0-9.]+$') {
        if ($l -eq 'localhost') { return $true }
        if ($l.EndsWith('.local') -or $l.EndsWith('.ts.net') -or $l.EndsWith('.home.arpa')) { return $true }
        return $false
    }
    if ($l.Contains(':')) {
        $ip6 = $null
        if (-not [System.Net.IPAddress]::TryParse($l, [ref]$ip6)) { return $false }
        if ($ip6.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetworkV6) { return $false }
        if ($l -eq '::1') { return $true }
        if ($l.StartsWith('fe80:')) { return $true }
        if ($l.StartsWith('fd') -or $l.StartsWith('fc')) { return $true }
        return $false
    }
    if ($l -notmatch '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$') { return $false }
    $o = @()
    foreach ($part in ($l -split '\.')) {
        $n = [int]$part
        if ($n -gt 255) { return $false }
        $o += $n
    }
    if ($o[0] -eq 10 -or $o[0] -eq 127) { return $true }
    if ($o[0] -eq 172 -and $o[1] -ge 16 -and $o[1] -le 31) { return $true }
    if ($o[0] -eq 192 -and $o[1] -eq 168) { return $true }
    if ($o[0] -eq 100 -and $o[1] -ge 64 -and $o[1] -le 127) { return $true }
    if ($o[0] -eq 169 -and $o[1] -eq 254) { return $true }
    return $false
}

function Get-LanCandidates {
    # one private IPv4 per element, read-only
    $found = @()
    try {
        foreach ($a in @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop)) {
            $ip = [string]$a.IPAddress
            if ($ip.StartsWith('127.')) { continue }
            if (Test-PrivateAddress $ip) { $found += $ip }
        }
    } catch {
        try {
            foreach ($a in @([System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()))) {
                if ($a.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) { continue }
                $ip = $a.ToString()
                if ($ip.StartsWith('127.')) { continue }
                if (Test-PrivateAddress $ip) { $found += $ip }
            }
        } catch { }
    }
    $ts = Find-Tailscale
    if ($ts) {
        $r = Invoke-Capture $ts @('ip', '-4')
        if ($r.Rc -eq 0) {
            foreach ($line in ($r.Out -split "`r?`n")) {
                $x = $line.Trim()
                if ($x -and (Test-PrivateAddress $x)) { $found += $x }
            }
        }
    }
    return @($found | Select-Object -Unique)
}

# ----------------------------------------------------------------------------------------------
# Finders (read-only)
# ----------------------------------------------------------------------------------------------
function Find-Orca {
    $b = Get-Env 'ORCA_BIN'
    if ($b -and (Test-Path -LiteralPath $b)) { return $b }
    $c = Get-Command orca -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source }
    return $null
}

function Find-Tailscale {
    $c = Get-Command tailscale -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source }
    $pf = Get-Env 'ProgramFiles'
    if ($pf) {
        $p = Join-Path $pf 'Tailscale\tailscale.exe'
        if (Test-Path -LiteralPath $p) { return $p }
    }
    return $null
}

function Find-AnyDesk {
    $c = Get-Command AnyDesk -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source }
    foreach ($v in @('ProgramFiles(x86)', 'ProgramFiles', 'LOCALAPPDATA')) {
        $base = Get-Env $v
        if (-not $base) { continue }
        $p = Join-Path $base 'AnyDesk\AnyDesk.exe'
        if (Test-Path -LiteralPath $p) { return $p }
    }
    return $null
}

function Find-Ollama {
    $c = Get-Command ollama -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source }
    $la = Get-Env 'LOCALAPPDATA'
    if ($la) {
        $p = Join-Path $la 'Programs\Ollama\ollama.exe'
        if (Test-Path -LiteralPath $p) { return $p }
    }
    return $null
}

function Find-Python {
    $py = Get-Command py -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($py) {
        foreach ($m in @('3.11', '3.12', '3.13', '3.10')) {
            $r = Invoke-Capture $py.Source @(('-' + $m), '-c', 'import sys;print(sys.executable)')
            if ($r.Rc -eq 0) {
                $p = $r.Out.Trim()
                if ($p -and (Test-Path -LiteralPath $p)) { return $p }
            }
        }
    }
    foreach ($n in @('python', 'python3')) {
        foreach ($c in @(Get-Command $n -All -CommandType Application -ErrorAction SilentlyContinue)) {
            if ($c.Source -like '*\WindowsApps\*') { continue }
            $r = Invoke-Capture $c.Source @('--version')
            if ($r.Rc -eq 0 -and $r.Out -match 'Python 3\.(1[0-3])\.') { return $c.Source }
        }
    }
    return $null
}

function Get-HfHubDir {
    $h = Get-Env 'HF_HUB_CACHE'
    if (-not $h) {
        $hh = Get-Env 'HF_HOME'
        if ($hh) { $h = Join-Path $hh 'hub' } else { $h = Join-Path $UserHome '.cache\huggingface\hub' }
    }
    return $h
}

function Test-LayaCheckpointCached {
    $d = Join-Path (Get-HfHubDir) 'models--convaiinnovations--laya'
    return (Test-Path -LiteralPath $d)
}

function Find-NvidiaSmi {
    $c = Get-Command nvidia-smi -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($c) { return $c.Source }
    foreach ($v in @('ProgramFiles', 'SystemRoot')) {
        $base = Get-Env $v
        if (-not $base) { continue }
        foreach ($rel in @('NVIDIA Corporation\NVSMI\nvidia-smi.exe', 'System32\nvidia-smi.exe')) {
            $p = Join-Path $base $rel
            if (Test-Path -LiteralPath $p) { return $p }
        }
    }
    return $null
}

function Test-VcRedist {
    try {
        $k = Get-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64' -ErrorAction Stop
        return ([int]$k.Installed -eq 1)
    } catch {
        return $false
    }
}

# ----------------------------------------------------------------------------------------------
# Facts (all read-only; nothing here prints)
# ----------------------------------------------------------------------------------------------
function Get-GpuFacts {
    $names = @()
    try {
        foreach ($v in @(Get-CimInstance Win32_VideoController -ErrorAction Stop)) {
            if ($v.Name) { $names += [string]$v.Name }
        }
    } catch { }
    $nv = Find-NvidiaSmi
    $vTotal = $null
    $vFree = $null
    $nvName = ''
    $driver = ''
    if ($nv) {
        $r = Invoke-Capture $nv @('--query-gpu=name,memory.total,memory.free,driver_version', '--format=csv,noheader,nounits')
        if ($r.Rc -eq 0) {
            $best = -1
            foreach ($line in ($r.Out -split "`r?`n")) {
                $f = $line.Split(',')
                if ($f.Length -lt 4) { continue }
                $tot = 0
                $fre = 0
                if (-not [int]::TryParse($f[1].Trim(), [ref]$tot)) { continue }
                if (-not [int]::TryParse($f[2].Trim(), [ref]$fre)) { continue }
                if ($tot -gt $best) {
                    $best = $tot
                    $vTotal = [math]::Round($tot / 1024.0, 1)
                    $vFree = [math]::Round($fre / 1024.0, 1)
                    $nvName = $f[0].Trim()
                    $driver = $f[3].Trim()
                }
            }
        }
    }
    $nvListed = $false
    foreach ($n in $names) { if ($n -match 'NVIDIA') { $nvListed = $true } }
    $display = ''
    if ($nvName) { $display = $nvName }
    elseif ($names.Count -gt 0) {
        $display = $names[0]
        foreach ($n in $names) { if ($n -match 'NVIDIA') { $display = $n; break } }
    }
    $verdict = 'cpu'
    $text = ''
    if ($null -ne $vTotal) {
        if ($vFree -ge $NeedVramGb) {
            $verdict = 'gpu'
            $text = 'Your NVIDIA card has about ' + $vFree + ' GB of video memory free (of ' + $vTotal + ' GB). The Bonsai 2 27B model needs roughly ' + $NeedVramGb + ' GB, so it should fit on the GPU and run fast.'
        } elseif ($vTotal -ge $NeedVramGb) {
            $verdict = 'gpu-tight'
            $text = 'Your card has ' + $vTotal + ' GB total but only ' + $vFree + ' GB free right now. Close games and other heavy apps, then check again. If it still will not fit, Bonsai falls back to the slower CPU path.'
        } else {
            $verdict = 'cpu'
            $text = 'Your NVIDIA card has only ' + $vTotal + ' GB of video memory, which is under the roughly ' + $NeedVramGb + ' GB the 27B model needs. It will run on the CPU instead - works, but slower.'
        }
    } elseif ($nvListed) {
        $verdict = 'unknown'
        $text = 'Windows lists an NVIDIA card but nvidia-smi is missing or failed, so the video memory is unknown. Install or update the NVIDIA driver from nvidia.com, then run this again. Until then, assume the slower CPU path.'
    } elseif ($names.Count -gt 0) {
        $verdict = 'cpu'
        $text = 'No NVIDIA card found (' + (Get-CleanLabel $display 60) + '). Bonsai can still run on the CPU (or an AMD/Vulkan build), slower. Not tested here.'
    } else {
        $verdict = 'unknown'
        $text = 'Windows did not report any graphics adapter. Assume the slower CPU path.'
    }
    return [pscustomobject]@{
        Name = (Get-CleanLabel $display 60); VramTotalGb = $vTotal; VramFreeGb = $vFree
        Driver = (Get-CleanLabel $driver 30); Verdict = $verdict; Text = $text; Nvidia = ($null -ne $vTotal -or $nvListed)
    }
}

function Get-RamGb {
    try {
        $cs = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
        return [math]::Round(([double]$cs.TotalPhysicalMemory) / 1GB, 1)
    } catch { return $null }
}

function Get-FreeDiskGb {
    try {
        $root = [System.IO.Path]::GetPathRoot($AiDir)
        $letter = $root.Substring(0, 1)
        $d = Get-PSDrive -Name $letter -ErrorAction Stop
        return [math]::Round(([double]$d.Free) / 1GB, 1)
    } catch { return $null }
}

function Get-OsCaption {
    try {
        $o = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
        return (Get-CleanLabel ([string]$o.Caption + ' ' + [string]$o.Version) 60)
    } catch { return 'unknown' }
}

function Get-OrcaState {
    $o = Find-Orca
    if (-not $o) { return 'missing' }
    $r = Invoke-Capture $o @('--version')
    if ($r.Rc -eq 0) { return 'ok' }
    return 'unverified'
}

function Get-LayaState {
    $py = Join-Path $LayaVenv 'Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $py)) { return 'missing' }
    $r = Invoke-Capture $py @('-I', '-c', 'import laya; print(laya.__version__)')
    if ($r.Rc -ne 0) { return 'unverified' }
    if ($r.Out.Trim() -eq $LayaVersion) { return 'ok' }
    return 'unverified'
}

function Get-BonsaiModelFile {
    $d = Join-Path $BonsaiDir 'models\bonsai2-gguf\27B'
    if (-not (Test-Path -LiteralPath $d)) { return $null }
    $f = Get-ChildItem -LiteralPath $d -Filter '*.gguf' -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -notlike '*mmproj*' } | Select-Object -First 1
    return $f
}

function Get-BonsaiState {
    if (Test-Http $BonsaiHealth 2) { return 'ok' }
    if (Get-BonsaiModelFile) { return 'unverified' }
    return 'missing'
}

function Get-OllamaState {
    $o = Find-Ollama
    if (-not $o) { return 'missing' }
    $r = Invoke-Capture $o @('list')
    if ($r.Rc -eq 0 -and $r.Out -match [regex]::Escape($OllamaModel)) { return 'ok' }
    return 'unverified'
}

function Get-AnyDeskState {
    if (Find-AnyDesk) { return 'ok' }
    return 'missing'
}

function Get-TailscaleState {
    $t = Find-Tailscale
    if (-not $t) { return 'missing' }
    $r = Invoke-Capture $t @('status')
    if ($r.Rc -eq 0) { return 'ok' }
    return 'unverified'
}

# ----------------------------------------------------------------------------------------------
# Doctor (read-only)
# ----------------------------------------------------------------------------------------------
function Invoke-Doctor {
    Say ('ALIENWARE doctor - read-only, nothing is changed. ' + (Get-Date -Format 'yyyy-MM-dd HH:mm'))
    Say ''
    Say '== This computer =='
    Say-Info ('Windows: ' + (Get-OsCaption) + '   PowerShell ' + $PSVersionTable.PSVersion.ToString())
    $ram = Get-RamGb
    if ($null -eq $ram) { Say-Warn 'Could not read the amount of memory (RAM).' }
    elseif ($ram -lt 16) { Say-Warn ('RAM: ' + $ram + ' GB. 16 GB or more is comfortable for the CPU path (rule of thumb, not tested here).') }
    else { Say-Ok ('RAM: ' + $ram + ' GB') }
    $free = Get-FreeDiskGb
    if ($null -eq $free) { Say-Warn 'Could not read free disk space.' }
    elseif ($free -lt $MinDiskGb) { Say-Bad ('Free disk space: ' + $free + ' GB. You need at least ' + $MinDiskGb + ' GB free for everything (model files are large).') }
    else { Say-Ok ('Free disk space: ' + $free + ' GB (need ' + $MinDiskGb + ' GB)') }
    $gpu = Get-GpuFacts
    if ($gpu.Name) { Say-Info ('Graphics: ' + $gpu.Name) } else { Say-Info 'Graphics: not detected' }
    if ($gpu.Verdict -eq 'gpu') { Say-Ok $gpu.Text } else { Say-Warn $gpu.Text }

    Say ''
    Say '== Tools =='
    $wg = Get-Command winget -CommandType Application -ErrorAction SilentlyContinue
    if ($wg) { Say-Ok 'winget (Windows package installer) is available' } else { Say-Warn 'winget not found. Install "App Installer" from the Microsoft Store, then run this again.' }
    if (Get-Command git -CommandType Application -ErrorAction SilentlyContinue) { Say-Ok 'Git is installed' } else { Say-Warn 'Git is missing (Install adds Git.Git)' }
    if (Get-Command node -CommandType Application -ErrorAction SilentlyContinue) { Say-Ok 'Node.js is installed' } else { Say-Warn 'Node.js is missing (Install adds OpenJS.NodeJS.LTS)' }
    $pyp = Find-Python
    if ($pyp) { Say-Ok 'Python 3.10-3.13 is installed' } else { Say-Warn 'Python is missing (Install adds Python.Python.3.11)' }
    if (Get-Command uv -CommandType Application -ErrorAction SilentlyContinue) { Say-Ok 'uv is installed' } else { Say-Info 'uv is missing; Install adds it so the Bonsai setup never needs its internet-script fallback' }
    if (Test-VcRedist) { Say-Ok 'Visual C++ runtime is installed' } else { Say-Warn 'Visual C++ runtime not found; Bonsai may need it (Install offers it). Not verified that it is required.' }

    Say ''
    Say '== The five things =='
    $orca = Get-OrcaState
    if ($orca -eq 'ok') { Say-Ok 'Orca: installed' }
    elseif ($orca -eq 'unverified') { Say-Warn 'Orca: found on PATH but did not answer --version' }
    else { Say-Warn ('Orca: not installed. Official page: ' + $OrcaPage + ' (Windows build not verified from the cloud)') }
    $laya = Get-LayaState
    if ($laya -eq 'ok') { Say-Ok ('Laya ' + $LayaVersion + ': imports fine') }
    elseif ($laya -eq 'unverified') { Say-Warn 'Laya: venv exists but import failed or the version differs from the pin' }
    else { Say-Warn 'Laya: not installed' }
    if (Test-LayaCheckpointCached) { Say-Info 'Laya model files: already cached on this PC (no download needed for a test)' } else { Say-Info 'Laya model files: not cached (a test would download them from huggingface.co; Install asks first)' }
    $bon = Get-BonsaiState
    if ($bon -eq 'ok') { Say-Ok ('Bonsai server is answering at ' + $BonsaiUrl) }
    elseif ($bon -eq 'unverified') { Say-Warn 'Bonsai model is on disk but the server is not running (start it from Install, or the README step)' }
    else { Say-Warn 'Bonsai: not installed' }
    $oll = Get-OllamaState
    if ($oll -eq 'ok') { Say-Ok ('Ollama has ' + $OllamaModel + ' (community upload, unverified)') }
    elseif ($oll -eq 'unverified') { Say-Info 'Ollama installed, community Bonsai model not pulled (optional path)' }
    else { Say-Info 'Ollama: not installed (optional path)' }
    if ((Get-AnyDeskState) -eq 'ok') { Say-Ok 'AnyDesk is installed' } else { Say-Info 'AnyDesk: not installed (optional)' }
    $ts = Get-TailscaleState
    if ($ts -eq 'ok') { Say-Ok 'Tailscale is installed and connected' }
    elseif ($ts -eq 'unverified') { Say-Info 'Tailscale is installed but not signed in / connected' }
    else { Say-Info 'Tailscale: not installed (optional; the private network for Orca pairing)' }

    Say ''
    Say '== Orca safety =='
    $bad = 0
    try {
        foreach ($p in @(Get-CimInstance Win32_Process -ErrorAction Stop)) {
            $cl = [string]$p.CommandLine
            if (-not $cl) { continue }
            if ($cl -notmatch 'orca' -or $cl -notmatch '\bserve\b') { continue }
            if ($cl -match 'Invoke-Doctor|alienware-setup') { continue }
            if ($cl -match 'grant-desktop-control') { $bad++; Say-Bad ('An orca serve process (pid ' + $p.ProcessId + ') was started with desktop control granted. Stop it.') }
            $m = [regex]::Match($cl, '--pairing-address[= ]+(\S+)')
            if ($m.Success -and -not (Test-PrivateAddress $m.Groups[1].Value)) { $bad++; Say-Bad ('An orca serve process (pid ' + $p.ProcessId + ') advertises a non-private address. Stop it.') }
        }
    } catch { Say-Info 'Could not list running programs; skipped the orca serve check.' }
    if ($bad -eq 0) { Say-Ok 'No unsafe orca serve process found' }

    Say ''
    if ($script:Fails -gt 0) { Say ('Result: ' + $script:Fails + ' problem(s) above. Nothing was changed.') 'Red' }
    else { Say 'Result: no hard problems. Nothing was changed. Next: preview with  -Action Install -DryRun' 'Green' }
}

# ----------------------------------------------------------------------------------------------
# Report: ONE JSON line, status words only
# ----------------------------------------------------------------------------------------------
function Invoke-Report {
    $gpu = Get-GpuFacts
    $obj = [ordered]@{
        host          = (Get-CleanLabel (Get-Env 'COMPUTERNAME') 40)
        os            = (Get-OsCaption)
        gpu           = $gpu.Name
        vram_gb       = $gpu.VramTotalGb
        ram_gb        = (Get-RamGb)
        orca          = (Get-OrcaState)
        laya          = (Get-LayaState)
        bonsai_server = (Get-BonsaiState)
        ollama        = (Get-OllamaState)
        anydesk       = (Get-AnyDeskState)
        tailscale     = (Get-TailscaleState)
        ts            = ([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
    }
    Write-Output ($obj | ConvertTo-Json -Compress)
}

# ----------------------------------------------------------------------------------------------
# Install pieces
# ----------------------------------------------------------------------------------------------
function Test-Selected {
    param([string]$Part)
    return (($Only -contains 'All') -or ($Only -contains $Part))
}

function Test-Winget {
    return [bool](Get-Command winget -CommandType Application -ErrorAction SilentlyContinue)
}

function Install-WingetPackage {
    param([string]$Id, [string]$Label, [string]$Why)
    if (-not (Test-Winget)) { Say-Warn ('winget is not available, so I cannot install ' + $Label + '. Install "App Installer" from the Microsoft Store first.'); return $false }
    Say ''
    Say ($Label + ' - ' + $Why)
    Say '  (Windows may show a "Do you want to allow this app to make changes" box. That is normal for this installer.)'
    if (-not (Confirm-Step ('Install ' + $Label + ' with winget (' + $Id + ')?'))) { return $false }
    $rc = Invoke-Ext 'winget' @('install', '-e', '--id', $Id, '--accept-package-agreements', '--accept-source-agreements')
    if (-not $DryRun) { Update-SessionPath }
    if ($rc -ne 0) { Say-Warn ($Label + ': winget returned ' + $rc + ' (it also returns non-zero when the program is already installed). Run Doctor to see.'); return $false }
    return $true
}

function Install-Prereqs {
    Say ''
    Say '=== Part 1: Windows prerequisites ==='
    if (-not (Get-Command git -CommandType Application -ErrorAction SilentlyContinue)) {
        [void](Install-WingetPackage 'Git.Git' 'Git' 'needed to fetch the Bonsai demo')
    } else { Say-Ok 'Git already installed' }
    if (-not (Get-Command node -CommandType Application -ErrorAction SilentlyContinue)) {
        [void](Install-WingetPackage 'OpenJS.NodeJS.LTS' 'Node.js LTS' 'JavaScript runtime used by agent tools')
    } else { Say-Ok 'Node.js already installed' }
    $pyp = Find-Python
    if (-not $pyp) {
        [void](Install-WingetPackage 'Python.Python.3.11' 'Python 3.11' 'needed for Laya and the Bonsai setup')
    } else { Say-Ok 'Python already installed' }
    if (-not (Get-Command uv -CommandType Application -ErrorAction SilentlyContinue)) {
        [void](Install-WingetPackage 'astral-sh.uv' 'uv (Python tool)' 'Bonsai setup needs it; installing it here means Bonsai never uses its fallback that downloads and runs an internet script')
    } else { Say-Ok 'uv already installed' }
    if (-not (Test-VcRedist)) {
        Say 'The Visual C++ runtime was not found. Bonsai does not say it needs it, but the llama.cpp programs are normally built with it. Unverified; harmless to install.'
        [void](Install-WingetPackage 'Microsoft.VCRedist.2015+.x64' 'Visual C++ runtime' 'only if Bonsai later fails with a missing DLL message')
    }
}

function Install-Orca {
    Say ''
    Say '=== Part 2: Orca ==='
    $o = Find-Orca
    if ($o) { Say-Ok 'Orca CLI already found. Nothing to install.'; return }
    Say 'Orca is not installed (or its "orca" command is not on PATH).'
    Say 'On the Mac it comes from Homebrew (stablyai/orca/orca). I could NOT verify how Orca installs on Windows,'
    Say 'so this script does not download or run an Orca installer. The official page (from the repo notes) is:'
    Say ('  ' + $OrcaPage)
    Say 'Pick the Windows file there if one exists, install it yourself, then reopen PowerShell and run Doctor.'
    Say 'In the Orca app look for a setting that installs the "orca" shell command, if there is one.'
    if (Confirm-Step 'Open that page in your browser now?') {
        Say ('> Start-Process ' + $OrcaPage) 'Cyan'
        if (-not $DryRun) { Start-Process $OrcaPage }
    }
}

function Write-LayaSmokeFile {
    param([string]$Path)
    $py = @'
# Laya smoke test: one routing prediction on harmless text. No client data, ever.
from laya import Router
router = Router()
questions = {
    "department": {
        "type": "choice",
        "instructions": "Which department should handle this?",
        "criteria": {"billing": "invoices, payments, refunds", "other": "everything else"},
    }
}
result = router.predict("We were billed twice for March. Please refund it today.", questions)
print("laya routing answer:", result["answers"]["department"]["choice"])
'@
    Set-Content -LiteralPath $Path -Value $py -Encoding ASCII
}

function Install-Laya {
    Say ''
    Say '=== Part 3: Laya (local request router) ==='
    $py = Join-Path $LayaVenv 'Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $py)) {
        $sys = Find-Python
        if (-not $sys) { Say-Warn 'No Python found. Run Part 1 first (Python 3.11), then reopen PowerShell.'; return }
        if (-not (Confirm-Step ('Create a private Python environment at ' + $LayaVenv + ' ?'))) { return }
        if (-not $DryRun -and -not (Test-Path -LiteralPath $AiDir)) { New-Item -ItemType Directory -Path $AiDir -Force | Out-Null }
        $rc = Invoke-Ext $sys @('-m', 'venv', $LayaVenv)
        if ($rc -ne 0) { Say-Warn 'Could not create the environment.'; return }
    } else { Say-Ok 'Laya environment already exists' }
    if ((Get-LayaState) -ne 'ok') {
        Say ('Next installs ' + $LayaSpec + ' from PyPI (pinned; the version exists on PyPI as checked from the cloud).')
        Say 'It pulls PyTorch and related libraries: roughly 1-3 GB of downloads (size not verified). Windows pip gets the CPU PyTorch build, which is fine for Laya.'
        if (-not (Confirm-Step ('Install ' + $LayaSpec + ' now?'))) { return }
        $rc = Invoke-Ext $py @('-m', 'pip', 'install', $LayaSpec)
        if ($rc -ne 0) { Say-Warn 'pip install failed. Nothing else was changed.'; return }
    } else { Say-Ok ('Laya ' + $LayaVersion + ' already installed') }

    Say 'Smoke test 1: import Laya (no model download).'
    $rc = Invoke-Ext $py @('-I', '-c', 'import laya; print(laya.__version__)')
    if ($rc -ne 0) { Say-Warn 'Laya did not import.'; return }

    $cached = Test-LayaCheckpointCached
    $smoke = Join-Path $AiDir 'laya-smoke.py'
    if ($cached) {
        Say-Info 'The Laya model files are already cached on this PC.'
        if (-not (Confirm-Step 'Run one routing test using ONLY the cached files (no network)?')) { return }
        if (-not $DryRun) { Write-LayaSmokeFile $smoke }
        $env:HF_HUB_OFFLINE = '1'
        try { $rc = Invoke-Ext $py @('-I', $smoke) } finally { Remove-Item Env:\HF_HUB_OFFLINE -ErrorAction SilentlyContinue }
        if ($rc -ne 0) { Say-Warn 'The offline test failed. Laya may also need its multilingual files; unverified. Not an install failure.' }
    } else {
        Say ('The model files are NOT on this PC. Running a test would download them from huggingface.co (' + $LayaRepoId + '). Size not verified.')
        if (-not (Confirm-Step ('Download the Laya model from huggingface.co now and run one test?'))) {
            Say 'Skipped the model download. Laya is installed; run Doctor later or answer y next time.'
            return
        }
        if (-not $DryRun) { Write-LayaSmokeFile $smoke }
        $rc = Invoke-Ext $py @('-I', $smoke)
        if ($rc -ne 0) { Say-Warn 'The test failed (network blocked or a model/format change). Unverified from the cloud.' }
    }
}

function Wait-BonsaiHealth {
    param([int]$Seconds = 180)
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-Http $BonsaiHealth 2) { return $true }
        Start-Sleep -Seconds 3
    }
    return $false
}

function Invoke-BonsaiSmoke {
    Say 'One-prompt test against the local Bonsai server (127.0.0.1 only).'
    Say ('> POST ' + $BonsaiUrl + '/v1/chat/completions  (one short question)') 'Cyan'
    if ($DryRun) { Say '  (dry run - not executed)'; return }
    $body = '{"messages":[{"role":"user","content":"What is the capital of France? Answer in one word."}],"max_tokens":1024}'
    try {
        $r = Invoke-RestMethod -Uri 'http://127.0.0.1:8080/v1/chat/completions' -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 240
        if ($r -and $r.choices) { Say-Ok 'Bonsai answered. The server is working.' } else { Say-Warn 'The server replied but not in the expected shape.' }
    } catch {
        Say-Warn ('The test request failed: ' + $_.Exception.Message)
    }
}

function Install-Bonsai {
    Say ''
    Say '=== Part 4: Bonsai 2 27B (PrismML Bonsai-demo) - the main route ==='
    $gpu = Get-GpuFacts
    Say $gpu.Text
    $free = Get-FreeDiskGb
    if ($null -ne $free -and $free -lt $MinDiskGb) { Say-Warn ('Only ' + $free + ' GB free; this needs about ' + $MinDiskGb + ' GB. Stopping this part.'); return }
    if (-not (Get-Command git -CommandType Application -ErrorAction SilentlyContinue)) { Say-Warn 'Git is missing. Run Part 1 first.'; return }

    if (-not (Test-Path -LiteralPath (Join-Path $BonsaiDir '.git'))) {
        Say ('Next: copy the Bonsai demo from GitHub (' + $BonsaiRepoUrl + ') into ' + $BonsaiDir + ' and pin it to the exact version this script was checked against.')
        if (-not (Confirm-Step 'Download (git clone) the Bonsai demo now?')) { return }
        if (-not $DryRun -and -not (Test-Path -LiteralPath $AiDir)) { New-Item -ItemType Directory -Path $AiDir -Force | Out-Null }
        $rc = Invoke-Ext 'git' @('clone', $BonsaiRepoUrl, $BonsaiDir)
        if ($rc -ne 0) { Say-Warn 'git clone failed.'; return }
        $rc = Invoke-Ext 'git' @('-C', $BonsaiDir, 'checkout', '--detach', $BonsaiCommit)
        if ($rc -ne 0) { Say-Warn 'Could not switch to the pinned version.'; return }
    } else {
        $h = Invoke-Capture 'git' @('-C', $BonsaiDir, 'rev-parse', 'HEAD')
        if ($h.Rc -eq 0 -and $h.Out.Trim() -eq $BonsaiCommit) { Say-Ok 'Bonsai demo already present at the pinned version' }
        else { Say-Warn 'Bonsai demo is present but not at the pinned version this script was checked against. Left alone.' }
    }

    $model = Get-BonsaiModelFile
    if (-not $model) {
        Say 'Next: run the demo''s own setup.ps1 with BONSAI_MODEL=27B. It downloads (a) the model, about 7.8 GB, from huggingface.co (prism-ml/Ternary-Bonsai-2-27B-gguf),'
        Say '(b) PrismML''s special llama.cpp programs from GitHub (stock llama.cpp and Ollama cannot run Bonsai 2 files, per its README), pinned inside its script.'
        Say 'It runs in a separate PowerShell window process using this window''s script permission. Big download: can take a long time.'
        if (-not (Confirm-Step 'Run the Bonsai setup now?')) { return }
        $setup = Join-Path $BonsaiDir 'setup.ps1'
        $env:BONSAI_MODEL = '27B'
        $env:BONSAI_FAMILY = 'bonsai2'
        try { $rc = Invoke-Ext 'powershell.exe' @('-NoProfile', '-File', $setup) }
        finally {
            Remove-Item Env:\BONSAI_MODEL -ErrorAction SilentlyContinue
            Remove-Item Env:\BONSAI_FAMILY -ErrorAction SilentlyContinue
        }
        if ($rc -ne 0) { Say-Warn 'Bonsai setup reported a problem. Read the messages above. If it says scripts are disabled, paste:  Set-ExecutionPolicy RemoteSigned -Scope Process  and run again.'; return }
    } else { Say-Ok 'Bonsai model file already on disk' }

    if (Test-Http $BonsaiHealth 2) { Say-Ok ('Bonsai server already running at ' + $BonsaiUrl); Invoke-BonsaiSmoke; return }
    Say ('Next: start the Bonsai server in its own window. It listens on this PC only (127.0.0.1) and is reachable at ' + $BonsaiUrl + '. Close that window to stop it.')
    if (-not (Confirm-Step 'Start the Bonsai server now?')) { return }
    $start = Join-Path $BonsaiDir 'scripts\start_llama_server.ps1'
    $env:BONSAI_MODEL = '27B'
    $env:BONSAI_FAMILY = 'bonsai2'
    Say ('> Start-Process powershell.exe -ArgumentList -NoProfile -NoExit -File ' + $start) 'Cyan'
    try {
        if ($DryRun) { Say '  (dry run - not executed)' }
        else { Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-NoExit', '-File', ('"' + $start + '"')) }
    } finally {
        Remove-Item Env:\BONSAI_MODEL -ErrorAction SilentlyContinue
        Remove-Item Env:\BONSAI_FAMILY -ErrorAction SilentlyContinue
    }
    if ($DryRun) { Invoke-BonsaiSmoke; return }
    Say 'Waiting for the server (loading a 27B model can take a few minutes)...'
    if (Wait-BonsaiHealth 240) { Say-Ok ('Server is up: ' + $BonsaiUrl); Invoke-BonsaiSmoke }
    else { Say-Warn 'The server did not answer within 4 minutes. Look at the server window for an error. Run Doctor again later.' }
}

function Install-OllamaPath {
    Say ''
    Say '=== Part 5 (optional): Ollama + community Bonsai upload ==='
    Say 'WARNING: Bonsai''s own README says stock Ollama/llama.cpp cannot run Bonsai 2 files. The model below is a COMMUNITY upload'
    Say ('(' + $OllamaModel + '). I could not verify it exists or runs. If it fails, use Part 4 (the main route).')
    if (-not (Find-Ollama)) {
        if (-not (Install-WingetPackage 'Ollama.Ollama' 'Ollama' 'optional second way to run a local model')) { return }
    } else { Say-Ok 'Ollama already installed' }
    $oll = Find-Ollama
    if (-not $oll -and -not $DryRun) { Say-Warn 'Ollama installed but not found yet. Close PowerShell, open it again, and rerun.'; return }
    if (-not $oll) { $oll = 'ollama' }
    Say 'Next: download the model (ollama pull). Size not verified; likely several GB.'
    if (-not (Confirm-Step ('Pull ' + $OllamaModel + ' now?'))) { return }
    $rc = Invoke-Ext $oll @('pull', $OllamaModel)
    if ($rc -ne 0) { Say-Warn 'The pull failed. The community model may not exist under that name. Use Part 4 instead.'; return }
    if (-not (Confirm-Step 'Run a one-prompt test (ollama run) now?')) { return }
    Say ('> ' + $oll + ' run ' + $OllamaModel + ' "Reply with the single word OK"') 'Cyan'
    if ($DryRun) { Say '  (dry run - not executed)'; return }
    $r = Invoke-Capture $oll @('run', $OllamaModel, 'Reply with the single word OK')
    $txt = ($r.Out -replace '[^\x20-\x7E\r\n]', '').Trim()
    if ($txt.Length -gt 300) { $txt = $txt.Substring(0, 300) }
    if ($r.Rc -ne 0 -or $txt -match '(?i)unsupported|unknown (model|architecture)|invalid|failed to load|error') {
        Say-Warn 'Ollama could not run this model (probably an unsupported file format, as the Bonsai README warns). Use Part 4 instead.'
        Say ('  Ollama said: ' + $txt)
    } else { Say-Ok 'Ollama answered. (Quality and speed are not verified.)'; Say ('  Reply: ' + $txt) }
}

function Install-AnyDeskPart {
    Say ''
    Say '=== Part 6 (optional): AnyDesk ==='
    if (-not (Find-AnyDesk)) {
        if (-not (Install-WingetPackage 'AnyDesk.AnyDesk' 'AnyDesk' 'remote screen access to this PC')) { return }
    } else { Say-Ok 'AnyDesk already installed' }
    Say ''
    Say 'This script NEVER sets an unattended-access password. That password is a credential, so you set it yourself:'
    Say '  1. Open AnyDesk on this PC.'
    Say '  2. Click the menu (three lines, top right) then Settings, then Security.'
    Say '  3. Click "Unlock Security Settings" (Windows may ask permission).'
    Say '  4. Under Interactive Access / Unattended Access, turn on unattended access and type a long, unique password.'
    Say '  5. Keep that password in your password manager. Never paste it into chat, the dashboard or this repo.'
    Say '  6. Your AnyDesk ID is the number shown on the main AnyDesk screen ("This Desk").'
    Say 'The exact menu wording changes between AnyDesk versions; not verified here against your version.'
}

function Install-TailscalePart {
    Say ''
    Say '=== Part 7 (optional): Tailscale (private network for Orca pairing) ==='
    if (-not (Find-Tailscale)) {
        if (-not (Install-WingetPackage 'Tailscale.Tailscale' 'Tailscale' 'a private network between your own devices')) { return }
    } else { Say-Ok 'Tailscale already installed' }
    Say 'Then sign in yourself: click the Tailscale icon near the clock, choose Log in, and use your own account in the browser.'
    Say 'This script never handles the sign-in or any auth key.'
}

function Invoke-Install {
    Say 'ALIENWARE install - every change asks first. Press Enter (or n) to skip anything.'
    if ($DryRun) { Say 'DRY RUN: nothing will be changed. Commands below are what WOULD run.' 'Yellow' }
    else { Say ('A log of what happened (never secrets) goes to: ' + $LogDir) }
    $gpu = Get-GpuFacts
    $free = Get-FreeDiskGb
    $ram = Get-RamGb
    Say ''
    Say ('GPU: ' + $gpu.Text)
    if ($null -ne $ram) { Say ('RAM: ' + $ram + ' GB') }
    if ($null -ne $free) {
        Say ('Free disk: ' + $free + ' GB (need ' + $MinDiskGb + ' GB)')
        if ($free -lt $MinDiskGb) {
            Say-Warn 'Not enough free disk for everything.'
            if (-not (Confirm-Step 'Continue anyway?')) { return }
        }
    }
    if (Test-Selected 'Prereqs') { Install-Prereqs }
    if (Test-Selected 'Orca') { Install-Orca }
    if (Test-Selected 'Laya') { Install-Laya }
    if (Test-Selected 'Bonsai') { Install-Bonsai }
    if (Test-Selected 'Ollama') { Install-OllamaPath }
    if (Test-Selected 'AnyDesk') { Install-AnyDeskPart }
    if (Test-Selected 'Tailscale') { Install-TailscalePart }
    Say ''
    Say 'Done. Check the result with:   .\alienware-setup.ps1 -Action Doctor'
    Say 'Then send the status line to the Command Deck:   .\alienware-setup.ps1 -Action Report'
}

# ----------------------------------------------------------------------------------------------
# OrcaServe / OrcaPair (port of orca-remote.sh guard rails)
# ----------------------------------------------------------------------------------------------
function ConvertTo-PlainText {
    param([System.Security.SecureString]$Secure)
    $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b) }
}

function Invoke-OrcaServe {
    if ($GrantDesktopControl) {
        Say 'REFUSED: granting desktop control lets a paired client drive this PC''s screen. This script never allows it.' 'Red'
        return 2
    }
    $orca = Find-Orca
    if (-not $orca) { Say 'orca is not on PATH. Install Orca first (Install, part Orca). Nothing started.' 'Yellow'; return 1 }
    $addr = $Address
    if (-not $addr) {
        $cands = @(Get-LanCandidates)
        Say 'Which address should the OTHER device use to reach this PC? Private networks only.'
        for ($i = 0; $i -lt $cands.Count; $i++) { Say ('  ' + ($i + 1) + ') ' + $cands[$i]) }
        Say '  or type a private IP / name.local / name.ts.net. Public addresses are refused.'
        if ($DryRun) { Say 'DRY-RUN would: ask for an address, then run: orca serve --pairing-address <address>'; return 0 }
        $pick = ''
        try { $pick = [string](Read-Host 'Address') } catch { $pick = '' }
        $pick = $pick.Trim()
        $n = 0
        if ([int]::TryParse($pick, [ref]$n) -and $n -ge 1 -and $n -le $cands.Count) { $addr = $cands[$n - 1] } else { $addr = $pick }
    }
    if (-not (Test-PrivateAddress $addr)) {
        Say ('REFUSED: ''' + $addr + ''' is not a private address (home LAN, Tailscale 100.64/10, .local, .ts.net).') 'Red'
        return 2
    }
    $args2 = @('serve', '--pairing-address', $addr)
    if ($Port -gt 0) { $args2 += @('--port', [string]$Port) }
    if ($Phone) { $args2 += '--mobile-pairing' }
    $shown = '> orca'
    foreach ($a in $args2) { $shown = $shown + ' ' + $a }
    if ($DryRun) { Say ('DRY-RUN would run in the foreground: ' + $shown.Substring(2) + '   (no desktop-control grant)'); return 0 }
    if ([Console]::IsOutputRedirected -or [Console]::IsErrorRedirected) {
        Say 'REFUSED: output is not a normal console window. The pairing link must print only to a console, never to a file or pipe.' 'Red'
        return 2
    }
    Say 'The server prints a pairing link in THIS window. It is a SECRET (control of this PC''s Orca agents). Show it only to your own other device.'
    Say ('Advertising ' + $addr + '. Stop the server with Ctrl+C - that also ends the offer.')
    Say 'Windows may ask to allow Orca through the firewall the first time. Choose PRIVATE networks only, never Public.'
    Say 'Keep the PC awake while serving (Settings > System > Power). This script does not change power settings.'
    if (-not (Confirm-Step 'Start the Orca server on this PC now?')) { return 0 }
    Say $shown 'Cyan'
    $p = Start-Process -FilePath $orca -ArgumentList $args2 -NoNewWindow -Wait -PassThru
    Say ('orca serve ended (exit ' + $p.ExitCode + ').')
    return 0
}

function Invoke-OrcaPair {
    $orca = Find-Orca
    if (-not $orca) { Say 'orca is not on PATH. Nothing done.' 'Yellow'; return 1 }
    if ($DryRun) {
        Say 'DRY-RUN would: ask a name, ask y/N, read the other device''s link with a hidden prompt, run: orca environment add --name <name> --pairing-code [hidden]'
        return 0
    }
    Say 'Pair ONLY over your home network or your own Tailscale. The link is a secret; paste it only at the hidden prompt below.'
    $name = ''
    try { $name = [string](Read-Host 'Name for the other device (a-z, 0-9, -)') } catch { $name = '' }
    $name = $name.Trim()
    if ($name -cnotmatch '^[a-z0-9][a-z0-9-]{0,29}$') { Say 'Bad name (use a-z, 0-9 and -, up to 30 characters). Nothing saved.' 'Red'; return 2 }
    if (-not (Confirm-Step ('Save ''' + $name + ''' as a paired Orca environment on this PC?'))) { return 0 }
    $secure = Read-Host 'Paste the pairing link (hidden, nothing will show)' -AsSecureString
    $code = ConvertTo-PlainText $secure
    $secure = $null
    if ($code -cnotmatch '^orca://pair\?code=\S+$') {
        $code = $null
        Say 'That is not an Orca pairing link. Nothing saved.' 'Red'
        return 2
    }
    Say ('> orca environment add --name ' + $name + ' --pairing-code [hidden]') 'Cyan'
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $rc = -1
    try {
        $global:LASTEXITCODE = 0
        & $orca environment add --name $name --pairing-code $code 2>&1 | Out-Null
        $rc = $global:LASTEXITCODE
    } catch { $rc = -1 } finally { $ErrorActionPreference = $prev }
    $code = $null
    if ($rc -eq 0) { Say ('Paired as ''' + $name + '''. Try:  orca status') 'Green'; return 0 }
    Say ('orca refused the pairing (exit ' + $rc + '). Output withheld on purpose. Check the link is current and the other device is serving.') 'Red'
    return 1
}

# ----------------------------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------------------------
$exitCode = 0
switch ($Action) {
    'Report' { Invoke-Report }
    'Doctor' { Invoke-Doctor; if ($script:Fails -gt 0) { $exitCode = 1 } }
    'Install' { Start-Log; Invoke-Install }
    'OrcaServe' { Start-Log; $exitCode = [int](Invoke-OrcaServe | Select-Object -Last 1) }
    'OrcaPair' { Start-Log; $exitCode = [int](Invoke-OrcaPair | Select-Object -Last 1) }
}
exit $exitCode
