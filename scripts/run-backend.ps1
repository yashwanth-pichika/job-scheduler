$mvnBin = "C:\Users\YASHWANTH\Desktop\distributed-job-scheduler\.tools\apache-maven-3.9.9\bin\mvn.cmd"
$backendDir = "C:\Users\YASHWANTH\Desktop\distributed-job-scheduler\backend"

Write-Host "Starting Java Spring Boot Backend Server on Port 8080..." -ForegroundColor Green
Set-Location $backendDir
& $mvnBin spring-boot:run
