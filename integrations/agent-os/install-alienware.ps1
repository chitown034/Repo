<#
 install-alienware.ps1 - turn on the Agent OS on the Alienware PC (Windows PowerShell 5.1 or newer).
 Run once, in a normal (non-admin) PowerShell window, from the repo folder:
     powershell -ExecutionPolicy Bypass -File integrations\agent-os\install-alienware.ps1          read-only check
     powershell -ExecutionPolicy Bypass -File integrations\agent-os\install-alienware.ps1 -Apply   check, plus two safe local steps
 -Apply changes ONLY: %USERPROFILE%\bin\brain.cmd (a launcher for bin\brain) and %USERPROFILE%\.config\agent-os\config.
 It never installs an app, logs in, pairs Orca, changes the execution policy, opens a port or reads client data.
#>
param([switch]$Apply)
$ErrorActionPreference = 'Continue'
$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Ok = 0; $Warn = 0; $Bad = 0
function Ok($m)   { Write-Host ("  ok    " + $m); $script:Ok++ }
function Warn($m) { Write-Host ("  WARN  " + $m); $script:Warn++ }
function Bad($m)  { Write-Host ("  FAIL  " + $m); $script:Bad++ }
function Has($n)  { return [bool](Get-Command $n -ErrorAction SilentlyContinue) }

Write-Host ("Agent OS - " + $env:COMPUTERNAME + " - " + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))
Write-Host ("repo: " + $Repo)

Write-Host '1. Tools'
foreach ($t in @('git', 'python')) { if (Has $t) { Ok ($t + ' found') } else { Bad ($t + ' missing (install Python 3.10+ and Git for Windows)') } }
if (Has 'claude') { Ok 'Claude Code CLI found' } else { Bad 'Claude Code CLI missing - install it first (https://claude.com/claude-code)' }

Write-Host '2. The brain and the roster'
if (Has 'python') {
    $v = & python -c "import sys; print(int(sys.version_info >= (3,10)))" 2>$null
    if ($v -eq '1') {
        Ok 'python is 3.10 or newer'
        $out = & python (Join-Path $Repo 'bin\brain') os check 2>&1
        if ($LASTEXITCODE -eq 0) { Ok (($out | Select-Object -First 1) -as [string]) } else { Bad ('brain os check failed: ' + (($out | Select-Object -First 2) -join ' ')) }
    } else { Bad 'python is older than 3.10 - the brain needs 3.10 or newer' }
}

Write-Host '3. Agent files Claude Code can launch'
$ag = Join-Path $env:USERPROFILE '.claude\agents'
$manifest = Join-Path $Repo 'integrations\agent-os\agents.json'
$total = 0; $have = 0
if (Test-Path $manifest) {
    $slugs = [regex]::Matches((Get-Content $manifest -Raw), '"slug":\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
    foreach ($s in $slugs) { $total++; if (Test-Path (Join-Path $ag ($s + '.md'))) { $have++ } }
}
if ($total -eq 0) { Bad 'integrations\agent-os\agents.json missing - run: python bin\brain os write' }
elseif ($have -eq $total) { Ok ('all ' + $total + ' roster agents have a file in .claude\agents') }
else { Warn ($have.ToString() + ' of ' + $total + ' roster agents have a file in .claude\agents; the rest start as a persona skill or through their lead until the file exists') }

Write-Host '4. Orca, Laya, Jarvis'
$orca = Has 'orca'
if (-not $orca) { $orca = (Test-Path (Join-Path $env:LOCALAPPDATA 'Programs\Orca')) -or (Test-Path 'C:\Program Files\Orca') }
if ($orca) { Ok 'Orca found' } else { Warn 'Orca not found - install stablyai/orca, then rerun' }
if (Has 'laya') { Ok 'Laya found' } else { Warn 'Laya not installed - the brain routes with the same rules without it (bin\brain route)' }
if (Has 'ollama') { Ok 'Ollama found (local model for Jarvis free mode and Bonsai)' } else { Warn 'Ollama not found - run integrations\alienware\alienware-setup.ps1 first' }

if ($Apply) {
    Write-Host '5. Safe local steps (-Apply)'
    $bin = Join-Path $env:USERPROFILE 'bin'
    New-Item -ItemType Directory -Force -Path $bin | Out-Null
    $cmd = '@echo off' + "`r`n" + 'python "' + (Join-Path $Repo 'bin\brain') + '" %*' + "`r`n"
    [System.IO.File]::WriteAllText((Join-Path $bin 'brain.cmd'), $cmd, (New-Object System.Text.ASCIIEncoding))
    Ok ('wrote ' + (Join-Path $bin 'brain.cmd'))
    $cfg = Join-Path $env:USERPROFILE '.config\agent-os'
    New-Item -ItemType Directory -Force -Path $cfg | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $cfg 'config'), ('AGENT_OS_REPO=' + $Repo + "`r`n"), (New-Object System.Text.ASCIIEncoding))
    Ok 'wrote .config\agent-os\config'
    if (($env:PATH -split ';') -notcontains $bin) { Warn ('add ' + $bin + ' to your PATH (Settings > System > About > Advanced system settings > Environment Variables)') }
}

$state = Join-Path $Repo 'brain\state'
New-Item -ItemType Directory -Force -Path $state | Out-Null
$j = '{"machine":"' + $env:COMPUTERNAME + '","kind":"windows","checkedAt":"' + (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ') + '","ok":' + $Ok + ',"warn":' + $Warn + ',"fail":' + $Bad + ',"agentFiles":' + $have + ',"agentsTotal":' + $total + '}'
[System.IO.File]::WriteAllText((Join-Path $state 'agent-os-status.json'), $j, (New-Object System.Text.ASCIIEncoding))
Write-Host ''
Write-Host ("Result: " + $Ok + " ok, " + $Warn + " warnings, " + $Bad + " failures. Try it: brain os run `"prepare a VA loan scenario in Temecula`"")
if ($Bad -gt 0) { exit 1 } else { exit 0 }
