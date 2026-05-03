# WhatsApp Chat Analyzer

Analyzes a WhatsApp chat export and visualizes the results. All processing runs in the browser; no data leaves your device.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # type-check, generate PWA assets, bundle
npm run ship-it  # build + deploy to GitHub Pages
```

## How to export a chat

1. Open WhatsApp and go to the chat
2. Tap **More -> Export Chat**
3. Choose **Without Media** and save the `.zip`
4. Open WCA and load the file
