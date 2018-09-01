<template>
  <div id="app">
    <div v-if="showMain" id="main">
      <div>
        <h1 id="title">
          <img src="../../../static/images/headline-remote-control.svg" alt="Remote Control">
        </h1>
        <div id="description">
          <img src="../../../static/images/description.svg" alt="把浏览器用作遥控器">
        </div>
      </div>
      <div id="server-button-group" class="flex-center">
        <button class="button" @click="startServer">启动服务</button>
      </div>
    </div>

    <div v-else id="ready">
      <div id="qrcode-description">
        <img src="../../../static/images/qrcode-description.svg" alt="扫描二维码或者在移动设备浏览器中输入下面的网址">
      </div>
      <div id="qrcode">
        <img :src="qrimg"
            class="qrcode"
            alt=""
            v-for="(qrimg, $index) in qrimgs"
            :key="$index" />
      </div>
      <button id="server-stop-button" class="button" @click="stopServer">停止</button>
    </div>

    <div v-if="showConsole"
         id="console"></div>
  </div>
</template>

<script lang="ts">
// import * as path from "path";
import { networkInterfaces, hostname } from "os";

// import fsp from "fs-extra-promise";
import { ChildProcess } from "child_process";
import Vue from "vue";

// import QRCode from "qrcode";

import coreServer from "remote-control-server";

import { toDataURL, QRCodeToDataURLOptions } from "qrcode";

// declare const __static: string;

// interface URLDatas {
//   URLData: string[];
// }

const SERVER_STATUS = {
  STOPED: "stoped",
  STARTED: "started"
};

let sp: ChildProcess | null;

export default Vue.extend({
  data: function() {
    return {
      showConsole: false,
      serverStatus: SERVER_STATUS.STOPED,
      qrimgs: []
    };
  },
  computed: {
    showMain(): boolean {
      return this.serverStatus === SERVER_STATUS.STOPED;
    }
  },
  methods: {
    createProc() {
      // let sp = spawn("node", ["./vendor/robot/bin/index.js"], {
      //   // stdio: "ignore"
      // });
      // sp = fork("./vendor/robot/bin/index.js");
      // sp.on("data", msg => {
      //   console.log("Message from child", msg);
      // });
      // sp.on("error", err => {
      //   console.log("failed to start process", err);
      // });
      // sp.on("exit", (code, signal) => {
      //   console.log(
      //     `child process exited with code ${code}, signal: ${signal}`
      //   );
      //   // createProc();
      // });
    },
    stopServer() {
      sp && sp.kill();
      console.log("stopping...");
    },
    startServer() {
      if (this.serverStatus !== SERVER_STATUS.STARTED) {
        console.log("start server...");
        coreServer({ port: 4000 });
        this.serverStatus = SERVER_STATUS.STARTED;
        this.showQRCode();
      } else {
        console.log("已启动");
      }
    },
    showQRCode() {
      //   QRCode.toDataURL();
      const ifaces = networkInterfaces();
      const regex = /(^10\.*|^172.16.*$|^192.*$)/gm;

      let supportAddress: string[] = [];
      Object.keys(ifaces).forEach(ifname => {
        ifaces[ifname].forEach(iface => {
          regex.test(iface.address) && supportAddress.push(iface.address);
        });
      });

      supportAddress.push(hostname());

      let addrGens: Promise<any>[] = supportAddress.reverse().map(address => {
        const url = `http://${address}:4000/`;

        let options: QRCodeToDataURLOptions = {
          // width: 200,
          type: "image/png",
          margin: 0,
          color: {
            // dark: "#00F", // Blue dots
            light: "#0000" // Transparent background
          }
        };
        return toDataURL(url, options);
      });
      Promise.all(addrGens).then(urlDatas => {
        this.qrimgs = <never[]>urlDatas;
      });
    }
  }
});
</script>

<style lang="scss">
html {
  background-color: #ececec;
  -webkit-font-smoothing: antialiased;
}

.flex-center {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.button {
  font-size: 100%;
  padding: 0.4em 1em;
  color: white;
  border: transparent;
  background-color: #4c98fe;
  text-decoration: none;
  border-radius: 2px;
  display: inline-block;
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  box-sizing: border-box;
  line-height: normal;
  letter-spacing: 0.01em;
}

.button:hover,
.button:focus {
  background-image: linear-gradient(
    transparent,
    rgba(0, 0, 0, 0.05) 40%,
    rgba(0, 0, 0, 0.1)
  );
  outline: none;
}

.button:active {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset,
    0 0 6px rgba(0, 0, 0, 0.2) inset;
  background-color: #247eff;
}
</style>


<style lang="scss" scoped>
// $imgs: "../../../static/";

#app {
  .qrcode {
    width: 120px;
    height: 120px;
    display: inline-block;
    padding: 40px;
  }

  #title {
    font-family: "SF Pro Display";
    font-size: 36px;
    color: #363535;
    text-align: center;
    line-height: 40px;
    font-weight: 300;
  }

  // #title strong {

  // }

  #description {
    font-family: "SF Pro Display";
    font-size: 20px;
    color: #363535;
    text-align: center;
    line-height: 25px;
  }

  #title {
    margin-top: 45px;
    margin-bottom: 15px;
  }
  #title img {
    // background-image: url($imgs+"images/description@2x.png");
  }
  #description img {
    // background-image: url($imgs+"images/Remote Control@2x.png");
    height: 18px;
  }

  #server-button-group {
    height: 170px;
  }

  #ready {
    display: flex;
    flex-direction: column;
    align-items: center;

    #qrcode-description {
      margin-top: 30px;
    }

    #server-stop-button {
    }
  }
}
</style>
