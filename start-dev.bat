@echo off
title SINGGAH DEV
cd /d "%~dp0"
start "SINGGAH API (:5000)" cmd /k "cd /d "%~dp0server" && npm run dev"
start "SINGGAH Client (:5173)" cmd /k "cd /d "%~dp0client" && npm run dev"
echo.
echo Terminal API dan Client sudah dibuka.
echo Setelah dua-duanya jalan, klik dua kali start-tunnel.bat
echo lalu ambil URL https://...trycloudflare.com yang muncul di terminal.
pause