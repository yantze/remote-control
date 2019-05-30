<template>
  <div id="app">
    <div id="tray-arrow" class="flex-center">
      <svg width="24" height="12" viewBox="0 0 24 12"><path d="M0 12l2.412-1.53c1.396-.886 3.308-2.692 4.276-4.042l4.127-5.755c.642-.895 1.69-.899 2.347 0l4.216 5.767c.979 1.34 2.898 3.153 4.297 4.057l2.325 1.503h-24z" /></svg>
    </div>

    <div class="content">
      <div v-if="showMain" id="main">
        <div>
          <h1 id="title">
            <img src="../../../static/images/headline-remote-control.svg" alt="Remote Control">
          </h1>
          <div id="description">
            {{ $t('Use the browser as a remote control') }}
            <!-- <img src="../../../static/images/description.svg" :alt="$t('Use the browser as a remote control')"> -->
          </div>
        </div>
        <div id="server-button-group" class="flex-center">
          <button class="button" @click="startServer">{{ $t('Start') }}</button>
        </div>

        <div id="copyright">
          <a href="#" @click="openExternal(tutorialURL)">{{$t("Tutorial") }}</a>
          ©Yantze
        </div>
      </div>

      <div v-else id="ready">
        <div id="qrcode-description">
          {{ $t('Scan the QR code or enter the URL below in your mobile browser') }}
          <!-- <img src="../../../static/images/qrcode-description.svg" :alt="$t('Scan the QR code or enter the URL below in your mobile browser')"> -->
        </div>
        <div id="qrcode">
          <img :src="qrimg" class="qrcode" alt v-for="(qrimg, $index) in qrimgs" :key="$index">
        </div>
        <ul id="url-list">
          <li class="url-text" v-for="(url, key) in supportAddress" :key="key">
            <a href="#" @click="openExternal(url)">{{url}}</a>
          </li>
        </ul>
        <button id="server-stop-button" class="button" @click="stopServer">{{ $t('Stop') }}</button>
      </div>

    </div>

    <div v-if="showConsole" id="console"></div>
  </div>
</template>

<script lang="ts">
import { networkInterfaces, hostname } from 'os'
import net from 'net'

// import * as path from "path";
import { fork, ChildProcess, ForkOptions } from 'child_process'

import Vue from 'vue'

import { toDataURL, QRCodeToDataURLOptions } from 'qrcode'

import Store from '../../common/store'

import { SERVER_STATUS, KEY_SERVER_STATUS } from '../../common/constant'

import * as server from 'remote-control-server'

import { shell } from 'electron'

const store = new Store()

const SERVER_PORT = 3399

let forkServer: ChildProcess

// declare const __static: string;

// interface URLDatas {
//   URLData: string[];
// }

const tutorialURL = 'https://vastiny.com/post/remote-control'

export default Vue.extend({
  data() {
    return {
      instanceServer: null as net.Server | null,
      qrimgs: [],
      serverStatus: SERVER_STATUS.STOPPED,
      showConsole: false,
      supportAddress: [] as string[],
      tutorialURL,
    }
  },
  computed: {
    showMain(): boolean {
      return this.serverStatus === SERVER_STATUS.STOPPED
    },
  },
  watch: {
    serverStatus: (val, oldVal) => {
      store.set(KEY_SERVER_STATUS, val)
    },
  },
  methods: {
    createProc() {
      forkServer = fork('./src/renderer/utils/external-server.js', [], {
        detached: true,
      } as ForkOptions)

      forkServer.on('data', msg => {
        console.log('Message from child', msg)
      })
      forkServer.on('error', err => {
        console.log('failed to start process', err)
      })
      forkServer.on('exit', (code, signal) => {
        console.log(`child process exited with code ${code}, signal: ${signal}`)
      })

      forkServer.unref()
    },

    startServer() {
      if (this.serverStatus !== SERVER_STATUS.STARTED) {
        console.log('start server...')
        // this.createProc()
        this.instanceServer = server.start({ port: 3399 })
        this.serverStatus = SERVER_STATUS.STARTED
        this.showQRCode()
      } else {
        console.log('已启动')
      }
    },

    stopServer() {
      console.log('stopping...')
      this.serverStatus = SERVER_STATUS.STOPPED
      this.instanceServer!.close(() => {
        console.log('Server close gracefully')
      })
      // forkServer.kill()
    },

    showQRCode() {
      const ifaces = networkInterfaces()
      const regex = /(^10\.*|^172.*$|^192.*$)/gm
      this.supportAddress = []
      const supportAddress: string[] = []

      Object.keys(ifaces).forEach(ifname => {
        ifaces[ifname].forEach(iface => {
          regex.test(iface.address) && supportAddress.push(iface.address)
        })
      })

      if (supportAddress.length > 2) {
        supportAddress.splice(0, supportAddress.length - 2)
      }
      supportAddress.push(hostname())

      const addrGens: Array<Promise<any>> = supportAddress.reverse().map(address => {
        const url = `http://${address}:${SERVER_PORT}/`
        this.supportAddress.push(url)

        const options: QRCodeToDataURLOptions = {
          // width: 200,
          type: 'image/png',
          margin: 0,
          color: {
            // dark: "#00F", // Blue dots
            light: '#0000', // Transparent background
          },
        }
        return toDataURL(url, options)
      })
      Promise.all(addrGens).then(urlDatas => {
        this.qrimgs = urlDatas as never[]
      })
    },
    openExternal(url: string) {
      shell.openExternal(url)
    },
  },
})
</script>

<style lang="scss">
html {
  // background-color: #ececec;
  -webkit-font-smoothing: antialiased;
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, PingFang SC, Lantinghei SC, -apple-system,
    Microsoft Yahei, Hiragino Sans GB, Microsoft Sans Serif, WenQuanYi Micro Hei, sans-serif;
  font-size: 16px;

  body {
    margin: 0;
  }
}

.content {
  background-color: #ececec;
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
  background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.1));
  outline: none;
}

.button:active {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15) inset, 0 0 6px rgba(0, 0, 0, 0.2) inset;
  background-color: #247eff;
}
</style>

<style lang="scss" scoped>
// $imgs: "../../../static/";

/* The arrow at the top of the window */
// .header-arrow {
//   position: absolute;
//   top: 2px;
//   left: 50%;
//   margin-left: -5px;
//   height: 10px;
//   width: 10px;
//   transform: rotate(45deg);
//   background-color: #e8e6e8;
// }

#tray-arrow svg {
  fill: #ececec;
}

.qrcode {
  width: 120px;
  height: 120px;
  display: inline-block;
  padding: 0 10px 0 10px;
}

#title {
  font-family: 'SF Pro Display';
  font-size: 36px;
  color: #363535;
  text-align: center;
  line-height: 40px;
  font-weight: 300;
}

// #title strong {

// }

#description {
  font-family: 'SF Pro Display';
  font-size: 20px;
  color: #363535;
  text-align: center;
  line-height: 25px;
}

#title {
  padding-top: 45px;
  padding-bottom: 15px;
  margin: 0;
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
    margin-top: 20px;
    margin-bottom: 20px;
    line-height: 28px;
    text-align: center;
    max-width: 350px;
  }

  #server-stop-button {
  }

  #url-list {
    font-size: 14px;
    color: #696969;

    .url-text {
      padding-bottom: 5px;
    }
  }
}

#copyright {
  color: gray;
  font-size: 12px;
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>
