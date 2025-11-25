param()
function Assert-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "Required command '$Name' is not available in PATH."
    exit 1
  }
}
Assert-Command docker
$composeFile = Join-Path $PSScriptRoot '..\infra\local-llm\docker-compose.yml'
if (-not (Test-Path $composeFile)) {
  Write-Error "Cannot find docker-compose file at $composeFile"
  exit 1
}
Write-Host 'Stopping local LLM containers...' -ForegroundColor Cyan
docker compose -f $composeFile down
