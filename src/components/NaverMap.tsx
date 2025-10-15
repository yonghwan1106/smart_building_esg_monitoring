'use client'

import { useEffect, useRef, useState } from 'react'
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

// Building coordinates
const buildingCoords: Record<string, { lat: number; lng: number }> = {
  'GS타워': { lat: 37.5006, lng: 127.0353 },
  '롯데월드타워': { lat: 37.5125, lng: 127.1025 },
  '삼성전자 서초사옥': { lat: 37.4894, lng: 127.0337 },
  '여의도 파크원': { lat: 37.5265, lng: 126.9244 },
}

export default function NaverMap({ building }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Naver Maps SDK
  useEffect(() => {
    if (window.naver) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}`
    script.async = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Initialize or update map when building changes
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    // Double-check that window.naver is available
    if (!window.naver || !window.naver.maps) {
      console.log('Naver Maps not loaded yet')
      return
    }

    const coords = buildingCoords[building.name] || buildingCoords['GS타워']

    // If map doesn't exist, create it
    if (!mapInstanceRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(coords.lat, coords.lng),
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      }

      mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions)

      markerRef.current = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(coords.lat, coords.lng),
        map: mapInstanceRef.current,
        title: building.name,
      })
    } else {
      // Update existing map
      const newCenter = new window.naver.maps.LatLng(coords.lat, coords.lng)
      mapInstanceRef.current.setCenter(newCenter)

      if (markerRef.current) {
        markerRef.current.setPosition(newCenter)
        markerRef.current.setTitle(building.name)
      }
    }
  }, [isLoaded, building])

  return <div ref={mapRef} className="w-full h-full" />
}
