# CI script to detect legacy Motion API usage
# Run with: pwsh scripts/check-motion-legacy.ps1

Write-Host "🔍 Scanning for legacy Motion API usage..." -ForegroundColor Yellow

$errors = @()

# Check for legacy imports
$legacyImports = Get-ChildItem .\src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Select-String -Pattern 'import\s*{[^}]*\b(glide|timeline)\b[^}]*}\s*from\s*["'']motion["'']' -AllMatches

if ($legacyImports) {
    $errors += "❌ Found legacy Motion imports:"
    $legacyImports | ForEach-Object { $errors += "   $($_.Filename):$($_.LineNumber) - $($_.Line)" }
}

# Check for direct glide() calls
$glideCalls = Get-ChildItem .\src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Select-String -Pattern "\bglide\s*\(" -AllMatches

if ($glideCalls) {
    $errors += "❌ Found glide() calls:"
    $glideCalls | ForEach-Object { $errors += "   $($_.Filename):$($_.LineNumber) - $($_.Line)" }
}

# Check for direct timeline() calls
$timelineCalls = Get-ChildItem .\src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Select-String -Pattern "\btimeline\s*\(" -AllMatches

if ($timelineCalls) {
    $errors += "❌ Found timeline() calls:"
    $timelineCalls | ForEach-Object { $errors += "   $($_.Filename):$($_.LineNumber) - $($_.Line)" }
}

# Check for old spring usage patterns
$oldSpringUsage = Get-ChildItem .\src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | 
    Select-String -Pattern "easing:\s*spring\s*\(" -AllMatches

if ($oldSpringUsage) {
    $errors += "❌ Found old spring easing usage:"
    $oldSpringUsage | ForEach-Object { $errors += "   $($_.Filename):$($_.LineNumber) - $($_.Line)" }
}

if ($errors.Count -gt 0) {
    Write-Host "`n🚨 Legacy Motion API usage detected:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    Write-Host "`n💡 Migration needed: Replace with Motion v12 patterns" -ForegroundColor Yellow
    Write-Host "   - glide() → { type: inertia, ... }" -ForegroundColor Cyan
    Write-Host "   - timeline() → animate(sequence)" -ForegroundColor Cyan
    Write-Host "   - easing: spring() → { type: spring, ... }" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ No legacy Motion API usage found!" -ForegroundColor Green
    Write-Host "🎉 All code uses Motion v12 patterns" -ForegroundColor Green
    exit 0
}
