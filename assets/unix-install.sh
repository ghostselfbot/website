#!/usr/bin/env bash
set -e

PREFIX="[GHOST INSTALLER]"

echo "$PREFIX Ghost Selfbot Installer - https://ghostt.cc/"
echo "$PREFIX Installing Ghost Selfbot..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "$PREFIX Detected macOS."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "$PREFIX Detected Linux."
else
    echo "$PREFIX Unsupported operating system: $OSTYPE"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "$PREFIX Python 3.10+ is required."
    exit 1
fi

# Enter repo or clone if needed
if [ -f "compile.py" ] && [ -f "requirements.txt" ]; then
    echo "$PREFIX Detected Ghost repository in current folder."
elif [ -d "ghost" ]; then
    cd ghost
    echo "$PREFIX Repository already exists. Pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/ghostselfbot/ghost
    cd ghost
fi

# If virtualenv exists, skip setup
if [ -d ".venv" ]; then
    echo "$PREFIX Virtual environment detected. Skipping setup..."
else
    echo "$PREFIX Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
fi

echo "$PREFIX Compiling Ghost..."
# Activate virtualenv and run
source .venv/bin/activate
python3 compile.py

if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Ghost.app" ]; then
        echo "$PREFIX Removing old Ghost.app..."
        rm -rf "/Applications/Ghost.app"
    fi

    echo "$PREFIX Moving Ghost.app to Applications folder..."
    mv "dist/Ghost.app" "/Applications/Ghost.app"
else
    chmod +x dist/Ghost
fi

clear
# resize terminal to 70x30
printf '\e[8;30;70t'

echo ""
echo ""
echo "              ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗"
sleep 0.1
echo "             ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝"
sleep 0.1
echo "             ██║  ███╗███████║██║   ██║███████╗   ██║   "
sleep 0.1
echo "             ██║   ██║██╔══██║██║   ██║╚════██║   ██║   "
sleep 0.1
echo "             ╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   "
sleep 0.1
echo "              ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   "
sleep 0.1
echo ""
echo "                           bennyscripts"
echo ""

echo "Ghost has been successfully installed!"
sleep 0.1
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "You can launch it from your Applications folder."
else
    echo "A compiled binary has been created in the dist folder."
    sleep 0.1
    echo "You can run it with ./dist/Ghost or create a shortcut to it."
fi
sleep 0.1
echo "If you have any issues, please report them on GitHub."
sleep 0.1
echo ""
echo "https://ghostt.cc/"
sleep 0.1
echo "https://github.com/ghostselfbot/ghost"
echo ""
echo ""
echo ""