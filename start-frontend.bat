@echo off
chcp 65001 >nul
echo ====================================
echo GitHub监控系统 - 启动前端
echo ====================================
echo.
echo 正在启动前端开发服务器 (端口 3000)...
echo 前端界面: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo ====================================
echo.

set SKIP_PREFLIGHT_CHECK=true
set BROWSER=none
set NODE_OPTIONS=--openssl-legacy-provider
cd client
npm start

