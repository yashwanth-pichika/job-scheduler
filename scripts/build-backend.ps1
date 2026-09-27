$mvnBin = "C:\Users\YASHWANTH\Desktop\distributed-job-scheduler\.tools\apache-maven-3.9.9\bin\mvn.cmd"
$backendDir = "C:\Users\YASHWANTH\Desktop\distributed-job-scheduler\backend"

Write-Host "Building Java Spring Boot Backend..." -ForegroundColor Cyan
Set-Location $backendDir
& $mvnBin clean package -DskipTests
