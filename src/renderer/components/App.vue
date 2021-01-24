<template>
  <div id="app">
    <div id="tray-arrow" class="flex-center">
      <svg width="24" height="12" viewBox="0 0 24 12">
        <path
          d="M0 12l2.412-1.53c1.396-.886 3.308-2.692 4.276-4.042l4.127-5.755c.642-.895 1.69-.899 2.347 0l4.216 5.767c.979 1.34 2.898 3.153 4.297 4.057l2.325 1.503h-24z"
        ></path>
      </svg>
    </div>

    <div class="content">
      <div v-if="showMain" id="main">
        <div>
          <h1 id="title">
            <img :src="descImg" alt="Remote Control" />
          </h1>
          <div id="description">
            {{ $t('Remote control in the browser') }}
            <!-- <img src="../../static/images/description.svg" :alt="$t('remote control')"> -->
          </div>
        </div>
        <div id="server-button-group" class="flex-center">
          <button class="button" @click="startServer">{{ $t('Start') }}</button>
        </div>

        <div id="copyright">
          <a href="#" @click="openExternal(tutorialURL)">{{ $t('Tutorial') }}</a>
          ©Yantze
        </div>
      </div>

      <div v-else id="ready">
        <div id="qrcode-description">
          <small>{{ $t('Scan the QR code or enter the URL below in your mobile browser') }}</small>
          <!-- <img src="../../../static/images/qrcode-description.svg" :alt="$t('Scan the QR code or enter the URL below in your mobile browser')"> -->
        </div>
        <div id="qrcode" class="d-flex overflow-auto">
          <img :src="qrimg" class="qrcode" alt v-for="(qrimg, $index) in qrimgs" :key="$index" />
        </div>
        <ul id="url-list">
          <li class="url-text" v-for="(url, key) in supportAddress" :key="key">
            <a href="#" @click="openExternal(url)">{{ url }}</a>
          </li>
        </ul>
        <button id="server-stop-button" class="button" @click="stopServer">{{ $t('Stop') }}</button>
      </div>
    </div>

    <div v-if="showConsole" id="console"></div>
  </div>
</template>

<script lang="js">
import { networkInterfaces, hostname } from 'os'
import net from 'net'

import * as path from "path";
import { fork, ChildProcess, ForkOptions } from 'child_process'

import Vue from 'vue'

import { toDataURL, QRCodeToDataURLOptions } from 'qrcode'

import Store from '../../common/store'

import { SERVER_STATUS, KEY_SERVER_STATUS } from '../../common/constant'

import * as server from '@vastiny/remote-control-server'

import { shell, ipcRenderer } from 'electron'

const store = new Store()

const SERVER_PORT = 3399

let forkServer

// declare const __static: string;

// interface URLDatas {
//   URLData: string[];
// }

const tutorialURL = 'https://vastiny.com/post/remote-control'

const isDevelopment = process.env.NODE_ENV !== 'production'

const staticPath = path.join(isDevelopment ? '../static' : 'dist/static')

export default Vue.extend({
  data() {
    return {
      instanceServer: null,
      qrimgs: [],
      serverStatus: SERVER_STATUS.STOPPED,
      showConsole: false,
      supportAddress: [],
      tutorialURL,
    }
  },
  created() {
    ipcRenderer.on('operate-server', (ev, operate) => {
      // ev
      if (operate.set === 'start') {
        this.startServer()
      }
    })
  },
  computed: {
    showMain() {
      return this.serverStatus === SERVER_STATUS.STOPPED
    },
    descImg() {
      return path.resolve(staticPath , "images/headline-remote-control.svg")
    },
  },
  watch: {
    serverStatus: (val, oldVal) => {
      store.set(KEY_SERVER_STATUS, val)
    },
  },
  methods: {
    startServer() {
      if (this.serverStatus !== SERVER_STATUS.STARTED) {
        console.log('start server...')
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
      this.instanceServer.close(() => {
        console.log('Server close gracefully')
      })
      // forkServer.kill()
    },

    showQRCode() {
      const ifaces = networkInterfaces()
      const regex = /(^10\.*|^172.*$|^192.*$)/gm
      this.supportAddress = []
      const supportAddress = []

      Object.keys(ifaces).forEach(ifname => {
        ifaces[ifname].forEach(iface => {
          regex.test(iface.address) && supportAddress.push(iface.address)
        })
      })

      if (supportAddress.length > 2) {
        supportAddress.splice(0, supportAddress.length - 2)
      }
      supportAddress.push(hostname())

      const addrGens = supportAddress.reverse().map(address => {
        const url = `http://${address}:${SERVER_PORT}/`
        this.supportAddress.push(url)

        const options = {
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
        this.qrimgs = urlDatas
      })
    },
    openExternal(url) {
      shell.openExternal(url)
    },
  },
})
</script>

<style lang="scss">
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

</style>
