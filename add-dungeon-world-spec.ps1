param(
    [Parameter(Mandatory=$false)] [string]$RepoUrl,
    [Parameter(Mandatory=$false)] [string]$RepoPath,
    [Parameter(Mandatory=$true)]  [string]$FilesPath,
    [switch]$Commit,
    [string]$BranchName = "docs/dw-spec",
    [switch]$Force
)
$ErrorActionPreference = "Stop"

function Write-Ok($m){ Write-Host "✓ $m" -ForegroundColor Green }
function Write-Info($m){ Write-Host "ℹ $m" -ForegroundColor Cyan }
function Write-Warn($m){ Write-Host "! $m" -ForegroundColor Yellow }
function Require-Tool($name){ if(-not (Get-Command $name -ErrorAction SilentlyContinue)){ throw "Missing tool: $name" } }
function Ensure-Dir($p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Force -Path $p | Out-Null } }

Require-Tool git

# Resolve repo
$temp = $false
if([string]::IsNullOrWhiteSpace($RepoPath)){
  if([string]::IsNullOrWhiteSpace($RepoUrl)){ throw "Provide -RepoPath or -RepoUrl" }
  $RepoPath = Join-Path ([System.IO.Path]::GetTempPath()) ("dw-spec-" + [guid]::NewGuid().ToString("N"))
  git clone $RepoUrl $RepoPath | Out-Null
  $temp = $true
}
Set-Location $RepoPath
git rev-parse --is-inside-work-tree | Out-Null
if($Commit){ git checkout -b $BranchName 2>$null | Out-Null }

# Copy spec
$src = Join-Path (Resolve-Path $FilesPath) "DUNGEON_WORLD_SPEC.md"
if(-not (Test-Path $src)){ throw "Not found: $src" }
$dest = Join-Path $RepoPath "DUNGEON_WORLD_SPEC.md"
Copy-Item $src $dest -Force:$Force
Write-Ok "Placed $dest"

# Append README section
$readme = Join-Path $RepoPath "README.md"
$section = @"
## Game Rules Spec
- See **DUNGEON_WORLD_SPEC.md** for the app-specific Dungeon World mechanics (rolls, XP, bonds, debilities, EoS).  
- CursorAI must read this file alongside **SPACE_HUD_PLAN.md** and **TASKS.md** before implementing rules or UI touching DW mechanics.
"@
if(Test-Path $readme){
  Add-Content -Path $readme -Value "`n`n<!-- Dungeon World Spec Link -->`n$section"
  Write-Ok "Updated README.md"
}else{
  Set-Content -Path $readme -Value "# ZimboMate`n`n$section"
  Write-Ok "Created README.md with spec link"
}

# Optionally commit
if($Commit){
  git add DUNGEON_WORLD_SPEC.md README.md
  git commit -m "docs: add Dungeon World rules spec and README link"
  try { git push -u origin $BranchName } catch { Write-Warn "Push failed; check credentials" }
}

if($temp){ Write-Info "Temp clone at $RepoPath" }
Write-Ok "Done."
