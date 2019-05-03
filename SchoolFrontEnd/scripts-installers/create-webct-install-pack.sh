#!/bin/bash
cd "${0%/*}";

mkdir webct-install-pack
cp -rf ../src/app ../src/assets ../src/index.html ../package.json ../scripts ./webct-install-pack/

find webct-install-pack/ -type f -o -type l -o -type d | sed s,^webct-install-pack/,, | tar -cf ./webct-install-pack.tar --no-recursion -C webct-install-pack/ -T -

rm -rf webct-install-pack
