import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadAlbumsFromManifest, refreshAlbums } from './store/gallerySlice'
import Layout from './components/layout/Layout'
import GalleryHeader from './components/gallery/GalleryHeader'
import AlbumSelector from './components/gallery/AlbumSelector'
import MasonryGrid from './components/gallery/MasonryGrid'
import ImageModal from './components/common/ImageModal'
import LoadingSpinner from './components/common/LoadingSpinner'
import { RefreshCw, AlertCircle } from 'lucide-react'

function App() {
  const dispatch = useDispatch()
  const { selectedImage, loading, error, albums, lastUpdated } = useSelector(state => state.gallery)

  useEffect(() => {
    // Load albums on app start
    dispatch(loadAlbumsFromManifest())
  }, [dispatch])

  useEffect(() => {
    // Set up hot module replacement for development
    if (import.meta.hot) {
      import.meta.hot.accept('./data/imageManifest.js', () => {
        console.log('📸 Image manifest updated, reloading albums...')
        dispatch(loadAlbumsFromManifest())
      })
    }
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(loadAlbumsFromManifest())
    // dispatch(refreshAlbums())
  }

  if (loading && albums.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    )
  }

  if (error && albums.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load albums
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <GalleryHeader onRefresh={handleRefresh} loading={loading} lastUpdated={lastUpdated} />
      <AlbumSelector />
      <MasonryGrid />
      {selectedImage && <ImageModal />}
    </Layout>
  )
}

export default App