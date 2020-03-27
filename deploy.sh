#!/usr/bin/env sh

# abort on errors
set -e

npm run build:docs

# navigate into the build output directory
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'
git push --force https://github.com/recheck-io/vue-recheck-authorizer.git master:gh-pages

cd -
