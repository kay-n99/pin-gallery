import { useState, useEffect } from 'react'
import { loadAlbumsFromPublic } from '@utils/fileUtils'

export const useFileSystem = () => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setLoading(true)
        const loadedAlbums = await loadAlbumsFromPublic()
        setAlbums(loadedAlbums)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAlbums()
  }, [])

  return { albums, loading, error }
}