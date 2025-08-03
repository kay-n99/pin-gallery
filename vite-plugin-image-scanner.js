// vite-plugin-image-scanner.js
// Custom Vite plugin to automatically scan images at build time

import fs from 'fs'
import path from 'path'

const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

export function imageScanner(options = {}) {
  const {
    imagesDir = 'public/images',
    outputFile = 'src/data/imageManifest.js',
    watch = true
  } = options

  let isProduction = false

  return {
    name: 'vite-plugin-image-scanner',
    
    configResolved(config) {
      isProduction = config.command === 'build'
    },

    buildStart() {
      // Generate manifest on build start
      generateImageManifest(imagesDir, outputFile)
    },

    configureServer(server) {
      if (!watch) return

      // Watch for changes in development
      const imagesPath = path.resolve(imagesDir)
      
      if (fs.existsSync(imagesPath)) {
        server.watcher.add(imagesPath)
        
        server.watcher.on('add', (filePath) => {
          if (filePath.startsWith(imagesPath) && isImageFile(filePath)) {
            console.log(`📸 New image detected: ${path.relative(imagesPath, filePath)}`)
            generateImageManifest(imagesDir, outputFile)
            
            // Trigger HMR update
            const module = server.moduleGraph.getModuleById(path.resolve(outputFile))
            if (module) {
              server.reloadModule(module)
            }
          }
        })

        server.watcher.on('unlink', (filePath) => {
          if (filePath.startsWith(imagesPath) && isImageFile(filePath)) {
            console.log(`🗑️ Image removed: ${path.relative(imagesPath, filePath)}`)
            generateImageManifest(imagesDir, outputFile)
            
            // Trigger HMR update
            const module = server.moduleGraph.getModuleById(path.resolve(outputFile))
            if (module) {
              server.reloadModule(module)
            }
          }
        })
      }
    }
  }
}

function generateImageManifest(imagesDir, outputFile) {
  try {
    const imagesPath = path.resolve(imagesDir)
    
    if (!fs.existsSync(imagesPath)) {
      console.warn(`Images directory not found: ${imagesPath}`)
      return
    }

    const albums = []
    const folders = fs.readdirSync(imagesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const folderName of folders) {
      const folderPath = path.join(imagesPath, folderName)
      const files = fs.readdirSync(folderPath)
        .filter(file => isImageFile(path.join(folderPath, file)))
        .sort()

      if (files.length > 0) {
        const images = files.map((filename, index) => {
          const filePath = path.join(folderPath, filename)
          const stats = fs.statSync(filePath)
          
          return {
            id: `${folderName}-${index}`,
            filename,
            title: formatImageTitle(filename),
            url: `/images/${folderName}/${filename}`,
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          }
        })

        albums.push({
          id: folderName,
          name: formatFolderName(folderName),
          path: `/images/${folderName}`,
          imageCount: images.length,
          images
        })
      }
    }

    const manifest = {
      generated: new Date().toISOString(),
      version: '1.0.0',
      totalAlbums: albums.length,
      totalImages: albums.reduce((sum, album) => sum + album.images.length, 0),
      albums
    }

    // Ensure output directory exists
    const outputDir = path.dirname(path.resolve(outputFile))
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Generate JavaScript module
    const jsContent = `// Auto-generated image manifest - Do not edit manually
// Generated: ${manifest.generated}

export const imageManifest = ${JSON.stringify(manifest, null, 2)}

export const albums = imageManifest.albums
export const totalImages = imageManifest.totalImages
export const totalAlbums = imageManifest.totalAlbums

export default imageManifest
`

    fs.writeFileSync(path.resolve(outputFile), jsContent)
    console.log(`📋 Image manifest updated: ${albums.length} albums, ${manifest.totalImages} images`)

    // Also generate JSON manifest in public folder
    const jsonManifestPath = path.resolve('public/images/manifest.json')
    fs.writeFileSync(jsonManifestPath, JSON.stringify(manifest, null, 2))

  } catch (error) {
    console.error('Error generating image manifest:', error)
  }
}

function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return supportedExtensions.includes(ext)
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