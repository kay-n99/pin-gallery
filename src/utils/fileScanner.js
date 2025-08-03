// utils/fileScanner.js

/**
 * Method 1: Build-time folder scanning using Vite's import.meta.glob
 * This scans folders at build time and creates a manifest
 */
export const scanPublicFolders = () => {
  // This will be populated by the build script
  const imageManifest = window.__IMAGE_MANIFEST__ || {}
  
  return Object.entries(imageManifest).map(([folderName, images]) => ({
    id: folderName,
    name: formatFolderName(folderName),
    path: `/images/${folderName}`,
    images: images.map((filename, index) => ({
      id: `${folderName}-${index}`,
      url: `/images/${folderName}/${filename}`,
      title: formatImageTitle(filename),
      filename
    }))
  }))
}

/**
 * Method 2: Runtime folder scanning using fetch attempts
 * This tries to detect folders by attempting to load common image files
 */
export const scanFoldersRuntime = async (knownFolders = []) => {
  const detectedAlbums = []
  
  // If no known folders provided, try common album names
  const foldersToCheck = knownFolders.length > 0 ? knownFolders : [
    'nature', 'architecture', 'art', 'portraits', 'travel', 
    'food', 'animals', 'landscapes', 'urban', 'abstract'
  ]
  
  for (const folderName of foldersToCheck) {
    try {
      const images = await scanFolderForImages(folderName)
      if (images.length > 0) {
        detectedAlbums.push({
          id: folderName,
          name: formatFolderName(folderName),
          path: `/images/${folderName}`,
          images
        })
      }
    } catch (error) {
      console.log(`No images found in ${folderName} folder`)
    }
  }
  
  return detectedAlbums
}

/**
 * Method 3: Using a generated manifest file
 * This reads from a manifest.json file that lists all images
 */
export const loadFromManifest = async () => {
  try {
    const response = await fetch('/images/manifest.json')
    if (!response.ok) throw new Error('Manifest not found')
    
    const manifest = await response.json()
    return manifest.albums.map(album => ({
      ...album,
      images: album.images.map((img, index) => ({
        id: `${album.id}-${index}`,
        url: `/images/${album.id}/${img.filename}`,
        title: img.title || formatImageTitle(img.filename),
        ...img
      }))
    }))
  } catch (error) {
    console.error('Failed to load manifest:', error)
    return []
  }
}

/**
 * Scan a specific folder for images by trying common filenames/patterns
 */
const scanFolderForImages = async (folderName, maxAttempts = 50) => {
  const images = []
  const commonExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const commonPatterns = [
    // Numbered files
    ...Array.from({length: 20}, (_, i) => `${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `image${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `img${i + 1}`),
    ...Array.from({length: 20}, (_, i) => `photo${i + 1}`),
    // Common names
    'main', 'hero', 'banner', 'featured', 'cover',
    'sample', 'demo', 'test', 'example'
  ]
  
  let attempts = 0
  let consecutiveFailures = 0
  
  for (const pattern of commonPatterns) {
    if (attempts >= maxAttempts || consecutiveFailures >= 5) break
    
    for (const ext of commonExtensions) {
      if (attempts >= maxAttempts) break
      
      const filename = `${pattern}.${ext}`
      const url = `/images/${folderName}/${filename}`
      
      try {
        const exists = await checkImageExists(url)
        if (exists) {
          images.push({
            id: `${folderName}-${images.length}`,
            url,
            title: formatImageTitle(filename),
            filename
          })
          consecutiveFailures = 0
        } else {
          consecutiveFailures++
        }
        attempts++
      } catch (error) {
        consecutiveFailures++
        attempts++
      }
    }
  }
  
  return images
}

/**
 * Check if an image exists by attempting to load it
 */
const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000)
  })
}

/**
 * Format folder name for display
 */
const formatFolderName = (folderName) => {
  return folderName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format image filename to a readable title
 */
const formatImageTitle = (filename) => {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Watch for new images being added to folders (for development)
 */
let watchInterval = null

export const startFolderWatcher = (onUpdate, intervalMs = 10000) => {
  if (watchInterval) clearInterval(watchInterval)
  
  let lastKnownImages = new Map()
  
  watchInterval = setInterval(async () => {
    try {
      const currentAlbums = await scanFoldersRuntime()
      let hasChanges = false
      
      for (const album of currentAlbums) {
        const lastCount = lastKnownImages.get(album.id) || 0
        if (album.images.length !== lastCount) {
          lastKnownImages.set(album.id, album.images.length)
          hasChanges = true
        }
      }
      
      if (hasChanges) {
        onUpdate(currentAlbums)
      }
    } catch (error) {
      console.error('Error watching folders:', error)
    }
  }, intervalMs)
}

export const stopFolderWatcher = () => {
  if (watchInterval) {
    clearInterval(watchInterval)
    watchInterval = null
  }
}