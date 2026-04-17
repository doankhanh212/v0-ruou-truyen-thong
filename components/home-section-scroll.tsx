'use client'

import { useEffect } from 'react'

const VALID_SECTIONS = new Set([
  'hero',
  'products',
  'pricing',
  'trust',
  'story',
  'contact',
])

interface HomeSectionScrollProps {
  section?: string
}

export function HomeSectionScroll({ section }: HomeSectionScrollProps) {

  useEffect(() => {
    const hashSection = window.location.hash.replace('#', '')
    const targetSection = section ?? hashSection

    if (!targetSection || !VALID_SECTIONS.has(targetSection)) return

    const timer = window.setTimeout(() => {
      document.getElementById(targetSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

      if (section) {
        window.history.replaceState(null, '', '/')
      }
    }, 60)

    return () => window.clearTimeout(timer)
  }, [section])

  return null
}