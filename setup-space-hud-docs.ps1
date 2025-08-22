param(
    [Parameter(Mandatory=$false)]
    [string]$RepoUrl,              # Optional: https/ssh URL to clone. If omitted, use -RepoPath.

    [Parameter(Mandatory=$false)]
    [string]$RepoPath,             # Optional: path to an existing local repo. If omitted and RepoUrl is set, will clone to a temp folder.

    [Parameter(Mandatory=$true)]
    [string]$FilesPath,            # REQUIRED: folder containing the downloaded files from ChatGPT (SPACE_HUD_PLAN.md, TASKS.md, README_SNIPPET.md, docs/adrs/*, scripts/adr-check.js, .github/workflows/adr-check.yml)

    [switch]$Commit,               # If set, will create a branch, commit, and attempt to push
    [string]$BranchName = "docs/space-hud-setup",
    [switch]$Force                 # Overwrite existing files without prompting
)

# Ensure PowerShell 7+ recommended features behave consistently
$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "ℹ  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "✓  $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "!  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "✗  $msg" -ForegroundColor Red }

function Require-Tool($name) {
    $found = Get-Command $name -ErrorAction SilentlyContinue
    if (-not $found) {
        Write-Err "Required tool '$name' not found in PATH."
        throw "Missing dependency: $name"
    }
}

function Ensure-Dir($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
    }
}

function Copy-File($source, $dest) {
    if (-not (Test-Path $source)) { throw "Source file not found: $source" }
    $destDir = Split-Path -Parent $dest
    Ensure-Dir $destDir
    if ((Test-Path $dest) -and -not $Force) {
        Write-Warn "Exists (skip): $dest (use -Force to overwrite)"
        return
    }
    Copy-Item -Path $source -Destination $dest -Force
    Write-Ok "Placed: $dest"
}

function Append-Or-Create-Readme($snippetPath, $readmePath) {
    if (-not (Test-Path $snippetPath)) { throw "README snippet not found: $snippetPath" }
    $snippet = Get-Content -Raw -Path $snippetPath
    if (Test-Path $readmePath) {
        Add-Content -Path $readmePath -Value "`n`n<!-- Space-HUD Integration -->`n$snippet"
        Write-Ok "Appended README snippet -> $readmePath"
    } else {
        Set-Content -Path $readmePath -Value $snippet
        Write-Ok "Created README.md with snippet"
    }
}

# 1) Validate inputs and tools
Require-Tool git

# 2) Determine repo path
$tempClone = $false
if ([string]::IsNullOrWhiteSpace($RepoPath)) {
    if ([string]::IsNullOrWhiteSpace($RepoUrl)) {
        throw "Provide -RepoPath (existing local repo) OR -RepoUrl (to clone)."
    }
    $RepoPath = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("space-hud-" + [guid]::NewGuid().ToString("N"))
    Write-Info "Cloning $RepoUrl -> $RepoPath"
    git clone $RepoUrl $RepoPath | Out-Null
    $tempClone = $true
} else {
    if (-not (Test-Path $RepoPath)) { throw "RepoPath does not exist: $RepoPath" }
}

# 3) Verify repo
Set-Location $RepoPath
try {
    git rev-parse --is-inside-work-tree | Out-Null
} catch {
    throw "Path is not a git repository: $RepoPath"
}

# 4) Create branch if committing
if ($Commit) {
    Write-Info "Creating branch $BranchName"
    git checkout -b $BranchName 2>$null | Out-Null
}

# 5) Map sources (downloaded files folder)
$srcRoot = (Resolve-Path $FilesPath).Path

# Expectation: files are placed exactly as exported by ChatGPT or gathered by you:
#   SPACE_HUD_PLAN.md
#   TASKS.md
#   README_SNIPPET.md
#   docs/adrs/README.md
#   docs/adrs/0000-template.md
#   docs/adrs/0001-tailwind-panda-coexistence.md
#   scripts/adr-check.js
#   .github/workflows/adr-check.yml
#
# You may rename adr-check.yml to adr-enforcement.yml at destination.

$expect = @(
    "SPACE_HUD_PLAN.md",
    "TASKS.md",
    "README_SNIPPET.md",
    "docs/adrs/README.md",
    "docs/adrs/0000-template.md",
    "docs/adrs/0001-tailwind-panda-coexistence.md",
    "scripts/adr-check.js",
    ".github/workflows/adr-check.yml"
)

foreach ($rel in $expect) {
    $p = Join-Path $srcRoot $rel
    if (-not (Test-Path $p)) {
        Write-Warn "Expected file missing in FilesPath: $rel"
    }
}

# 6) Create required destination directories
Ensure-Dir (Join-Path $RepoPath "docs/adrs")
Ensure-Dir (Join-Path $RepoPath ".github/workflows")
Ensure-Dir (Join-Path $RepoPath "scripts")

# 7) Copy files to repo
Copy-File (Join-Path $srcRoot "SPACE_HUD_PLAN.md") (Join-Path $RepoPath "SPACE_HUD_PLAN.md")
Copy-File (Join-Path $srcRoot "TASKS.md") (Join-Path $RepoPath "TASKS.md")

# README handling: append or create
Append-Or-Create-Readme (Join-Path $srcRoot "README_SNIPPET.md") (Join-Path $RepoPath "README.md")

# ADRs
Copy-File (Join-Path $srcRoot "docs/adrs/README.md") (Join-Path $RepoPath "docs/adrs/README.md")
Copy-File (Join-Path $srcRoot "docs/adrs/0000-template.md") (Join-Path $RepoPath "docs/adrs/0000-template.md")
Copy-File (Join-Path $srcRoot "docs/adrs/0001-tailwind-panda-coexistence.md") (Join-Path $RepoPath "docs/adrs/0001-tailwind-panda-coexistence.md")

# CI + script
# We rename the workflow file at destination to a clearer name
Copy-File (Join-Path $srcRoot ".github/workflows/adr-check.yml") (Join-Path $RepoPath ".github/workflows/adr-enforcement.yml")
Copy-File (Join-Path $srcRoot "scripts/adr-check.js") (Join-Path $RepoPath "scripts/adr-check.js")

# 8) Optionally commit and push
if ($Commit) {
    git add SPACE_HUD_PLAN.md TASKS.md README.md docs/adrs .github/workflows/adr-enforcement.yml scripts/adr-check.js
    git commit -m "docs(ci): add Space-HUD spec, tasks, ADR framework, and ADR enforcement workflow"
    try {
        git push -u origin $BranchName
        Write-Ok "Pushed branch $BranchName to origin."
    } catch {
        Write-Warn "Push failed. You may need to set up credentials or create the remote."
    }
}

Write-Ok "Done. Review changes in: $RepoPath"
if ($tempClone) {
    Write-Info "This was a temporary clone. If you want to keep it, move the folder. Otherwise, delete it when done."
}
