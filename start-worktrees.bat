@echo off
setlocal enabledelayedexpansion

REM Git 用户配置
set GIT_USER_NAME=Walkman1W
set GIT_USER_EMAIL=253553962@qq.com

REM 主仓库（当前目录）
set MAIN_REPO=%cd%
set PROJECT_NAME=super-alpha-agent

REM 任务列表（可无限扩展）
set TASKS=Task-10-seed-1-8-minimal Task-10-seed-1-8-minimal-withrule

echo 🔧 Starting worktrees for project: %PROJECT_NAME%
echo 📁 Main repo: %MAIN_REPO%
echo.

REM 配置 git 用户信息
echo 👤 Configuring git user...
git config user.name "%GIT_USER_NAME%"
git config user.email "%GIT_USER_EMAIL%"
echo   ✔ Git user: %GIT_USER_NAME% ^<%GIT_USER_EMAIL%^>
echo.

for %%T in (%TASKS%) do (

    set TASK=%%T
    set BRANCH=feature/%%T
    set WORKTREE_DIR=..\%PROJECT_NAME%-%%T

    echo ➡️ Checking worktree for: !BRANCH!

    REM 检查分支是否存在
    git show-ref --verify --quiet refs/heads/!BRANCH!
    if errorlevel 1 (
        echo   🔨 Creating branch !BRANCH! from main...
        git branch !BRANCH! main
    )

    REM 创建 worktree
    if not exist "!WORKTREE_DIR!" (
        echo   🌱 Creating worktree directory: !WORKTREE_DIR!
        git worktree add "!WORKTREE_DIR!" "!BRANCH!"
    ) else (
        echo   ✔ Worktree exists: !WORKTREE_DIR!
    )

    REM 推送分支到远程并创建 PR
    echo   📤 Pushing branch to remote...
    git push -u origin "!BRANCH!" 2>nul
    if errorlevel 1 echo   ℹ️ Branch already exists on remote

    REM 使用 gh cli 创建 PR（如果已安装）
    where gh >nul 2>nul
    if !errorlevel! equ 0 (
        echo   🔗 Creating Pull Request...
        gh pr create --base main --head "!BRANCH!" --title "[%%T] WIP" --body "Work in progress for %%T" 2>nul
        if errorlevel 1 echo   ℹ️ PR already exists or skipped
    ) else (
        echo   ⚠️ gh CLI not installed, skipping PR creation
        echo   💡 Install: https://cli.github.com/
    )

    REM 打开 VSCode（可改为 cursor.exe）
    echo   🚀 Opening VSCode for %%T...
    start code "!WORKTREE_DIR!"

    echo.
)

echo 🎉 All worktrees started!
pause
