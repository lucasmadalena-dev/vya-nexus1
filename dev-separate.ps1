# ============================================================================
# Vya Nexus - Script PowerShell para rodar Client e Server separadamente
# ============================================================================
# Uso:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#   .\dev-separate.ps1
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Vya Nexus - Desenvolvimento com Client e Server Separados" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se pnpm está instalado
$pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpmCheck) {
    Write-Host "[ERRO] pnpm nao encontrado. Instale com: npm install -g pnpm" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "[AVISO] Arquivo .env nao encontrado na raiz do projeto!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Crie um arquivo .env com as variaveis necessarias." -ForegroundColor Yellow
    Write-Host "Veja WINDOWS_ENV_SETUP.md para mais detalhes." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "[INFO] Iniciando Client e Server em terminais separados..." -ForegroundColor Green
Write-Host ""

# Definir variáveis de ambiente
$env:NODE_ENV = "development"

# Iniciar Server em um novo terminal PowerShell
Write-Host "[1/2] Iniciando SERVIDOR (Backend) em novo terminal..." -ForegroundColor Cyan
$serverScript = @"
`$env:NODE_ENV = 'development'
`$env:PORT = '3000'
Write-Host "[Servidor] Iniciando em http://localhost:3000" -ForegroundColor Green
pnpm run dev:server
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverScript -WindowStyle Normal

# Aguardar um pouco para o servidor iniciar
Start-Sleep -Seconds 3

# Iniciar Client em um novo terminal PowerShell
Write-Host "[2/2] Iniciando CLIENTE (Frontend) em novo terminal..." -ForegroundColor Cyan
$clientScript = @"
`$env:NODE_ENV = 'development'
Write-Host "[Cliente] Iniciando em http://localhost:5173" -ForegroundColor Green
Write-Host "[Cliente] Certifique-se de que o servidor esta rodando!" -ForegroundColor Yellow
pnpm run dev:client
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $clientScript -WindowStyle Normal

Write-Host ""
Write-Host "[OK] Dois terminais foram abertos:" -ForegroundColor Green
Write-Host "  - Terminal 1: Servidor (Backend) na porta 3000" -ForegroundColor Green
Write-Host "  - Terminal 2: Cliente (Frontend) na porta 5173" -ForegroundColor Green
Write-Host ""
Write-Host "Abra http://localhost:5173 no navegador" -ForegroundColor Cyan
Write-Host ""
Read-Host "Pressione Enter para fechar este terminal"
