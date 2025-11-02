@echo off
chcp 65001 >nul
echo ====================================
echo GitHub监控系统 - 安装脚本
echo ====================================
echo.

echo [1/2] 正在安装后端依赖...
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败！
    pause
    exit /b 1
)
echo 后端依赖安装成功！
echo.

echo [2/2] 正在安装前端依赖...
cd client
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)
cd ..
echo 前端依赖安装成功！
echo.

echo ====================================
echo 安装完成！
echo ====================================
echo.
echo 使用以下命令启动项目：
echo   - 开发模式：npm run dev
echo   - 只启动后端：npm run server
echo   - 只启动前端：cd client ^&^& npm start
echo.
pause

