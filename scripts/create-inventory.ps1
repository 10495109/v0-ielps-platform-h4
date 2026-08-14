$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Output = Join-Path $Root 'artifacts'
New-Item -ItemType Directory -Force -Path $Output | Out-Null

$RelativeFiles = & rg --files $Root -g '!node_modules/**' -g '!.next/**' -g '!.git/**' -g '!release/**' -g '!artifacts/**'
$Rows = foreach ($Relative in $RelativeFiles) {
  $File = Get-Item -LiteralPath $Relative
  [pscustomobject]@{
    path = $File.FullName.Substring($Root.Length + 1).Replace('\\', '/')
    bytes = $File.Length
    lastWriteUtc = $File.LastWriteTimeUtc.ToString('o')
    sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $File.FullName).Hash.ToLowerInvariant()
  }
}
$Document = [ordered]@{
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
  immutableFloor = '2026-08-14'
  root = $Root
  fileCount = $Rows.Count
  files = $Rows
}
$Document | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $Output 'source-sha256-inventory.json') -Encoding utf8
