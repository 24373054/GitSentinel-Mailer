@echo off
chcp 65001 >nul
echo ====================================
echo GitHub监控系统 - 开发模式启动
echo ====================================
echo.
echo 正在启动后端服务器 (端口 5000)...
echo 正在启动前端开发服务器 (端口 3000)...
echo.
echo 提示：
echo   - 后端API: http://localhost:5000
echo   - 前端界面: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo ====================================
echo.

set SKIP_PREFLIGHT_CHECK=true
set BROWSER=none
set NODE_OPTIONS=--openssl-legacy-provider
npm run dev

