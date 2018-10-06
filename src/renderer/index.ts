// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import Vue from 'vue'
import App from './components/App.vue'

import i18next from 'i18next'
import VueI18Next from '@panter/vue-i18next'

// import { remote } from 'electron'

Vue.use(VueI18Next)

const locales = {
  'zh-CN': {
    'Tutorial': '使用说明',
    'Scan the QR code or enter the URL below in your mobile browser':
      '扫描二维码或者在移动设备浏览器中输入下面的网址',
    'Use the browser as a remote control': '把浏览器用作遥控器',
    'Start': '启动',
    'Stop': '停止',
    '../../../static/images/description.svg':
      '../../../static/images/description-cn.svg',
    '../../../static/images/qrcode-description.svg':
      '../../../static/images/qrcode-description-cn.svg',
    'loadbundle': 'Load bundle language: {{lang}}',
  },
}

i18next.init({
  lng: 'zh-CN', // remote.app.getLocale(),
  resources: {
    'zh-CN': { translation: locales['zh-CN'] },
    // 'en-US': { translation: locales['zh-CN'] },
  },
})

const i18n = new VueI18Next(i18next)

new Vue({
  el: '#app',
  render: h => h(App),
  i18n,
})
