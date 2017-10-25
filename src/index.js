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

const notesDir = path.join(homedir(), '.memos')
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
    })

    win.loadURL(`file://${__dirname}/browser/index.html`)

    if (process.env.DEVTOOLS) {
      win.webContents.openDevTools({
        mode: 'undocked'
      })
    }

    tray = new Tray(trayImages.off)
    tray.setToolTip('takeamemo')

    const hotkey = globalShortcut.register('Command+\'', () => {
      recording = !recording

      tray.setImage(trayImages[recording ? 'on' : 'off'])

      if (recording) {
        recordingAt = new Date()
        ts = fecha.format(recordingAt, 'YYYY-MM-DD-HH-mm-ss')
        const filename = `${ts}.png`
        const absFilename = path.join(notesDir, filename)
        
        screenshot(absFilename, (err) => {
          if (err) {
            return console.error('Failed saving screenshot', filename, err)
          }

          console.log('Saved screenshot', absFilename)
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
