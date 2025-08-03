import { configureStore } from '@reduxjs/toolkit'
import galleryReducer from './gallerySlice'

export const store = configureStore({
  reducer: {
    gallery: galleryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['gallery/addImage'],
        ignoredPaths: ['gallery.images']
      }
    })
})