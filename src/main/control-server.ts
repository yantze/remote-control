import net from 'net'
import coreServer from 'remote-control-server'
import { SERVER_STATUS } from '../common/constant'

class ControlServer {
  public status = SERVER_STATUS.STOPPED
  private instance: net.Server | null = null

  public start() {
    if (this.status === SERVER_STATUS.STOPPED) {
      coreServer.start({})
      this.instance = coreServer.start({ port: 3399 })
      this.status = SERVER_STATUS.STARTED
    }
  }

  public stop() {
    if (this.status === SERVER_STATUS.STARTED) {
      this.instance!.close(() => {
        console.log('Server close gracefully')
        this.status = SERVER_STATUS.STOPPED
      })
    }
  }

  public isStarted() {
    return this.status === SERVER_STATUS.STARTED
  }
}

export default new ControlServer()
