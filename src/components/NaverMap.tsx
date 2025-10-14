'use client'

import { useEffect, useRef } from 'react'
import { Database } from '@/lib/database.types'

type Building = Database['public']['Tables']['buildings']['Row']

interface NaverMapProps {
  building: Building
}

declare global {
  interface Window {
    naver: any
  }
}

export default function NaverMap({ building }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Naver Maps SDK
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`
    script.async = true
    script.onload = () => initMap()
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const initMap = () => {
    if (!mapRef.current || !window.naver) return

    // Parse location from building (POINT format)
    // Default to Gangnam Station if parsing fails
    let lat = 37.5006
    let lng = 127.0353

    try {
      if (building.location) {
        // Location is stored as PostGIS geography, we'll use default coords for now
        // In production, you'd parse the actual coordinates
        lat = 37.5006
        lng = 127.0353
      }
    } catch (error) {
      console.error('Error parsing location:', error)
    }

    const mapOptions = {
      center: new window.naver.maps.LatLng(lat, lng),
      zoom: 16,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    }

    const map = new window.naver.maps.Map(mapRef.current, mapOptions)

    // Add marker
    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: map,
      title: building.name,
    })
  }

  return <div ref={mapRef} className="w-full h-full" />
}
