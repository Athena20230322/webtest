@echo off
cd d %~dp0  REM 切換到當前腳本所在目錄
echo Pulling latest changes...
git pull --rebase origin main
IF %ERRORLEVEL% NEQ 0 (
    echo Git pull failed. Trying merge instead...
    git pull origin main --no-rebase
)

echo Adding changes...
git add .

set p commitMsg=Enter commit message 
git commit -m %commitMsg%

echo Pushing to repository...
git push origin main

echo Done!
pause
