declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

declare module 'remote-control-server' {
    // const coreServer: any
    function coreServer(obj: any): any
    export default coreServer
}
