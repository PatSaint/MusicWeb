@echo off
echo ===========================================
echo INICIADOR DE EMERGENCIA - VISUALIZADOR
echo ===========================================
echo 1. Cierra todas las otras ventanas negras.
echo 2. HAZ CLIC EN EL BOTON AMARILLO AL ABRIRSE.
echo.
start http://localhost:8003/final_test.html
python server.py 8003
pause
