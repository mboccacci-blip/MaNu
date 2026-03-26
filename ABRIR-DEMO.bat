@echo off
echo =========================================
echo   Magic Number PRO - Demo
echo =========================================
echo.
echo Abriendo la app en tu browser...
echo (Si no se abre automaticamente, ve a http://localhost:4173)
echo.
echo Presiona Ctrl+C para cerrar.
echo.
cd /d "%~dp0app"
npx -y serve dist -l 4173 -s
