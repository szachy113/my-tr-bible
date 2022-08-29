#!/usr/bin/env sh

# abort on errors
set -e

npm run build

cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git checkout -b main
git add -A
git commit -m 'deploy'
git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

cd -
