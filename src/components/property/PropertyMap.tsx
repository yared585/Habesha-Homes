'use client'

import { useEffect, useRef, useState } from 'react'
import type { Property } from '@/types'
import { formatETB } from '@/lib/utils'

interface PropertyMapProps {
  properties: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: number
  onPropertyClick?: (property: Property) => void
}

function getCoords(property: any): { lat: number; lng: number } | null {
  // Try plain lat/lng columns first (most reliable)
  if (typeof property.lat === 'number' && typeof property.lng === 'number' && !isNaN(property.lat) && !isNaN(property.lng)) {
    return { lat: property.lat, lng: property.lng }
  }
  // Try coordinates object
  const c = property.coordinates
  if (!c) return null
  if (c.coordinates?.length === 2) return { lng: c.coordinates[0], lat: c.coordinates[1] }
  if (typeof c.lat === 'number' && typeof c.lng === 'number') return c
  return null
}

export function PropertyMap({
  properties,
  center = { lat: 9.0248, lng: 38.7469 },
  zoom = 12,
  height = 400,
  onPropertyClick
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) { setMapError(true); return }

    let map: any = null

    import('mapbox-gl').then((mapboxgl) => {
      const MB = mapboxgl.default || mapboxgl
      MB.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

      try {
        // Ensure valid coordinates
        const safeLng = typeof center.lng === 'number' && !isNaN(center.lng) ? center.lng : 38.7469
        const safeLat = typeof center.lat === 'number' && !isNaN(center.lat) ? center.lat : 9.0248
        const safeZoom = typeof zoom === 'number' && !isNaN(zoom) ? zoom : 12

        map = new MB.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [safeLng, safeLat],
          zoom: safeZoom,
          attributionControl: false,
        })

        map.addControl(new MB.NavigationControl({ showCompass: false }), 'top-right')
        mapRef.current = map

        map.on('load', () => {
          addMarkers(map, MB)
        })

        map.on('error', (e: any) => {
          console.error('Map error:', e)
        })
      } catch (err) {
        console.error('Map init error:', err)
        setMapError(true)
      }
    }).catch(err => {
      console.error('Mapbox import error:', err)
      setMapError(true)
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (map) { map.remove(); mapRef.current = null }
    }
  }, [])

  function addMarkers(map: any, MB: any) {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    properties.forEach(property => {
      const coords = getCoords(property)
      if (!coords) return

      const price = property.listing_intent === 'rent' ? property.rent_per_month_etb : property.price_etb
      const label = formatETB(price)

      const el = document.createElement('div')
      el.style.cssText = `
        background: ${property.is_featured ? '#16a34a' : '#111'};
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        font-family: system-ui, sans-serif;
        transition: transform 0.1s;
        user-select: none;
      `
      el.textContent = label
      el.onmouseenter = () => el.style.transform = 'scale(1.08)'
      el.onmouseleave = () => el.style.transform = 'scale(1)'

      try {
        const marker = new MB.Marker({ element: el })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map)

        el.addEventListener('click', () => {
          setSelectedProperty(property)
          if (onPropertyClick) onPropertyClick(property)
          map.flyTo({ center: [coords.lng, coords.lat], zoom: 15, duration: 800 })
        })

        markersRef.current.push(marker)
      } catch (err) {
        console.error('Marker error:', err)
      }
    })
  }

  if (mapError) return (
    <div style={{ height, background: '#f0f0ec', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#888', fontSize: 13 }}>
      <div>Map not available</div>
      <div style={{ fontSize: 11 }}>Add NEXT_PUBLIC_MAPBOX_TOKEN to enable map view</div>
    </div>
  )

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height }}/>

      {selectedProperty && (
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: '#fff', borderRadius: 12, padding: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{selectedProperty.title}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                {(selectedProperty as any).neighborhood?.name || selectedProperty.city}
                {selectedProperty.bedrooms ? ` · ${selectedProperty.bedrooms} bed` : ''}
                {selectedProperty.size_sqm ? ` · ${selectedProperty.size_sqm}m²` : ''}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
                {formatETB(selectedProperty.listing_intent === 'rent' ? selectedProperty.rent_per_month_etb : selectedProperty.price_etb)}
                {selectedProperty.listing_intent === 'rent' && <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>/mo</span>}
              </div>
            </div>
            <button onClick={() => setSelectedProperty(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, padding: '0 4px', lineHeight: 1 }}
            >×</button>
          </div>
          <a href={`/property/${selectedProperty.id}`}
            style={{ display: 'block', marginTop: 10, background: '#16a34a', color: '#fff', textAlign: 'center', padding: '9px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
          >
            View property →
          </a>
        </div>
      )}
    </div>
  )
}
