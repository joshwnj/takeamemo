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
const fs = require('fs')
const homedir = require('homedir')
const mkdirp = require('mkdirp')
const notifier = require('node-notifier')
const clipboardWatcher = require('electron-clipboard-watcher')

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
  let seq = 0
  const watchDelay = 1000
  let watcher

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
        startWatching()

        recordingAt = new Date()
        ts = fecha.format(recordingAt, 'YYYY-MM-DD-HH-mm-ss')
        seq = 0
        const filename = `${ts}.png`
        const absFilename = path.join(notesDir, filename)

        screenshot(absFilename, (err) => {
          if (err) {
            return console.error('Failed saving screenshot', filename, err)
          }

          console.log('Saved screenshot', absFilename)
        })
      } else {
        stopWatching()
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

  function saveFromClipboard (content, ext) {
    const filename = `${ts}-${seq}.${ext}`
    seq += 1

    const absFilename = path.join(notesDir, filename)

    fs.writeFile(absFilename, content, err => {
      if (err) {
        console.error('Unable to write:', absFilename)
      }
    })

    return filename
  }

  function startWatching () {
    if (watcher) { watcher.stop() }
    watcher = clipboardWatcher({
      watchDelay,
      onTextChange: (text) => {
        saveFromClipboard(text, 'txt')
        notifyTextChange(text)
      },
      onImageChange: (image) => {
        const imageFilename = saveFromClipboard(image.toPng(), 'png')
        console.log('image changed', image.getSize())

        const size = image.getSize()
        saveFromClipboard(`
---
width: ${size.width}
height: ${size.height}
---

![${imageFilename}](${imageFilename})
`, 'md')

        notifyImageChange(imageFilename)
      }
    })
  }

  function stopWatching () {
    if (watcher) { watcher.stop() }
  }

  function notifyTextChange (text) {
    notifier.notify({
      title: 'Memo: Text',
      message: text,
      icon: path.join(__dirname, 'assets', 'icon.png')
    }, (err) => {
      if (err) {
        console.error('Notification failed', err)
      }
    })
  }

  function notifyImageChange (imagePath) {
    notifier.notify({
      title: 'Memo: Image',
      message: path.basename(imagePath),
      icon: imagePath
    }, (err) => {
      if (err) {
        console.error('Notification failed', err)
      }
    })
  }
}
