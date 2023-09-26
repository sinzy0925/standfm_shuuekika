#!/bin/bash
echo [google shell]---
cd
echo \$HOME\/inst.sh >> .bashrc
mkdir logfile
mkdir .cloudshell
cd .cloudshell
touch no-apt-get-warning
cd
node -v
npm -v
npm init -y
npm init playwright@latest
echo JavaScript
echo npx playwright install-deps
npx playwright install-deps
