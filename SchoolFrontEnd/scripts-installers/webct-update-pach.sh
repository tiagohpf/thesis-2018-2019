#!/bin/bash

echo "Este script vai fazer alterações aos seus ficheiros locais!"
read -p "Deseja prosseguir? (y/n)" -n 1 -r
echo  
if [[ $REPLY =~ ^[Yy]$ ]]
then

  # Remoção de ficheiros e pastas que serão actulizados
  rm -rf src/assets/webct
  rm -rf src/app/webct.module.ts
  rm -rf package.sample.json

  # Actualização de ficheiros manuais
  mkdir webct-update-pack
  tar -xvf node_modules/foundations-webct-robot/webct-update-pack.tar -C webct-update-pack
  cp -r webct-update-pack/files/webct.module.ts src/app/
  cp -r webct-update-pack/files/package.json package.sample.json

  # Actualização dos assets (css, js, img, icons)
  mkdir --parents src/assets/webct
  cp -r webct-update-pack/assets/. src/assets/webct/

  # Actualização dos assets das libs instaladas através do Node
  mkdir --parents src/assets/webct/libs/jquery
  cp -r node_modules/jquery/dist/jquery.min.js src/assets/webct/libs/jquery

  mkdir --parents src/assets/webct/libs/bootstrap
  cp -r node_modules/bootstrap/dist/. src/assets/webct/libs/bootstrap

  mkdir --parents src/assets/webct/libs/font-awesome
  cp -r node_modules/font-awesome/css/ node_modules/font-awesome/fonts/ src/assets/webct/libs/font-awesome

  mkdir --parents src/assets/webct/libs/leaflet
  cp -r node_modules/leaflet/dist/. src/assets/webct/libs/leaflet

  mkdir --parents src/assets/webct/libs/primeng
  cp -r node_modules/primeng/resources/. src/assets/webct/libs/primeng

  rm -rf webct-update-pack

fi
