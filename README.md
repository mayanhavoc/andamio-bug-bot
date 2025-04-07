# Andamio Bug Bot 🤖🐞

A simple Discord bot built with Discord.js that collects structured bug reports via a `/bug` slash command and posts them to a specific channel.

## Features:
- Collects bug report details via interactive slash command.
- Posts formatted bug reports in a designated channel.
- Easy to deploy on Render, Railway, or your own server.

## Setup Instructions:

### 1. Clone the repo:
```bash
git clone https://github.com/mayanhavoc/andamio-bug-bot.git
cd andamio-bug-bot
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create `.env` file:
Copy `.env.example` to `.env` and fill in your credentials.

### 4. Run locally:
```bash
node index.js
```

### 5. Deploy:
- **Render.com:** Supports Node.js apps with auto-deploy from GitHub.
- Add environment variables in the platform’s dashboard.

## Credits:
Built using [Discord.js v14](https://discord.js.org).
