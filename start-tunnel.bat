@echo off
title SINGGAH TUNNEL (Cloudflare)
cd /d "%~dp0"
echo Menghubungkan tunnel ke http://localhost:5173 ...
echo Cari tulisan https://...trycloudflare.com di output = link publik kamu.
echo Jangan tutup jendela ini selama mau diakses dari luar.
echo.
"%~dp0tools\cloudflared.exe" tunnel --url http://localhost:5173
pause