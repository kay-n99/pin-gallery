import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchQuery, addImageToAlbum } from '@store/gallerySlice'
import SearchBar from '@components/common/SearchBar'
import FileUpload from '@components/common/FileUpload'
import { Grid, RefreshCw } from 'lucide-react'

const GalleryHeader = ({ onRefresh, loading, lastUpdated }) => {
  const dispatch = useDispatch()
  const { searchQuery, currentAlbum } = useSelector(state => state.gallery)

  const handleSearchChange = (query) => {
    dispatch(setSearchQuery(query))
  }

  const handleAddImage = (albumId, image) => {
    dispatch(addImageToAlbum({ albumId, image }))
  }

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Grid className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            </div>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated: {formatLastUpdated(lastUpdated)}
              </span>
            )}
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Refresh albums"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <FileUpload
              currentAlbum={currentAlbum}
              onAddImage={handleAddImage}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default GalleryHeader