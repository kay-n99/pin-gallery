import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Dynamic import of the auto-generated manifest
const loadImageManifest = async () => {
  try {
    const { imageManifest } = await import('@data/imageManifest.js')
    return imageManifest.albums
  } catch (error) {
    console.warn('Could not load auto-generated manifest, using fallback:', error)
    // Fallback to runtime scanning or sample data
    const { scanFoldersRuntime } = await import('@utils/fileScanner')
    return await scanFoldersRuntime()
  }
}

// Async thunk for loading albums from auto-generated manifest
export const loadAlbumsFromManifest = createAsyncThunk(
  'gallery/loadAlbumsFromManifest',
  async () => {
    const albums = await loadImageManifest()
    return albums
  }
)

// Async thunk for refreshing/rescanning folders
export const refreshAlbums = createAsyncThunk(
  'gallery/refreshAlbums',
  async () => {
    const { scanFoldersRuntime } = await import('@utils/fileScanner')
    const albums = await scanFoldersRuntime()
    return albums
  }
)

const initialState = {
  albums: [],
  currentAlbum: null,
  selectedImage: null,
  searchQuery: '',
  loading: true,
  error: null,
  lastUpdated: null
}

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setCurrentAlbum: (state, action) => {
      state.currentAlbum = action.payload
      state.searchQuery = ''
    },
    setSelectedImage: (state, action) => {
      state.selectedImage = action.payload
    },
    addAlbum: (state, action) => {
      state.albums.push(action.payload)
    },
    addImageToAlbum: (state, action) => {
      const { albumId, image } = action.payload
      const album = state.albums.find(a => a.id === albumId)
      if (album) {
        album.images = album.images || []
        album.images.push(image)
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    updateAlbums: (state, action) => {
      state.albums = action.payload
      state.lastUpdated = new Date().toISOString()
      // Preserve current album if it still exists
      if (!state.currentAlbum || !action.payload.find(a => a.id === state.currentAlbum)) {
        state.currentAlbum = action.payload[0]?.id || null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAlbumsFromManifest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadAlbumsFromManifest.fulfilled, (state, action) => {
        state.loading = false
        state.albums = action.payload
        state.currentAlbum = action.payload[0]?.id || null
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(loadAlbumsFromManifest.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(refreshAlbums.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshAlbums.fulfilled, (state, action) => {
        state.loading = false
        state.albums = action.payload
        state.lastUpdated = new Date().toISOString()
        // Preserve current album if it still exists
        if (!state.currentAlbum || !action.payload.find(a => a.id === state.currentAlbum)) {
          state.currentAlbum = action.payload[0]?.id || null
        }
      })
      .addCase(refreshAlbums.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const {
  setCurrentAlbum,
  setSelectedImage,
  addAlbum,
  addImageToAlbum,
  setSearchQuery,
  updateAlbums
} = gallerySlice.actions

export default gallerySlice.reducer