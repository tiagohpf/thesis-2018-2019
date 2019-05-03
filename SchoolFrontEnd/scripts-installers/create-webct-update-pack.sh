#!/bin/bash
cd "${0%/*}";

mkdir --parents webct-update-pack/files webct-update-pack/assets/libs

cp -rf ../src/app/webct.module.ts ../package.json ./webct-update-pack/files/
cp -rf ../src/assets/webct/css ../src/assets/webct/img ./webct-update-pack/assets/
cp -rf ../src/assets/webct/libs/authz ./webct-update-pack/assets/libs/

find webct-update-pack/ -type f -o -type l -o -type d | sed s,^webct-update-pack/,, | tar -cf ./webct-update-pack.tar --no-recursion -C webct-update-pack/ -T -

rm -rf webct-update-pack
