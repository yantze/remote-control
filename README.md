# Remote Control

Remote control PC/Mac/Linux by web browser, No image.

## To Use

Download from release page: https://github.com/yantze/remote-control/releases

For chinese user: http://remote.qingrizhi.com

## To Install

```
git clone https://github.com/yantze/remote-control

cd remote-control
git submodule update --init --recursive
npm i

cd ./vendor/remote-control-server
npm i
npm run build

cd ../..
npm run dev
```

## ScreenShot

App ready:
![window ready](./screenshot/ready.png)

App turn on:
![app running](./screenshot/running.png)
