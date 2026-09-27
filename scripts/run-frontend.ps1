$frontendDir = "C:\Users\YASHWANTH\Desktop\distributed-job-scheduler\frontend"
Set-Location $frontendDir

if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "Installing Frontend npm dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "Starting React Vite Dev Server on Port 5173..." -ForegroundColor Green
npm run dev
