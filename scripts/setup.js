#!/usr/bin/env node

import { execSync } from 'child_process'
import { rmSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline/promises'

console.log('🚀 Setting up your Remix game project...\n')

// Safety check: verify this is a fresh template
if (!existsSync('.is_fresh')) {
  console.error('❌ Error: This command can only be run on a fresh template project.')
  console.error('💡 The .is_fresh file is missing, indicating this project has already been set up.')
  console.error('🔧 If you need to reset, manually remove .git directory and reinstall dependencies.')
  process.exit(1)
}

// Detect package manager from npm_config_user_agent
const userAgent = process.env.npm_config_user_agent || ''
let packageManager = 'npm'

if (userAgent.includes('yarn')) {
  packageManager = 'yarn'
} else if (userAgent.includes('pnpm')) {
  packageManager = 'pnpm'
} else if (userAgent.includes('bun')) {
  packageManager = 'bun'
}

console.log(`📦 Detected package manager: ${packageManager}`)

// Prompt for game name
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

let gameName = ''
while (!gameName.trim()) {
  gameName = await rl.question('Enter your game name: ')
  if (!gameName.trim()) {
    console.log('❌ Game name cannot be empty. Please try again.')
  }
}

rl.close()

// Create sanitized version for package.json
const packageName = gameName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '')

console.log(`🎮 Game name: "${gameName}"`)
console.log(`📦 Package name: "${packageName}"`)

// Replace GAME_NAME in all files
console.log('📝 Updating project files with your game name...')

const filesToUpdate = [
  { path: 'index.html', search: /GAME_NAME/g, replace: gameName },
  { path: 'src/config/GameSettings.ts', search: /GAME_NAME/g, replace: gameName },
  { path: 'scripts/build.js', search: /GAME_NAME/g, replace: gameName }
]

filesToUpdate.forEach(({ path, search, replace }) => {
  try {
    const content = readFileSync(path, 'utf8')
    const updatedContent = content.replace(search, replace)
    writeFileSync(path, updatedContent)
    console.log(`  ✅ Updated ${path}`)
  } catch (error) {
    console.error(`  ❌ Failed to update ${path}:`, error.message)
  }
})

// Handle package.json separately with both name and description
try {
  const packageJsonContent = readFileSync('package.json', 'utf8')
  const packageJson = JSON.parse(packageJsonContent)
  
  // Update name with hyphenated version
  packageJson.name = packageName
  
  // Update description with original game name
  packageJson.description = `${gameName} game for Remix platform`
  
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n')
  console.log(`  ✅ Updated package.json`)
} catch (error) {
  console.error(`  ❌ Failed to update package.json:`, error.message)
}

// Remove existing .git directory
const gitDir = join(process.cwd(), '.git')
if (existsSync(gitDir)) {
  console.log('🗑️  Removing template git directory...')
  rmSync(gitDir, { recursive: true, force: true })
}

// Remove the fresh template marker
if (existsSync('.is_fresh')) {
  rmSync('.is_fresh')
  console.log('🧹 Removed template marker file')
}

// Remove the template LICENSE file
if (existsSync('LICENSE')) {
  rmSync('LICENSE')
  console.log('🧹 Removed template LICENSE file')
}

// Install dependencies
console.log('📦 Installing dependencies...')
try {
  const installCommand = packageManager === 'yarn' ? 'yarn install' : 
                        packageManager === 'pnpm' ? 'pnpm install' :
                        packageManager === 'bun' ? 'bun install' : 'npm install'
  
  execSync(installCommand, { stdio: 'inherit' })
  console.log('✅ Dependencies installed successfully!')
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message)
  process.exit(1)
}

// Initialize new git repository
console.log('🔧 Initializing new git repository...')
try {
  execSync('git init', { stdio: 'inherit' })
  execSync('git add .', { stdio: 'inherit' })
  execSync('git commit -m "initial commit"', { stdio: 'inherit' })
  console.log('✅ Git repository initialized with initial commit!')
} catch (error) {
  console.error('❌ Failed to initialize git repository:', error.message)
  process.exit(1)
}

console.log('\n🎉 Setup complete! Your project is ready to go.')
console.log(`💡 Run '${packageManager} run dev' to start the development server.`)
console.log('\n📋 Next steps:')
console.log('  1. Start the dev server and test the demo game')
console.log('  2. When ready to build your own game, ask your AI:')
console.log('     "Remove the demo and create a minimal GameScene"')
console.log('  3. Check the in-game instructions for more details')