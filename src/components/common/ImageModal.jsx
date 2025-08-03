import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedImage } from '@store/gallerySlice'
import { X } from 'lucide-react'

const ImageModal = () => {
  const dispatch = useDispatch()
  const { selectedImage } = useSelector(state => state.gallery)

  const handleClose = () => {
    dispatch(setSelectedImage(null))
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  if (!selectedImage) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close image"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={selectedImage.url}
          alt={selectedImage.title}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-4 rounded-b-lg">
          <h2 className="text-xl font-semibold">{selectedImage.title}</h2>
        </div>
      </div>
    </div>
  )
}

export default ImageModal