// scripts/setupFolders.js
// Initial setup script to create folder structure and download sample images

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicImagesPath = path.resolve(__dirname, '../public/images')

const sampleFolders = [
  {
    name: 'nature',
    images: [
      { name: 'mountain-1.jpg', url: 'https://picsum.photos/400/600?random=1' },
      { name: 'forest-1.jpg', url: 'https://picsum.photos/400/500?random=2' },
      { name: 'ocean-1.jpg', url: 'https://picsum.photos/400/400?random=3' },
      { name: 'sunset-1.jpg', url: 'https://picsum.photos/400/650?random=4' },
      { name: 'river-1.jpg', url: 'https://picsum.photos/400/450?random=5' }
    ]
  },
  {
    name: 'architecture',
    images: [
      { name: 'building-1.jpg', url: 'https://picsum.photos/400/700?random=6' },
      { name: 'bridge-1.jpg', url: 'https://picsum.photos/400/500?random=7' },
      { name: 'skyline-1.jpg', url: 'https://picsum.photos/400/600?random=8' },
      { name: 'monument-1.jpg', url: 'https://picsum.photos/400/550?random=9' }
    ]
  },
  {
    name: 'art',
    images: [
      { name: 'abstract-1.jpg', url: 'https://picsum.photos/400/800?random=10' },
      { name: 'street-art-1.jpg', url: 'https://picsum.photos/400/480?random=11' },
      { name: 'sculpture-1.jpg', url: 'https://picsum.photos/400/600?random=12' },
      { name: 'digital-1.jpg', url: 'https://picsum.photos/400/520?random=13' }
    ]
  }
]

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    
    https.get(url, (response) => {
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}) // Delete partial file
        reject(err)
      })
    }).on('error', (err) => {
      reject(err)
    })
  })
}

async function setupFolders() {
  try {
    console.log('🚀 Setting up Pinterest Gallery folder structure...\n')

    // Create main images directory
    if (!fs.existsSync(publicImagesPath)) {
      fs.mkdirSync(publicImagesPath, { recursive: true })
      console.log('📁 Created public/images directory')
    }

    // Create sample folders and download images
    for (const folder of sampleFolders) {
      const folderPath = path.join(publicImagesPath, folder.name)
      
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
        console.log(`📁 Created ${folder.name} folder`)
      }

      console.log(`\n📸 Downloading sample images for ${folder.name}:`)
      
      for (const image of folder.images) {
        const imagePath = path.join(folderPath, image.name)
        
        if (!fs.existsSync(imagePath)) {
          try {
            await downloadImage(image.url, imagePath)
            console.log(`   ✅ ${image.name}`)
          } catch (error) {
            console.log(`   ❌ Failed to download ${image.name}: ${error.message}`)
          }
        } else {
          console.log(`   ⏭  ${image.name} (already exists)`)
        }
      }
    }

    // Create README file
    const readmePath = path.join(publicImagesPath, 'README.md')
    const readmeContent = `# Gallery Images

This folder contains your image albums. Each subfolder represents an album.

## How to add images:

1. **Create a new folder** for each album (e.g., \`travel\`, \`family\`, \`work\`)
2. **Add images** to the folder (supports: .jpg, .jpeg, .png, .gif, .webp, .svg)
3. **Run the app** - it will automatically detect new folders and images!

## Current Albums:
${sampleFolders.map(folder => `- **${folder.name}**: ${folder.images.length} sample images`).join('\n')}

## Auto-Detection Features:
- ✅ Automatically scans folders on startup
- ✅ Hot reload when you add/remove images (in development)
- ✅ Generates image manifest for fast loading
- ✅ Supports nested organization

## Adding Your Own Images:
1. Create folders like: \`public/images/your-album-name/\`
2. Add your images to the folder
3. Restart the dev server or click refresh in the app
4. Your new album will appear automatically!
`

    fs.writeFileSync(readmePath, readmeContent)

    console.log('\n✅ Setup complete!')
    console.log('\n📋 Summary:')
    console.log(`   Folders created: ${sampleFolders.length}`)
    console.log(`   Sample images: ${sampleFolders.reduce((sum, f) => sum + f.images.length, 0)}`)
    console.log(`   Location: ${publicImagesPath}`)
    console.log('\n🚀 You can now run: npm run dev')
    console.log('\n💡 To add your own images:')
    console.log('   1. Create folders in public/images/')
    console.log('   2. Add images to those folders')
    console.log('   3. The app will automatically detect them!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupFolders()