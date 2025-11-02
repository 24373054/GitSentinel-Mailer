@echo off
chcp 65001 >nul
echo ====================================
echo GitHub监控系统 - 启动后端服务器
echo ====================================
echo.
echo 正在启动服务器 (端口 5000)...
echo API地址: http://localhost:5000
echo.
echo 按 Ctrl+C 停止服务器
echo ====================================
echo.

node server/index.js

