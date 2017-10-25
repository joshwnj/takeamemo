# labnotes

## Install

```
npm i -g electron labnotes
```

## Usage

In a terminal, run `labnotes` to start the app. You'll see a small microphone icon in the taskbar.

Global shortcut `Cmd+'`:

- take a full desktop screenshot.
- record the microphone until you press `Cmd+'` again.

Files are saved in `~/.labnotes`, so you can record notes on what you're doing and review or share with others later.

Every event has a corresponding `.png` and `.mp3` filename, like:

```
.labnotes/
  2017-10-25-13-40-06.mp3
  2017-10-25-13-40-06.png
```

## License

MIT
