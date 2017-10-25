'use strict'

const { 
  app, 
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Tray
} = require('electron')

const path = require('path')
const screenshot = require('desktop-screenshot')
const fecha = require('fecha')
const homedir = require('homedir')
const mkdirp = require('mkdirp')

const notesDir = path.join(homedir(), '.labnotes')
mkdirp.sync(notesDir)

const trayImages = {
  off: `${__dirname}/assets/icon.png`,
  on: `${__dirname}/assets/icon-active.png`
}

start()

function start () {
  let tray
  let recording = false
  let recordingAt
  let ts

  ipcMain.on('wrote', (event, filename) => {
    console.log('wrote', filename)
  })

  app.on('ready', () => {
    const win = new BrowserWindow({
      transparent: true,
      frame: false
      // width: 400,
      // height: 200
    })

    win.loadURL(`file://${__dirname}/browser/index.html`)

    tray = new Tray(trayImages.off)
    tray.setToolTip('labnotes')

    const hotkey = globalShortcut.register('Command+\'', () => {
      recording = !recording

      tray.setImage(trayImages[recording ? 'on' : 'off'])

      if (recording) {
        recordingAt = new Date()
        ts = fecha.format(recordingAt, 'YYYY-MM-DD-HH-mm-ss')
        const filename = `${ts}.png`

        screenshot(path.join(notesDir, filename), (err) => {
          if (err) {
            return console.error('Failed saving screenshot', filename, err)
          }

          console.log('Saved screenshot', filename)
        })
      }
      win.webContents.send(
        recording ? 'start-recording' : 'stop-recording', 
        notesDir, 
        ts
      )
    })

    if (!hotkey) {
      throw new Error('Hotkey registration failed')
    }
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
}
