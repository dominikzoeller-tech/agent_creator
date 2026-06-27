$ErrorActionPreference = "Continue"

Write-Host "======================================"
Write-Host " Privacy-First Stack Health Check"
Write-Host "======================================"
Write-Host ""

Write-Host "1) Docker Compose Status"
docker compose -f docker-compose.internal.yml ps
Write-Host ""

Write-Host "2) API Health: http://localhost:7071/health"
try {
  $apiHealth = Invoke-RestMethod -Uri "http://localhost:7071/health" -Method GET -TimeoutSec 10
  if ($apiHealth.ok -eq $true -and $apiHealth.status -eq "ok") {
    Write-Host "API: OK" -ForegroundColor Green
    Write-Host "Service: $($apiHealth.service)"
    Write-Host "Port: $($apiHealth.port)"
  } else {
    Write-Host "API: Antwort erhalten, aber unerwarteter Inhalt" -ForegroundColor Yellow
    $apiHealth | ConvertTo-Json -Depth 10
  }
} catch {
  Write-Host "API: NICHT erreichbar" -ForegroundColor Red
  Write-Host $_.Exception.Message
}
Write-Host ""

Write-Host "3) Frontend Health: http://localhost:3000"
try {
  $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 10
  if ($frontendResponse.StatusCode -ge 200 -and $frontendResponse.StatusCode -lt 400) {
    Write-Host "Frontend: OK" -ForegroundColor Green
    Write-Host "StatusCode: $($frontendResponse.StatusCode)"
  } else {
    Write-Host "Frontend: Unerwarteter StatusCode $($frontendResponse.StatusCode)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Frontend: NICHT erreichbar" -ForegroundColor Red
  Write-Host $_.Exception.Message
}
Write-Host ""

Write-Host "4) Wichtige URLs"
Write-Host "- http://localhost:3000"
Write-Host "- http://localhost:3000/logs"
Write-Host "- http://localhost:3000/analytics"
Write-Host "- http://localhost:3000/system"
Write-Host "- http://localhost:7071/health"
Write-Host ""
Write-Host "Health Check abgeschlossen."
