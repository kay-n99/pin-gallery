import { useState, useEffect, useRef, useCallback } from 'react'

export const useMasonryLayout = () => {
  const [columnCount, setColumnCount] = useState(4)
  const containerRef = useRef(null)

  useEffect(() => {
    const updateColumnCount = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        if (width < 640) setColumnCount(2)
        else if (width < 1024) setColumnCount(3)
        else if (width < 1536) setColumnCount(4)
        else setColumnCount(5)
      }
    }

    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)
    return () => window.removeEventListener('resize', updateColumnCount)
  }, [])

  const createColumns = useCallback((images) => {
    const cols = Array.from({ length: columnCount }, () => [])
    images.forEach((image, index) => {
      cols[index % columnCount].push(image)
    })
    return cols
  }, [columnCount])

  return { columnCount, containerRef, createColumns }
}