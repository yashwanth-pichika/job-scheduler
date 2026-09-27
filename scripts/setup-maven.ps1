$ErrorActionPreference = "Stop"
$toolsDir = "C:\Users\YASHWANTH\Desktop\distributed-job-scheduler\.tools"
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
}

$mavenDir = Join-Path $toolsDir "apache-maven-3.9.9"
$zipPath = Join-Path $toolsDir "maven.zip"

if (-not (Test-Path $mavenDir)) {
    Write-Host "Downloading Apache Maven 3.9.9 from Maven Central CDN..."
    $ProgressPreference = 'SilentlyContinue'
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip" -OutFile $zipPath
    Write-Host "Extracting Apache Maven..."
    Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
    Remove-Item $zipPath -Force
}

$mvnBin = Join-Path $mavenDir "bin"
Write-Host "Maven installed at: $mvnBin"
& "$mvnBin\mvn.cmd" -version
