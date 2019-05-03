#!/bin/bash

# Unzip do ficheiro de instalação
mkdir webct-install-pack
tar -xvf webct-install-pack.tar -C webct-install-pack

# Copia ou substitui os ficheiros e pastas para os respectivos destinos
rm -rf package.json
cp -r webct-install-pack/scripts/ webct-install-pack/package.json ./

rm -rf src/app/
cp -r webct-install-pack/app/ webct-install-pack/index.html ./src/

cp -r webct-install-pack/assets/ ./src/

# Elimina ficheiros de instalação
rm -rf webct-install-pack/
rm -rf webct-install-pack.tar
rm -rf install-webct.sh
