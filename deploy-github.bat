@echo off
echo Setting up GitHub repository for BloodLink...

REM Initialize git if not already done
git init

REM Configure git user (replace with your details)
set /p name="Enter your full name: "
set /p email="Enter your email: "
git config user.name "%name%"
git config user.email "%email%"

REM Add all files
git add .

REM Create initial commit
git commit -m "Initial commit: BloodLink AI-Powered Blood Management Platform

- Complete Next.js 14 application with TypeScript
- Azure OpenAI integration for AI predictions
- Real-time donor tracking and matching
- Emergency response coordination
- Professional UI with Tailwind CSS
- 200+ donors, 150+ donations, 121 blood units
- Ready for production deployment"

REM Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
set /p username="Enter your GitHub username: "
git remote add origin https://github.com/%username%/BloodLink.git

REM Push to GitHub
git branch -M main
git push -u origin main

echo GitHub setup complete!
pause
