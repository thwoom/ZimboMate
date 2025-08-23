# check-motion-legacy.ps1
# Scan source for legacy Motion imports/calls (glide, timeline)
# This is the source of truth for CI guardrails

$importPattern = @'
import\s*{[^}]*\b(glide|timeline)\b[^}]*}\s*from\s*["']motion["']
'@

$callPattern = @'
\b(glide|timeline)\s*\(
'@

Write-Host "[check-motion-legacy] Scanning src/ for legacy Motion API..."

$hits1 = Get-ChildItem .\src -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
         Where-Object { 
           $_.FullName -notmatch '\\__tests__\\' -and 
           $_.FullName -notmatch '\\examples\\' -and
           $_.Name -ne 'shim-assert.ts'
         } |
         Select-String -Pattern $importPattern -AllMatches

$hits2 = Get-ChildItem .\src -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
         Where-Object { 
           $_.FullName -notmatch '\\__tests__\\' -and 
           $_.FullName -notmatch '\\examples\\' -and
           $_.Name -ne 'shim-assert.ts'
         } |
         Select-String -Pattern $callPattern -AllMatches

$allHits = @($hits1 + $hits2)

if ($allHits) {
    Write-Host "[check-motion-legacy] Legacy Motion API found:"
    $allHits | ForEach-Object { 
        Write-Host "  $($_.Path):$($_.LineNumber): $($_.Line.Trim())" 
    }
    Write-Error "[check-motion-legacy] Legacy Motion API found in src. Use Motion v12 patterns."
    exit 1
} else {
    Write-Host "[check-motion-legacy] ✅ src/ clean - no legacy Motion API found"
    exit 0
}
