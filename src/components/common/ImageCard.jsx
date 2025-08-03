import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedImage } from '@store/gallerySlice'
import { useImageLoader } from '@hooks/useImageLoader'
import { Camera, X } from 'lucide-react'

const ImageCard = ({ image }) => {
  const dispatch = useDispatch()
  const { loaded, error, imgRef } = useImageLoader(image.url)

  const handleClick = () => {
    dispatch(setSelectedImage(image))
  }

  return (
    <div
      ref={imgRef}
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      onClick={handleClick}
    >
      {!loaded && !error && (
        <div className="w-full h-64 bg-gray-200 animate-pulse flex items-center justify-center">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {error && (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <X className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load</p>
          </div>
        </div>
      )}
      
      {loaded && (
        <>
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
            <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="font-semibold text-sm">{image.title}</h3>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ImageCard