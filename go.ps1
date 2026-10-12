<#
 go.ps1 - Steven's ONE paste on the Alienware PC. Asks one question, then runs the two Windows setups in order.
   powershell -ExecutionPolicy Bypass -File go.ps1             asks once; Enter = preview only
   powershell -ExecutionPolicy Bypass -File go.ps1 -Preview    changes nothing
 Runs: git pull of this branch, integrations\alienware\alienware-setup.ps1 (Ollama, Bonsai 27B, Orca, Laya, AnyDesk
 check) and integrations\agent-os\install-alienware.ps1 -Apply. Never signs in, pairs, stores a key or changes the
 execution policy for the machine (only this process). Each setup keeps its own safety rules and prompts.
#>
param([switch]$Preview)
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
$Branch = 'claude/gracious-newton-4hpfco'
Write-Host ("Steven's one paste - " + $env:COMPUTERNAME + " - " + (Get-Date))
if (-not $Preview) {
    $a = Read-Host 'Do everything safe on this PC now? It installs only for your user and never signs in, pairs or pays. [y/N]'
    if ($a -notmatch '^(y|yes)$') { Write-Host 'Preview only (you answered no).'; $Preview = $true }
}
$done = @(); $failed = @()
function Step($name, $cmd) {
    Write-Host ''; Write-Host ("== " + $name + " ==")
    if ($Preview) { Write-Host ("  would run: " + $cmd); return }
    & cmd /c $cmd
    if ($LASTEXITCODE -eq 0) { Write-Host '  done'; $script:done += $name } else { Write-Host '  did not finish'; $script:failed += $name }
}
Step '1 Get today''s files' ("git fetch origin " + $Branch + " && git checkout " + $Branch + " && git pull --ff-only origin " + $Branch)
Step '2 Alienware setup (Ollama, Bonsai, Orca, Laya)' 'powershell -ExecutionPolicy Bypass -File integrations\alienware\alienware-setup.ps1'
Step '3 Agent OS on this PC' 'powershell -ExecutionPolicy Bypass -File integrations\agent-os\install-alienware.ps1 -Apply'
Step '4 The brain self-test' 'python bin\brain os check'
Write-Host ''; Write-Host '================ REPORT ================'
if ($done.Count) { Write-Host 'Done:'; $done | ForEach-Object { Write-Host ('  - ' + $_) } }
if ($failed.Count) { Write-Host 'Did not finish:'; $failed | ForEach-Object { Write-Host ('  - ' + $_) } }
Write-Host ''
Write-Host 'Still yours: pair Orca with the Macs (the pairing link is a secret), type the AnyDesk ID into the Computer Hub card.'
Write-Host "Copy this whole report and paste it to Claude: 'here is the go report'."
if ($failed.Count -gt 0) { exit 1 } else { exit 0 }
