import { app } from 'electron'
import AutoLaunch from 'auto-launch'

class RemoteControlAutoLaunch {
  public autoLauncher: AutoLaunch

  constructor() {
    const appPath = app.getAppPath()

    this.autoLauncher = new AutoLaunch({
      name: 'Remote Control',
      path: appPath,
      mac: {
        useLaunchAgent: true,
      },
    })
  }

  public setAutoLaunch(isEnable = false) {
    if (isEnable) {
      this.autoLauncher.enable()
    } else {
      this.autoLauncher.disable()
    }
  }

  public isEnabled() {
    return this.autoLauncher.isEnabled()
  }
}

export default new RemoteControlAutoLaunch()
