'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref and a boolean `isVisible`.
 * `isVisible` becomes true once the element enters the viewport.
 * Attach `ref` to any HTMLDivElement wrapping your section content.
 */
export function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
