// from: https://github.com/sindresorhus/electron-store
// author: sindresorhus
// date: '2018-09-16 20:12:02'
// editedBy: yantze

import path from 'path'
import { app, remote } from 'electron'
import Conf from 'conf'

interface IElectronStoreOptions<T> {
  /**
   * Default data.
   */
  defaults?: T

  /**
   * Name of the storage file (without extension).
   */
  name?: string

  /**
   * Storage file location. Don't specify this unless absolutely necessary!
   */
  cwd?: string

  /**
   * When specified, the store will be encrypted using the aes-256-cbc encryption algorithm.
   */
  encryptionKey?: string | Buffer
}

export default class ElectronStore extends Conf {
  private opts: IElectronStoreOptions<object>

  constructor(opts?: IElectronStoreOptions<object>) {
    const defaultCwd = (app || remote.app).getPath('userData')

    opts = Object.assign({ name: 'config' }, opts)

    if (opts.cwd) {
      opts.cwd = path.isAbsolute(opts.cwd)
        ? opts.cwd
        : path.join(defaultCwd, opts.cwd)
    } else {
      opts.cwd = defaultCwd
    }

    super(opts)

    this.opts = opts
  }

  public getPath() {
    if (this.opts.cwd) {
      return path.join(this.opts.cwd, `${this.opts.name}.json`)
    } else {
      console.error('Not set opts.cwd')
      return ''
    }
  }
}
