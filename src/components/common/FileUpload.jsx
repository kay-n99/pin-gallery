import React, { useRef } from 'react'
import { Upload } from 'lucide-react'

const FileUpload = ({ currentAlbum, onAddImage }) => {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newImage = {
            id: Date.now() + Math.random(),
            url: event.target.result,
            title: file.name.split('.')[0]
          }
          onAddImage(currentAlbum, newImage)
        }
        reader.readAsDataURL(file)
      }
    })
    e.target.value = ''
  }

  return (
    <>
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
        Upload Images
      </button>
    </>
  )
}

export default FileUpload