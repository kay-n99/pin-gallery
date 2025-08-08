import React, { useRef, useState, useEffect } from 'react'
import { Upload, Folder, AlertTriangle, Check } from 'lucide-react'

const FileUpload = ({ currentAlbum, onAddImage }) => {
  const fileInputRef = useRef(null)
  const [projectDirectoryHandle, setProjectDirectoryHandle] = useState(null)
  const [isSupported, setIsSupported] = useState('showDirectoryPicker' in window)
  const [isSetup, setIsSetup] = useState(false)

  // Check if File System Access API is supported
  useEffect(() => {
    setIsSupported('showDirectoryPicker' in window)
  }, [])

  // Auto-setup project directory when component mounts
  useEffect(() => {
    if (isSupported && !projectDirectoryHandle) {
      setupProjectDirectory()
    }
  }, [isSupported])

  const setupProjectDirectory = async () => {
    if (!isSupported) return

    try {
      // Ask user to select the project root directory
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
        id: 'photo-album-project'
      })
      
      // Verify this is a project directory by checking for public folder
      try {
        const publicHandle = await handle.getDirectoryHandle('public')
        setProjectDirectoryHandle(handle)
        setIsSetup(true)
        console.log('✅ Project directory setup complete:', handle.name)
      } catch (error) {
        // public folder doesn't exist, create the structure
        const shouldCreate = confirm(
          'This directory doesn\'t have a "public" folder. Would you like to create the project structure (public/images/)?'
        )
        
        if (shouldCreate) {
          const publicHandle = await handle.getDirectoryHandle('public', { create: true })
          await publicHandle.getDirectoryHandle('images', { create: true })
          setProjectDirectoryHandle(handle)
          setIsSetup(true)
          console.log('✅ Created project structure in:', handle.name)
        } else {
          alert('Please select your project root directory (the one containing the "public" folder)')
        }
      }
    } catch (error) {
      console.log('Project directory setup cancelled or failed:', error)
    }
  }

  const ensureImageDirectoryStructure = async (albumName) => {
    if (!projectDirectoryHandle) {
      throw new Error('Project directory not set up')
    }

    try {
      // Get or create public directory
      let publicHandle
      try {
        publicHandle = await projectDirectoryHandle.getDirectoryHandle('public')
      } catch (error) {
        publicHandle = await projectDirectoryHandle.getDirectoryHandle('public', { create: true })
        console.log('Created public directory')
      }

      // Get or create images directory
      let imagesHandle
      try {
        imagesHandle = await publicHandle.getDirectoryHandle('images')
      } catch (error) {
        imagesHandle = await publicHandle.getDirectoryHandle('images', { create: true })
        console.log('Created images directory')
      }

      // Get or create album directory
      let albumHandle
      try {
        albumHandle = await imagesHandle.getDirectoryHandle(albumName)
      } catch (error) {
        albumHandle = await imagesHandle.getDirectoryHandle(albumName, { create: true })
        console.log(`Created album directory: ${albumName}`)
      }

      return albumHandle
    } catch (error) {
      console.error('Failed to create directory structure:', error)
      throw error
    }
  }

  const saveImageToProject = async (file, albumName) => {
    if (!projectDirectoryHandle) {
      throw new Error('Project directory not set up. Please select your project folder first.')
    }

    try {
      // Ensure the directory structure exists
      const albumHandle = await ensureImageDirectoryStructure(albumName)

      // Create filename (keep original name, add timestamp if file exists)
      let fileName = file.name
      let counter = 1
      
      // Check if file already exists and create unique name if needed
      while (true) {
        try {
          await albumHandle.getFileHandle(fileName)
          // File exists, create new name
          const nameParts = file.name.split('.')
          const extension = nameParts.pop()
          const baseName = nameParts.join('.')
          fileName = `${baseName}_${counter}.${extension}`
          counter++
        } catch (error) {
          // File doesn't exist, we can use this name
          break
        }
      }

      // Create and write the file
      const fileHandle = await albumHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(file)
      await writable.close()

      console.log(`✅ Saved: ${fileName} to public/images/${albumName}/`)

      // Return image data for the app state
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve({
            id: Date.now() + Math.random(),
            url: event.target.result,
            title: file.name.split('.')[0],
            fileName: fileName,
            savedPath: `public/images/${albumName}/${fileName}`,
            publicUrl: `/images/${albumName}/${fileName}`, // URL for serving from public folder
            uploadDate: new Date().toISOString(),
            actualFile: file
          })
        }
        reader.readAsDataURL(file)
      })

    } catch (error) {
      console.error('Error saving file:', error)
      throw error
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    
    // If project directory is not set up, prompt user
    if (files.length > 0 && !projectDirectoryHandle) {
      const shouldSetup = confirm(
        'Please select your project root directory (the folder containing your project files) to save images to public/images/'
      )
      if (shouldSetup) {
        await setupProjectDirectory()
        if (!projectDirectoryHandle) {
          alert('Project directory setup required to save images')
          e.target.value = ''
          return
        }
      } else {
        // Fall back to memory-only
        handleMemoryOnlyUpload(files)
        e.target.value = ''
        return
      }
    }
    
    // Process files for saving to project
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const newImage = await saveImageToProject(file, currentAlbum)
          onAddImage(currentAlbum, newImage)
          
          console.log(`📸 Image "${file.name}" saved to public/images/${currentAlbum}/`)
        } catch (error) {
          console.error('Failed to save image:', error)
          alert(`Failed to save ${file.name}: ${error.message}`)
        }
      }
    }
    
    e.target.value = ''
  }

  const handleMemoryOnlyUpload = (files) => {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newImage = {
            id: Date.now() + Math.random(),
            url: event.target.result,
            title: file.name.split('.')[0],
            savedPath: 'Memory only (not saved to disk)',
            uploadDate: new Date().toISOString()
          }
          onAddImage(currentAlbum, newImage)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <p className="text-sm text-yellow-700 text-center">
          File System Access API not supported in this browser.
          <br />
          Please use Chrome 86+ or Edge 86+ for local file saving.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Images (Memory Only)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleMemoryOnlyUpload(Array.from(e.target.files))}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Project directory status */}
      <div className="flex items-center gap-2 text-sm">
        {isSetup && projectDirectoryHandle ? (
          <div className="flex items-center gap-1 text-green-700">
            <Check className="w-4 h-4" />
            <span>Project: {projectDirectoryHandle.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-orange-600">Project directory not set up</span>
            <button
              onClick={setupProjectDirectory}
              className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-colors"
            >
              Setup Project
            </button>
          </div>
        )}
      </div>

      {/* Change project directory button */}
      {isSetup && (
        <button
          onClick={setupProjectDirectory}
          className="self-start px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
        >
          <Folder className="w-4 h-4" />
          Change Project Directory
        </button>
      )}

      {/* File upload */}
      {projectDirectoryHandle ? <div>
       
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload to {currentAlbum}
          {isSetup && <span className="text-xs">(→ public/images/)</span>}
        </button>
      </div> : <button
          onClick={() => {}}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          select project root folder to upload
          {isSetup && <span className="text-xs">(→ public/images/)</span>}
        </button>}
      

      {/* Info text */}
      {isSetup && (
        <p className="text-xs text-gray-500">
          Images will be saved to: public/images/{currentAlbum}/
        </p>
      )}
    </div>
  )
}

export default FileUpload