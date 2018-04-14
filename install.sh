if [[ -x "$(type npm)" ]]; then
  echo "Missing npm, exiting"
  exit 1
fi

echo "Installing dependencies..."
npm i 2> err.log
ln -rs src node_modules/aethcord

printf "What's your discord resources dir? (defaults to /opt/discord-canary/resources) "
read installDir

if [[ -z "$installDir" ]]; then
  installDir="/opt/discord-canary/resources"
fi

if [[ ! -d "$installDir" || ! -f "$installDir/app.asar" ]]; then
  echo "wrong"
  exit 1
fi

if [[ -d "$installDir/app" ]]; then
  while true; do
    read -p "Existing injection found. Remove and re-inject? " yn
    case $yn in
      [Yy]* ) echo "Removing.."; sudo rm -rf "$installDir/app"; break;;
      [Nn]* ) echo "ok cool bye"; exit;;
      * ) echo "yes or no, bich";;
    esac
  done
fi

installDir="$installDir/app"

echo "Injecting..."

sudo mkdir "$installDir"
sudo chown -R $(id -u):$(id -g) "$installDir"
echo "require('$(pwd)').inject(__dirname);" > "$installDir/index.js"
echo "{ \"main\": \"index.js\" }" > "$installDir/package.json"

echo "Done"
exit 0