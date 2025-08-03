// scripts/generateManifest.js
// Run this script to generate a manifest of all images in public/images

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicImagesPath = path.resolve(__dirname, '../public/images')
const manifestPath = path.resolve(__dirname, '../public/images/manifest.json')

const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

function generateManifest() {
  try {
    if (!fs.existsSync(publicImagesPath)) {
      console.log('Creating images directory...')
      fs.mkdirSync(publicImagesPath, { recursive: true })
    }

    const albums = []
    const folders = fs.readdirSync(publicImagesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    console.log(`Found ${folders.length} folders:`, folders)

    for (const folderName of folders) {
      const folderPath = path.join(publicImagesPath, folderName)
      const files = fs.readdirSync(folderPath)
        .filter(file => {
          const ext = path.extname(file).toLowerCase()
          return supportedExtensions.includes(ext)
        })
        .sort()

      if (files.length > 0) {
        const images = files.map((filename, index) => {
          const filePath = path.join(folderPath, filename)
          const stats = fs.statSync(filePath)
          
          return {
            filename,
            title: formatImageTitle(filename),
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          }
        })

        albums.push({
          id: folderName,
          name: formatFolderName(folderName),
          path: folderName,
          imageCount: images.length,
          images
        })

        console.log(`  ${folderName}: ${images.length} images`)
      }
    }

    const manifest = {
      generated: new Date().toISOString(),
      version: '1.0.0',
      totalAlbums: albums.length,
      totalImages: albums.reduce((sum, album) => sum + album.images.length, 0),
      albums
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`\n✅ Manifest generated successfully!`)
    console.log(`   Albums: ${manifest.totalAlbums}`)
    console.log(`   Images: ${manifest.totalImages}`)
    console.log(`   File: ${manifestPath}`)

    // Also generate a JavaScript version for build-time import
    const jsManifestPath = path.resolve(__dirname, '../src/data/imageManifest.js')
    const jsContent = `// Auto-generated image manifest
export const imageManifest = ${JSON.stringify(manifest, null, 2)}

export default imageManifest
`
    fs.writeFileSync(jsManifestPath, jsContent)
    console.log(`   JS Manifest: ${jsManifestPath}`)

  } catch (error) {
    console.error('Error generating manifest:', error)
    process.exit(1)
  }
}

function formatFolderName(folderName) {
  return folderName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatImageTitle(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Run the script
generateManifest()