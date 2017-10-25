# take a memo

## Install

```
npm i -g electron takeamemo
```

## Usage

In a terminal, run `takeamemo` to start the app. You'll see a small microphone icon in the taskbar.

Global shortcut `Cmd+'`:

- take a full desktop screenshot.
- record the microphone until you press `Cmd+'` again.

Files are saved in `~/.memos`, so you can record notes on what you're doing and review or share with others later.

Every event has a corresponding `.png` and `.mp3` filename, like:

```
.memos/
  2017-10-25-13-40-06.mp3
  2017-10-25-13-40-06.png
```

## Development

To run in dev mode:

```
DEVTOOLS=1 electron .
```

## License

MIT
