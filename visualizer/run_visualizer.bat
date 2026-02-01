@echo off
echo ===========================================
echo INICIADOR DE EMERGENCIA - VISUALIZADOR
echo ===========================================
cd /d "%~dp0"
echo 1. Cierra todas las otras ventanas negras.
echo 2. HAZ CLIC EN EL BOTON AMARILLO AL ABRIRSE.
echo.
start http://localhost:8005/index.html
python server.py 8005
pause
