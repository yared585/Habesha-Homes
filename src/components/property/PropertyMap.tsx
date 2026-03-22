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

export function PropertyMap({
  properties,
  center = { lat: 9.0248, lng: 38.7469 }, // Addis Ababa center
  zoom = 12,
  height = 400,
  onPropertyClick
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    // Dynamically import mapbox-gl to avoid SSR issues
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [center.lng, center.lat],
        zoom,
        attributionControl: false
      })

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.addControl(new mapboxgl.AttributionControl({ compact: true }))

      map.on('load', () => {
        mapRef.current = map
        setMapLoaded(true)
        addMarkers(map, mapboxgl)
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  function addMarkers(map: any, mapboxgl: any) {
    properties.forEach(property => {
      if (!property.coordinates) return

      // Create custom marker element
      const el = document.createElement('div')
      el.style.cssText = `
        background: ${property.is_featured ? '#1D9E75' : '#111'};
        color: white;
        padding: 6px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: transform .1s;
      `
      el.textContent = formatETB(property.listing_intent === 'rent' ? property.rent_per_month_etb : property.price_etb)
      el.onmouseenter = () => { el.style.transform = 'scale(1.05)' }
      el.onmouseleave = () => { el.style.transform = 'scale(1)' }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([property.coordinates!.lng, property.coordinates!.lat])
        .addTo(map)

      el.addEventListener('click', () => {
        setSelectedProperty(property)
        if (onPropertyClick) onPropertyClick(property)
        map.flyTo({ center: [property.coordinates!.lng, property.coordinates!.lat], zoom: 15 })
      })
    })
  }

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    // Clear and re-add markers (simplified — in production use GeoJSON source)
  }, [properties, mapLoaded])

  return (
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height }} />

      {/* Selected property popup */}
      {selectedProperty && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          background: 'white', borderRadius: 10, padding: 14,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>
                {selectedProperty.title}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                {selectedProperty.neighborhood?.name} · {selectedProperty.bedrooms} bed · {selectedProperty.size_sqm}m²
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1D9E75' }}>
                {formatETB(selectedProperty.listing_intent === 'rent' ? selectedProperty.rent_per_month_etb : selectedProperty.price_etb)}
              </div>
            </div>
            <button
              onClick={() => setSelectedProperty(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 18, padding: '0 4px' }}
            >
              ×
            </button>
          </div>
          <a
            href={`/property/${selectedProperty.id}`}
            style={{
              display: 'block', marginTop: 10, background: '#1D9E75', color: 'white',
              textAlign: 'center', padding: '8px', borderRadius: 7, textDecoration: 'none', fontSize: 13, fontWeight: 600
            }}
          >
            View Property
          </a>
        </div>
      )}

      {/* Token not set warning */}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div style={{
          position: 'absolute', inset: 0, background: '#f9f9f9',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, color: '#888', fontSize: 13
        }}>
          <div>Map not configured</div>
          <div style={{ fontSize: 11 }}>Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</div>
        </div>
      )}
    </div>
  )
}
