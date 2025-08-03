import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import ImageCard from '@components/common/ImageCard'
import { useMasonryLayout } from '@hooks/useMasonryLayout'
import { Camera } from 'lucide-react'

const MasonryGrid = () => {
  const { albums, currentAlbum, searchQuery } = useSelector(state => state.gallery)
  const { containerRef, createColumns } = useMasonryLayout()
  
  const currentAlbumData = albums.find(album => album.id === currentAlbum)
  
  const filteredImages = useMemo(() => {
    if (!currentAlbumData) return []
    if (!searchQuery) return currentAlbumData.images || []
    
    return (currentAlbumData.images || []).filter(image =>
      image.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentAlbumData, searchQuery])

  const columns = useMemo(() => {
    return createColumns(filteredImages)
  }, [filteredImages, createColumns])

  if (!currentAlbumData) return null

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {currentAlbumData.name}
        </h2>
        <p className="text-gray-600">
          {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {filteredImages.length > 0 ? (
        <div ref={containerRef} className="flex gap-4 p-4">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1 flex flex-col gap-4">
              {column.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No images found' : 'No images yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Upload some images to get started'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default MasonryGrid