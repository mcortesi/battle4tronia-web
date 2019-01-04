# Battle For Tronia WEB

Battle for Tronia is the first slot machine built on TRON where you can have an epic
experience while you gamble!

Important technical aspects about the project:

- Built on tron.
- Provably fair game; with a random number generation protocol
- Based on an innovative implementation of state channels specifically designed for Tron and gambling.

## Documents

There a public folder with technical and game design documents available on [google drive](https://drive.google.com/drive/u/1/folders/1nY5m6S5j2f7T_pX8j599JyOKNaCc41U7)

## Projects

Battle for tronia is composed of 2 projects:

- this one
- server: https://github.com/mcortesi/battle4tronia-server

## Main Technologies

- Tron Blockchain
- TronLink
- typescript
- pixi.js (gamedev library for web on canvas/webgl)
- howler.js (sounds library)
- tween.js (for animations)
- webpack (packaging)

## Running in development

Just type:

```
yarn start
```

And it will run the client app on localhost.

If you don't have the server running you can append to the url `#papu` and `#notpapu` to play without
a server running.
