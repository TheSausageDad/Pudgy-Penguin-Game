# Remix Game Template - Phaser.js + TypeScript

## Overview

This is a template for creating games for the Remix platform using TypeScript and Phaser.js. It provides a structured foundation with a mobile-optimized 9:16 aspect ratio, professional development environment with SDK integration testing, and comprehensive tooling for building HTML5 games.

## Features

- 📱 Mobile-first design with **9:16 aspect ratio** (optimized for vertical mobile screens)
- 🎮 Phaser.js game framework integration (loaded via CDN)
- 🔧 TypeScript support for type-safe development
- 🔄 Hot-reload development server with QR code for mobile testing
- 🎛️ **Professional Development Environment**:
  - Full Remix SDK integration testing with visual status indicators
  - Interactive game overlay with phone frame simulation
  - Real-time SDK event monitoring and logging
  - Full/Actual size toggle for testing at both responsive and native (393x695) dimensions
  - Mute/audio controls for development testing
  - Persistent user preferences with localStorage
- 📦 Optimized build process for Remix platform
- 🏗️ Organized project structure for game development
- 🎨 Pre-configured game scene with click-to-progress demo
- 🛡️ Safe setup script with protection against accidental data loss

## What You Need Before Starting

### For Complete Beginners:
1. **Node.js** - Download from [nodejs.org](https://nodejs.org) (choose the LTS version)
   - This includes `npm` (package manager) automatically
   - On Windows: Run the installer and follow the setup wizard
   - On Mac: Download the installer or use `brew install node`
   - On Linux: Use your package manager (e.g., `sudo apt install nodejs npm`)

2. **A Code Editor** - We recommend:
   - [Visual Studio Code](https://code.visualstudio.com) (free, beginner-friendly)
   - [Cursor](https://cursor.sh) (VS Code with built-in AI assistance)

3. **Basic Terminal/Command Line Knowledge**:
   - Windows: Use Command Prompt or PowerShell
   - Mac/Linux: Use Terminal
   - You'll need to navigate to folders and run commands

## ⚠️ Important Notes

- **Phaser.js is loaded from CDN**: The game framework is loaded in `index.html`, so Phaser is globally available. **Never add Phaser imports** to your TypeScript files - this will break your game.
- **Mobile-First**: This template is designed for vertical mobile games with a 9:16 aspect ratio (393x695 px).
- **Development Environment**: The template includes a comprehensive development overlay that simulates the Remix platform environment.
- **One-Time Setup**: The setup command can only be run once per project for safety.

## Quick Start (Step-by-Step)

### Step 1: Get the Template
```bash
# Option A: Clone with git (if you have git installed)
git clone https://github.com/InsideTheSim/remix-starter-ts-phaser my-game-name
cd my-game-name

# Option B: Download as ZIP
# Download the ZIP file from GitHub, extract it, and open Terminal/Command Prompt in that folder. 
# Downnload available at:
https://github.com/InsideTheSim/remix-starter-ts-phaser
```

### Step 2: Run Setup (IMPORTANT - Only Run Once!)
```bash
npm run remix-setup
```

**What this does:**
- Detects which package manager you're using (npm, yarn, pnpm, or bun)
- Removes the template's git history safely
- Installs all required dependencies
- Creates a fresh git repository with your first commit
- Removes the safety marker file

**⚠️ Safety Warning:** This command includes the `.is_fresh` file check and will only run on a fresh template. If the file is missing, the command will fail to prevent accidental data loss.

### Step 3: Start Development
```bash
npm run dev
```

**What happens:**
- Development server starts at `http://localhost:3000`
- A QR code appears in your terminal for mobile testing
- The browser opens automatically with a professional development environment
- You'll see the **Remix Development Overlay** featuring:
  - Phone frame simulation with proper 9:16 aspect ratio
  - SDK integration status panel (red/yellow/green indicators)
  - Real-time event monitoring for `ready`, `game_over`, `play_again`, and `toggle_mute`
  - Full/Actual size toggle for testing responsive vs. native dimensions
  - Mute controls and game over overlay testing
  - Sample click-to-progress game (3 clicks triggers game over)
- File changes trigger automatic browser refresh

### Step 4: Test on Your Phone
1. Make sure your phone is on the same Wi-Fi network as your computer
2. Scan the QR code that appears in your terminal
3. The game opens in your phone's browser
4. Test the touch controls and aspect ratio

<details>
<summary><strong>📦 Porting an Existing Game (Click to expand)</strong></summary>

If you have an existing game that you want to port to this starter template then follow these steps:

### Step 1: Complete the Quick Start Setup
Follow the Quick Start steps above to set up the template first.

### Step 2: Prepare Your Existing Game Code
1. Create a new folder in the project root called `src_prev` (as a sibling to the `src` folder):
   ```bash
   mkdir src_prev
   ```

2. Copy all your existing game files into the `src_prev` folder:
   ```
   your-project/
   ├── src/                    # New template structure
   ├── src_prev/           # Your existing game code
   │   ├── scenes/
   │   ├── objects/
   │   ├── assets/
   │   └── ... (all your existing files)
   └── ...
   ```

### Step 3: Ask Your LLM Assistant to Help Migrate
Once your existing code is in the `src_prev` folder, ask your AI assistant (like Claude Code) to help you migrate:

> "I have an existing Phaser.js game in the `src_prev` folder that I want to port to this Remix template. Please help me migrate the code into the proper `src` structure, ensuring it works with the 5:9 aspect ratio and Remix platform requirements. Please analyze my existing game structure and guide me through the migration process."

### ⚠️ Important Migration Reality Check:
**Things WILL break during migration!** This is completely normal and expected. Game porting is an iterative process that requires multiple rounds of fixes:

- **Expect compilation errors** - TypeScript and build issues are common
- **Expect runtime crashes** - Games may not start immediately after migration
- **Expect visual/gameplay issues** - Aspect ratio changes affect game layout
- **Be prepared for multiple LLM conversations** - You'll need to ask follow-up questions like:
  - "Fix this TypeScript error: [paste error]"
  - "The game crashes with this error: [paste error]"
  - "Help me adjust the UI layout for 5:9 aspect ratio"
  - "My touch controls aren't working, can you help?"

**Migration is a collaborative process** - Plan to spend time working with your AI assistant to resolve issues step by step. Don't expect a perfect one-shot migration.

### Migration Considerations:
- **Aspect Ratio**: Your game will need to adapt to the 9:16 mobile format (393x695 px)
- **Asset Loading**: Assets may need to be restructured for the build process
- **Phaser Imports**: Remove any Phaser imports since it's loaded globally via CDN
- **Platform Integration**: Add Remix SDK integration for platform features
- **Mobile Optimization**: Ensure touch controls and mobile performance
- **Development Testing**: Use the new development overlay to verify SDK integration

### Step 4: Clean Up
After successful migration, you can remove the `src_prev` folder:
```bash
rm -rf src_prev
```

**💡 Pro Tip**: Keep your original game backup in a separate location until you're confident the migration is complete and working properly.

</details>

## Development Environment

### Understanding the Development Overlay

The template includes a comprehensive development environment that simulates the Remix platform:

#### **Visual SDK Integration Testing**
- **Status Panel**: Hover or tap "Remix SDK integration" to see real-time event tracking
- **Color-coded Indicators**: 
  - 🔴 Red: Event not triggered yet
  - 🟡 Yellow: Some events triggered  
  - 🟢 Green: All events working (ready for production)

#### **Size Testing Options** (Desktop Only)
- **Full Mode**: Responsive scaling that adapts to your browser window
- **Actual Mode**: Exact 393x695 pixels (how it appears on Remix platform)
- Toggle preference is automatically saved and remembered

#### **Interactive Testing**
- **Phone Frame**: Visual representation of mobile device boundaries
- **Game Over Overlay**: Test the game over screen and play again functionality
- **Mute Controls**: Test audio state management
- **Real-time Logs**: Console shows SDK events as they happen

#### **Background Design**
- **Textured Background**: Subtle noise pattern helps you see game frame boundaries
- **Silver Border**: Clean frame around your game area
- **Centered Layout**: Professional appearance matching Remix platform

### Console Logging
The development environment provides clean, focused logging:
```
[SDK Event] ready
[SDK Event] game_over {"score":3}
[SDK Event] play_again 
[SDK Event] toggle_mute {"isMuted":true}
```

## Customizing Your Game

### Remove the Demo Content
When you're ready to build your actual game, ask an AI assistant (like Claude Code):

> "Please remove the click-to-progress demo and give me a blank game scene to start building my game."

### Project Structure Explained
```
your-game/
├── .is_fresh              # Safety marker (removed after setup)
├── index.html             # Main HTML file - loads Phaser and Remix SDK
├── package.json           # Project info and available commands
├── .remix/                # Development environment (hidden directory)
│   ├── overlay.ts         # Development overlay entry point
│   ├── game.ts           # Development game entry point with SDK mock
│   ├── RemixDevOverlay.ts # Professional development UI
│   ├── RemixSDKMock.ts   # SDK mock for testing
│   ├── remix-dev-overlay.css # Development UI styles
│   └── remix-game-styles.css # Game frame styles
├── src/                   # Your game code goes here
│   ├── main.ts           # Game entry point - creates Phaser game
│   ├── config/
│   │   └── GameSettings.ts # Game settings (720x1280, debug mode, etc.)
│   ├── scenes/
│   │   └── GameScene.ts   # Main game scene (click-to-progress demo)
│   ├── utils/
│   │   └── RemixUtils.ts  # Remix platform integration
│   └── types.ts          # TypeScript type definitions
├── scripts/               # Build and development scripts
└── dist/                 # Built game files (created when you run build)
```

### Key Files to Understand:
- **`src/main.ts`**: Creates the Phaser game with your settings
- **`src/scenes/GameScene.ts`**: Where your game logic lives (currently 3-click demo)
- **`src/config/GameSettings.ts`**: Adjust canvas size (720x1280), debug mode, etc.
- **`index.html`**: Loads Phaser and Remix SDK, conditionally loads development environment
- **`.remix/`**: Complete development environment (hidden in production builds)

## Available Commands

```bash
npm run remix-setup    # ⚠️ ONLY RUN ONCE - Sets up fresh project
npm run dev      # Start development server (most common)
npm run dev:3001 # Start server on port 3001 (if 3000 is busy)
npm run dev:any  # Start server on random available port
npm run build    # Build for production (creates dist/index.html)
npm run preview  # Preview the built game locally
```

## Common Development Workflow

1. **Start Development**: `npm run dev`
2. **Edit Code**: Make changes in `src/` folder
3. **See Changes**: Browser refreshes automatically
4. **Test on Mobile**: Scan QR code with phone
5. **Build for Production**: `npm run build` when ready
6. **Deploy**: Copy contents of `dist/index.html` to Remix platform

## Troubleshooting

### Common Issues:

**"Command not found: npm"**
- Install Node.js from [nodejs.org](https://nodejs.org)
- Restart your terminal after installation

**"npm run remix-setup fails"**
- Make sure you're in the correct folder (should contain `package.json`)
- Check that the `.is_fresh` file exists (if missing, you may have already run setup)

**"Port 3000 is already in use"**
- Use `npm run dev:3001` or `npm run dev:any` for different ports
- Or stop other servers using port 3000

**"Game doesn't load on mobile"**
- Ensure your phone and computer are on the same Wi-Fi network
- Try refreshing the page or scanning the QR code again
- Check that no firewall is blocking the connection

**"Development overlay is too small/large"**
- Use the Full/Actual toggle in the bottom status bar (desktop only)
- Full mode: Responsive scaling that fits your browser
- Actual mode: Exact 393x695 pixels (native Remix size)
- Your preference is automatically saved

**"TypeScript errors about Phaser"**
- Never import Phaser in your TypeScript files
- Phaser is loaded globally via CDN in `index.html`
- Remove any `import Phaser from 'phaser'` lines
- You can ask your LLM to resolve this for you

### Building for Production
```bash
npm run build
```
This creates `dist/index.html` - a single file containing your entire game ready for Remix deployment.

## Deployment to Remix

1. **Build**: Run `npm run build`
2. **Copy**: Open `dist/index.html` and copy all contents
3. **Paste**: Paste into Remix platform
4. **Test**: Verify everything works on the platform
5. **Publish**: Release your game to players

## What's Included

- **Phaser**: HTML5 game framework (loaded via CDN)
- **TypeScript**: Type-safe development with proper Phaser types
- **Vite**: Fast build tool and dev server with hot reload
- **Remix SDK**: Platform integration with comprehensive testing tools
- **Mobile optimization**: 9:16 aspect ratio (720x1280) with proper scaling
- **Professional Development Environment**:
  - Visual SDK integration testing with status indicators
  - Phone frame simulation with textured background
  - Full/Actual size toggle with persistent preferences
  - Real-time event monitoring and clean console logging
  - Interactive game over overlay and mute controls
- **Development tools**: QR codes, hot reload, build scripts, mobile testing

## Getting Help:

- Copy and paste any error output to your LLM.
- Join the [Remix Discord Serve](https://discord.com/invite/a3bgdr4RC6) 

## License

MIT License - See LICENSE file for details
