@echo off
chcp 65001 >nul
echo ====================================
echo 重新安装前端依赖（修复版本）
echo ====================================
echo.

echo [1/3] 删除旧的依赖...
cd client
if exist node_modules (
    rd /s /q node_modules
    echo 已删除 node_modules
)
if exist package-lock.json (
    del package-lock.json
    echo 已删除 package-lock.json
)
echo.

echo [2/3] 安装兼容版本的依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败！
    cd ..
    pause
    exit /b 1
)
echo 依赖安装成功！
echo.

cd ..

echo [3/3] 验证安装...
echo ====================================
echo 安装完成！
echo ====================================
echo.
echo 现在可以运行：
echo   npm run dev
echo.
echo 或者分别运行：
echo   终端1: .\start-server.bat
echo   终端2: .\start-frontend.bat
echo.
pause

