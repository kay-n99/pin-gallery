import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentAlbum, addAlbum } from '@store/gallerySlice'
import { FolderPlus } from 'lucide-react'

const AlbumSelector = () => {
  const dispatch = useDispatch()
  const { albums, currentAlbum } = useSelector(state => state.gallery)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')

  const handleAlbumChange = (albumId) => {
    dispatch(setCurrentAlbum(albumId))
  }

  const handleAddAlbum = () => {
    if (newAlbumName.trim()) {
      const newAlbum = {
        id: newAlbumName.toLowerCase().replace(/\s+/g, '-'),
        name: newAlbumName,
        images: []
      }
      dispatch(addAlbum(newAlbum))
      setNewAlbumName('')
      setShowAddForm(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center p-4 bg-white shadow-sm">
      {albums.map((album) => (
        <button
          key={album.id}
          onClick={() => handleAlbumChange(album.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            currentAlbum === album.id
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {album.name} ({album.images?.length || 0})
        </button>
      ))}
      
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          Add Album
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            placeholder="Album name"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddAlbum()
              if (e.key === 'Escape') {
                setShowAddForm(false)
                setNewAlbumName('')
              }
            }}
          />
          <button
            onClick={handleAddAlbum}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddForm(false)
              setNewAlbumName('')
            }}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default AlbumSelector