# Jellyfin Cover Generator
A simple app to generate fancy animated libary images for your [Jellyfin](https://github.com/jellyfin/jellyfin) server, entirely within your browser.
![Preview image](assets/cover.webp)

## Developing

Once you've installed dependencies with `npm install` start a development server:

```sh
npm run dev
```

## Deploying

To create a production version of this app:

```sh
npm run build

node ./build/index.js
```
or run it with docker:
```sh
docker build -t covers .
docker run -p 3000:3000 covers
```
