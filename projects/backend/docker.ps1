# IoTC25 Docker Management Script
# ================================

param(
    [Parameter(Position=0)]
    [ValidateSet("up", "down", "restart", "logs", "status", "simple", "full")]
    [string]$Action = "full"
)

function Show-Usage {
    Write-Host ""
    Write-Host "IoTC25 Docker Management Script" -ForegroundColor Green
    Write-Host "===============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\docker.ps1 [action]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Cyan
    Write-Host "  full     - Start full version with nginx+SSL (default)" -ForegroundColor White
    Write-Host "  simple   - Start simple version (HTTP only)" -ForegroundColor White
    Write-Host "  up       - Same as full" -ForegroundColor White
    Write-Host "  down     - Stop all services" -ForegroundColor White
    Write-Host "  restart  - Restart current services" -ForegroundColor White
    Write-Host "  logs     - Show nginx logs" -ForegroundColor White
    Write-Host "  status   - Show containers status" -ForegroundColor White
    Write-Host ""
}

switch ($Action) {
    "full" {
        Write-Host "Starting IoTC25 FULL services (nginx+SSL)..." -ForegroundColor Green
        docker-compose down --remove-orphans | Out-Null
        docker-compose up -d --remove-orphans
        Write-Host ""
        Write-Host "FULL Services started!" -ForegroundColor Green
        Write-Host "HTTP:  http://localhost:8136/docs" -ForegroundColor Cyan
        Write-Host "HTTPS: https://localhost:8118/docs" -ForegroundColor Cyan
    }
    
    "simple" {
        Write-Host "Starting IoTC25 SIMPLE services (HTTP only)..." -ForegroundColor Green
        docker-compose -f docker-compose.simple.yaml down --remove-orphans | Out-Null
        docker-compose down --remove-orphans | Out-Null
        docker-compose -f docker-compose.simple.yaml up -d --remove-orphans
        Write-Host ""
        Write-Host "SIMPLE Services started!" -ForegroundColor Green
        Write-Host "HTTP: http://localhost:8136/docs" -ForegroundColor Cyan
    }
    
    "up" {
        Write-Host "Starting IoTC25 FULL services (nginx+SSL)..." -ForegroundColor Green
        docker-compose down --remove-orphans | Out-Null
        docker-compose up -d --remove-orphans
        Write-Host ""
        Write-Host "FULL Services started!" -ForegroundColor Green
        Write-Host "HTTP:  http://localhost:8136/docs" -ForegroundColor Cyan
        Write-Host "HTTPS: https://localhost:8118/docs" -ForegroundColor Cyan
    }
    
    "down" {
        Write-Host "Stopping ALL IoTC25 services..." -ForegroundColor Yellow
        docker-compose down --remove-orphans | Out-Null
        docker-compose -f docker-compose.simple.yaml down --remove-orphans | Out-Null
        Write-Host "All services stopped!" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "Restarting IoTC25 services..." -ForegroundColor Yellow
        docker-compose down --remove-orphans | Out-Null
        docker-compose -f docker-compose.simple.yaml down --remove-orphans | Out-Null
        docker-compose up -d --remove-orphans
        Write-Host "Services restarted!" -ForegroundColor Green
        Write-Host "HTTP:  http://localhost:8136/docs" -ForegroundColor Cyan
        Write-Host "HTTPS: https://localhost:8118/docs" -ForegroundColor Cyan
    }
    
    "logs" {
        $nginxContainer = docker ps --filter "name=nginx-proxy" --format "{{.Names}}" | Select-Object -First 1
        if ($nginxContainer) {
            Write-Host "Nginx proxy logs:" -ForegroundColor Cyan
            docker logs $nginxContainer --tail 20
        } else {
            Write-Host "No nginx container found (probably running simple version)" -ForegroundColor Yellow
        }
    }
    
    "status" {
        Write-Host "Container status:" -ForegroundColor Cyan
        $containers = docker ps --filter "name=ass_server"
        if ($containers.Count -gt 1) {
            docker ps --filter "name=ass_server"
        } else {
            Write-Host "No containers running" -ForegroundColor Yellow
        }
    }
    
    default {
        Show-Usage
    }
}
