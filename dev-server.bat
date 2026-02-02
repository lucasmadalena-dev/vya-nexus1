@echo off
REM ============================================================================
REM Vya Nexus - Script para rodar o SERVIDOR (Backend) no Windows
REM ============================================================================
REM Uso: Duplo-clique ou execute via PowerShell
REM Porta padrão: 3000
REM ============================================================================

echo.
echo ============================================================================
echo  Vya Nexus - Servidor Backend (Node.js + Express)
echo ============================================================================
echo.

REM Verificar se pnpm está instalado
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] pnpm nao encontrado. Instale com: npm install -g pnpm
    pause
    exit /b 1
)

REM Verificar se .env existe
if not exist .env (
    echo [AVISO] Arquivo .env nao encontrado na raiz do projeto!
    echo.
    echo Crie um arquivo .env com as variaveis necessarias:
    echo   - DATABASE_URL
    echo   - VITE_APP_ID
    echo   - VITE_OAUTH_PORTAL_URL
    echo   - OAUTH_SERVER_URL
    echo   - Etc...
    echo.
    echo Veja WINDOWS_ENV_SETUP.md para mais detalhes.
    echo.
    pause
    exit /b 1
)

REM Definir variáveis de ambiente
set NODE_ENV=development
set PORT=3000

echo [INFO] Iniciando servidor em http://localhost:%PORT%
echo [INFO] Variáveis de ambiente carregadas do .env
echo.

REM Executar o servidor
pnpm run dev:server

pause
