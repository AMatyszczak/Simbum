# SimBum

## build windows

docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE*|ELECTRON*|YARN*|NPM*|CI|CIRCLE|TRAVIS*TAG|TRAVIS|TRAVIS_REPO*|TRAVIS*BUILD*|TRAVIS*BRANCH|TRAVIS_PULL_REQUEST*|APPVEYOR*|CSC*|GH*|GITHUB*|BT*|AWS*|STRIP|BUILD\_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/project \
 -v ${PWD##\*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine

yarn && yarn dist -w
