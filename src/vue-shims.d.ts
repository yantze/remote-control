declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'remote-control-server' {
  function start(obj: any): any
  // interface instanceServer {
  // }
  export { start }
}
