@echo off
echo ========================================
echo Star Wars Character Manager
echo ========================================
echo.
echo This tool helps you manage which characters are enabled in your game.
echo.
echo IMPORTANT: Make sure the dev server is running first!
echo            Run "npm run dev" in another terminal if not already running.
echo.
echo Opening Character Manager in your browser...
echo URL: http://localhost:5174/character-manager.html
echo.
start http://localhost:5174/character-manager.html
echo.
echo ✓ Character Manager opened in browser
echo.
echo Keep the dev server running while you use the Character Manager.
echo Press any key to close this window...
pause >nul
