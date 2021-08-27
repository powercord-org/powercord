@echo off
echo 0: Part ZERO: kill discord...
start /wait cmd /c taskkill /IM DiscordCanary.exe /f
echo DONE!
echo 1: Part ONE: unplug Powercord
start /wait cmd /c npm run unplug
echo DONE!
echo 2.A: Part TWO.A: Downloading Update for Powercord
start /wait cmd /c git pull
echo DONE!
echo 2.B: Part TWO.B: Installing new Dependencies
start /wait cmd /c npm i
echo 3: Part THREE: Plugging Powercord
start /wait cmd /c npm run plug
echo DONE!
pause