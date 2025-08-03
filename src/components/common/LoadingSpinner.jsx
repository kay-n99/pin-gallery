import React from 'react'
import { Camera } from 'lucide-react'

const LoadingSpinner = ({ message = "Loading gallery..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="relative">
          <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-500">
          Scanning folders for images...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner