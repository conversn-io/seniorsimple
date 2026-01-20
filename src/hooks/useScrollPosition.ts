'use client'

import { useState, useEffect } from 'react'

interface UseScrollPositionOptions {
  threshold?: number // 0-1, percentage of page scrolled
  element?: HTMLElement | null // Specific element to track
}

export function useScrollPosition(options: UseScrollPositionOptions = {}) {
  const { threshold = 0, element } = options
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hasReachedThreshold, setHasReachedThreshold] = useState(false)

  useEffect(() => {
    const updateScrollPosition = () => {
      const targetElement = element || document.documentElement
      const scrollTop = window.pageYOffset || targetElement.scrollTop
      const scrollHeight = targetElement.scrollHeight - targetElement.clientHeight
      const position = scrollHeight > 0 ? scrollTop / scrollHeight : 0

      setScrollPosition(position)
      setHasReachedThreshold(position >= threshold)
    }

    // Initial check
    updateScrollPosition()

    // Throttled scroll handler
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollPosition()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold, element])

  return { scrollPosition, hasReachedThreshold }
}

