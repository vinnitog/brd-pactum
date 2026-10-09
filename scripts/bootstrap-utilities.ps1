param(
    [ValidateSet('install', 'verify', 'rollback')]
    [string]$Action = 'install',
    [string]$UtilitiesPath
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot '.techtogs-utilities.json'
if (-not (Test-Path -LiteralPath $manifestPath)) { throw 'Manifesto .techtogs-utilities.json ausente.' }
$consumerManifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
if (-not $UtilitiesPath) { $UtilitiesPath = $env:TECHTOGS_UTILITIES_PATH }
if (-not $UtilitiesPath -and (Test-Path -LiteralPath (Join-Path $projectRoot '.tmp/techtogs-utilities/catalog.lock.json'))) { $UtilitiesPath = Join-Path $projectRoot '.tmp/techtogs-utilities' }
if (-not $UtilitiesPath) { $UtilitiesPath = Join-Path (Split-Path -Parent $projectRoot) 'techtogs-utilities' }
if (-not (Test-Path -LiteralPath (Join-Path $UtilitiesPath 'catalog.lock.json'))) {
    throw 'Clone techtogs-utilities ao lado deste projeto ou informe -UtilitiesPath / TECHTOGS_UTILITIES_PATH. Consulte SKILLS_SHARED.md.'
}
$UtilitiesPath = (Resolve-Path -LiteralPath $UtilitiesPath).Path
if ($consumerManifest.libraryCommit) {
    $actualCommit = (& git -C $UtilitiesPath rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or $actualCommit -ne $consumerManifest.libraryCommit) {
        throw ('Checkout utilities diferente do commit fixado: ' + $consumerManifest.libraryCommit + '. Use um clone separado dessa versao para preservar outros consumidores.')
    }
}
& node (Join-Path $UtilitiesPath 'scripts\utilities.mjs') $Action --project $projectRoot
if ($LASTEXITCODE -ne 0) { throw ('Falha utilities: ' + $Action) }
