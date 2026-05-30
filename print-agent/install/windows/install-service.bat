@echo off
REM ============================================================================
REM  MondoPizza print-agent Windows service installer (uses NSSM)
REM
REM  Prereqs:
REM    1. Node.js LTS installed (https://nodejs.org/)
REM    2. NSSM installed (https://nssm.cc/download) — drop nssm.exe somewhere on PATH
REM    3. This repo cloned/copied locally and `npm install` run once
REM
REM  Edit the SET lines below, then run this script AS ADMINISTRATOR
REM  (right-click -> Run as administrator).
REM ============================================================================

REM ── EDIT THESE ──────────────────────────────────────────────────────────────
SET REPO_DIR=C:\Users\YOU\MondoPizza
SET NODE_EXE=C:\Program Files\nodejs\node.exe

SET CONVEX_URL=https://YOUR-DEPLOYMENT.convex.cloud
SET PRINT_AGENT_TOKEN=YOUR_SHARED_SECRET_HERE
SET QZ_PRIVATE_KEY_PATH=C:\qz-cert\private-key.pem
SET QZ_CERT_PATH=C:\qz-cert\digital-certificate.txt
REM ────────────────────────────────────────────────────────────────────────────

SET SERVICE_NAME=MondoPizzaPrintAgent
SET SCRIPT_PATH=%REPO_DIR%\print-agent\index.mjs

echo Installing service %SERVICE_NAME%...
nssm install %SERVICE_NAME% "%NODE_EXE%" "%SCRIPT_PATH%"
IF %ERRORLEVEL% NEQ 0 (
    echo nssm install failed. Is nssm.exe on your PATH?
    exit /b 1
)

echo Configuring environment...
nssm set %SERVICE_NAME% AppDirectory "%REPO_DIR%"
nssm set %SERVICE_NAME% AppEnvironmentExtra ^
    CONVEX_URL=%CONVEX_URL% ^
    PRINT_AGENT_TOKEN=%PRINT_AGENT_TOKEN% ^
    QZ_PRIVATE_KEY_PATH=%QZ_PRIVATE_KEY_PATH% ^
    QZ_CERT_PATH=%QZ_CERT_PATH%

echo Configuring logs (rotated daily to %REPO_DIR%\print-agent\logs)...
mkdir "%REPO_DIR%\print-agent\logs" 2>nul
nssm set %SERVICE_NAME% AppStdout "%REPO_DIR%\print-agent\logs\out.log"
nssm set %SERVICE_NAME% AppStderr "%REPO_DIR%\print-agent\logs\err.log"
nssm set %SERVICE_NAME% AppRotateFiles 1
nssm set %SERVICE_NAME% AppRotateBytes 5242880

echo Setting auto-restart and start on boot...
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm set %SERVICE_NAME% AppExit Default Restart
nssm set %SERVICE_NAME% AppRestartDelay 5000

echo Starting service...
nssm start %SERVICE_NAME%

echo.
echo ============================================================================
echo  Service '%SERVICE_NAME%' installed and started.
echo  Status:     nssm status %SERVICE_NAME%
echo  Stop:       nssm stop %SERVICE_NAME%
echo  Uninstall:  nssm remove %SERVICE_NAME% confirm
echo  Logs:       %REPO_DIR%\print-agent\logs\out.log
echo ============================================================================
