Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = 'c:\xampp\htdocs\finalyear project\SRS Document.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.GetEntry('word/document.xml')
if ($null -ne $entry) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xmlStr = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $xmlStr -replace '<[^>]+>', ' ' | Out-File -FilePath 'c:\xampp\htdocs\finalyear project\srs_extracted.txt' -Encoding utf8
} else {
    Write-Host "Could not find word/document.xml"
}
$zip.Dispose()
