@echo off
cd /d "%~dp0"
set PY=python
where python >nul 2>nul || set PY=py
echo Iniciando servidor local na porta 8000...
start "Servidor do tear" %PY% -m http.server 8000
timeout /t 2 /nobreak >nul
start "" http://localhost:8000/index.html
echo Para encerrar, feche a janela "Servidor do tear".
