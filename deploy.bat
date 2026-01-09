@echo off
echo Building project...
call npm run build

echo.
echo Deploying to gh-pages branch...
git checkout -b gh-pages-deploy
git rm -rf .
xcopy dist . /E /Y /Q
git add .
git commit -m "deploy: built assets"
git push origin gh-pages-deploy:gh-pages --force
git checkout main
git branch -D gh-pages-deploy

echo.
echo Deployment complete!
echo Go to https://github.com/ShengBanTai/Gaja-Vani-2.0/settings/pages
echo and set the source to "Deploy from a branch" and select "gh-pages" branch.
