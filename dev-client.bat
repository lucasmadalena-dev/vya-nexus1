@echo off
REM ============================================================================
REM Vya Nexus - Script para rodar o CLIENTE (Frontend) no Windows
REM ============================================================================
REM Uso: Duplo-clique ou execute via PowerShell
REM Porta padrão: 5173 (Vite)
REM ============================================================================

echo.
echo ============================================================================
echo  Vya Nexus - Cliente Frontend (React + Vite)
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
    echo   - VITE_APP_ID
    echo   - VITE_OAUTH_PORTAL_URL
    echo   - VITE_STRIPE_PUBLISHABLE_KEY
    echo   - Etc...
    echo.
    echo Veja WINDOWS_ENV_SETUP.md para mais detalhes.
    echo.
    pause
    exit /b 1
)

REM Definir variáveis de ambiente
set NODE_ENV=development

echo [INFO] Iniciando cliente em http://localhost:5173
echo [INFO] Variaveis de ambiente carregadas do .env
echo [INFO] Certifique-se de que o servidor esta rodando em outro terminal!
echo.

REM Executar o cliente
pnpm run dev:client

pause
