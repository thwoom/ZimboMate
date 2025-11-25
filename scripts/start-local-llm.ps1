param(
  [switch]$SkipDevServer
)

function Assert-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Error "Required command '$Name' is not available in PATH."
    exit 1
  }
}

Assert-Command docker
Assert-Command npm

$modelsDir = Join-Path $PSScriptRoot '..\infra\local-llm\models'
$requiredModels = @(
  'qwen2.5-7b-instruct-q4_k_m.gguf',
  'mistral-7b-instruct-v0.2-q4_k_m.gguf'
)
foreach ($model in $requiredModels) {
  $modelPath = Join-Path $modelsDir $model
  if (-not (Test-Path $modelPath)) {
    Write-Error "Missing model file: $modelPath`nDownload the GGUF referenced in infra/local-llm/models/README.md before running this script."
    exit 1
  }
}

$composeFile = Join-Path $PSScriptRoot '..\infra\local-llm\docker-compose.yml'
if (-not (Test-Path $composeFile)) {
  Write-Error "Cannot find docker-compose file at $composeFile"
  exit 1
}

Write-Host 'Starting local LLM containers via docker compose...' -ForegroundColor Cyan
docker compose -f $composeFile up -d | Out-Null

function Wait-ForEndpoint {
  param(
    [string]$Name,
    [string]$Url,
    [int]$TimeoutSeconds = 180
  )
  $stopWatch = [System.Diagnostics.Stopwatch]::StartNew()
  while ($stopWatch.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
    try {
      $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 10
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
        Write-Host "$Name is ready at $Url" -ForegroundColor Green
        return $true
      }
    } catch {
      Start-Sleep -Seconds 3
    }
  }
  Write-Warning "$Name did not become ready within $TimeoutSeconds seconds."
  return $false
}

$toolsReady = Wait-ForEndpoint -Name 'Qwen tool runtime' -Url 'http://localhost:11434/v1/models'
$narratorReady = Wait-ForEndpoint -Name 'Narration runtime' -Url 'http://localhost:11435/v1/models'

if (-not $SkipDevServer) {
  if (-not $toolsReady) {
    Write-Warning 'Tool runtime is not reachable; Chronicle will likely fail.'
  }
  if (-not $narratorReady) {
    Write-Warning 'Narration runtime is not reachable; narration will fall back to tool output.'
  }
  $env:VITE_LLM_RUNTIME = 'local'
  $env:VITE_LOCAL_OPENAI_BASE_URL = 'http://localhost:11434/v1'
  $env:VITE_LOCAL_RULES_MODEL = 'qwen2.5-7b-tools'
  $env:VITE_LOCAL_OPENAI_VOICE_BASE_URL = 'http://localhost:11435/v1'
  $env:VITE_LOCAL_VOICE_MODEL = 'mistral-7b-narrator'
  Write-Host 'Launching Chronicle dev server with local LLM env vars...' -ForegroundColor Cyan
  npm run dev
}
