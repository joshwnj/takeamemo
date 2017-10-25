/* eslint-env browser */
const ipc = require('electron').ipcRenderer
const Microm = require('microm')
const fs = require('fs')

let microm

ipc.on('start-recording', () => {
  microm = new Microm()
  microm.record().then(() => {

  }).catch(() => {
    alert('Failed to start recording')
  })
})

ipc.on('stop-recording', (event, dir, ts) => {
  if (!microm) {
    alert('No microm instance available')
    return
  }

  microm.stop().then(() => {
    microm.getBase64().then((raw) => {
      const filename = `${dir}/${ts}.mp3`
      fs.writeFile(filename, Buffer.from(stripBase64Header(raw), 'base64'), (err) => {
        if (err) { alert(`Failed writing file: ${filename}`) }
        ipc.send('wrote', filename)
      })
    })
  })
})

function stripBase64Header (raw) {
  return raw.substr('data:audio/mp3;base64,'.length)
}
