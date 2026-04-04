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
  if (typeof property.lat === 'number' && typeof property.lng === 'number' && !isNaN(property.lat) && !isNaN(property.lng)) {
    return { lat: property.lat, lng: property.lng }
  }
  const c = property.coordinates
  if (!c) return null
  if (c.coordinates?.length === 2) return { lng: c.coordinates[0], lat: c.coordinates[1] }
  if (typeof c.lat === 'number' && typeof c.lng === 'number') return c
  return null
}

// Build a pin element: circle head + triangle tip pointing down
// Returns { el, head, tip } so we can update colors on select/deselect
function createPinElement(color: string) {
  const el = document.createElement('div')
  el.style.cssText = [
    'width:32px', 'height:42px',
    'cursor:pointer', 'pointer-events:all',
    'position:relative',
    'display:flex', 'flex-direction:column', 'align-items:center',
    'user-select:none',
  ].join(';')

  const head = document.createElement('div')
  head.style.cssText = [
    'width:32px', 'height:32px', 'border-radius:50%',
    `background:${color}`, 'border:2.5px solid white',
    'box-shadow:0 2px 8px rgba(0,0,0,0.35)',
    'display:flex', 'align-items:center', 'justify-content:center',
    'transition:background 0.2s, transform 0.2s',
    'flex-shrink:0',
  ].join(';')

  head.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`

  const tip = document.createElement('div')
  tip.style.cssText = [
    'width:0', 'height:0',
    'border-left:7px solid transparent',
    'border-right:7px solid transparent',
    `border-top:10px solid ${color}`,
    'margin-top:-1px',
    'transition:border-top-color 0.2s',
  ].join(';')

  el.appendChild(head)
  el.appendChild(tip)
  return { el, head, tip }
}

export function PropertyMap({
  properties,
  center = { lat: 9.0248, lng: 38.7469 },
  zoom = 12,
  height = 400,
  onPropertyClick,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const mbRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const selectedPinRef = useRef<{ head: HTMLDivElement; tip: HTMLDivElement; color: string } | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) { setMapError(true); return }

    let map: any = null

    import('mapbox-gl').then((mapboxgl) => {
      const MB = mapboxgl.default || mapboxgl
      MB.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
      mbRef.current = MB

      try {
        const safeLng = typeof center.lng === 'number' && !isNaN(center.lng) ? center.lng : 38.7469
        const safeLat = typeof center.lat === 'number' && !isNaN(center.lat) ? center.lat : 9.0248
        const safeZoom = typeof zoom === 'number' && !isNaN(zoom) ? zoom : 12

        map = new MB.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [safeLng, safeLat],
          zoom: safeZoom,
          attributionControl: false,
        })

        map.addControl(new MB.NavigationControl({ showCompass: false }), 'top-right')
        mapRef.current = map

        map.on('load', () => {
          // Show English name — Amharic requires a custom Mapbox Studio style with Ethiopic fonts
          map.getStyle().layers.forEach((layer: any) => {
            if (layer.type === 'symbol' && layer.layout?.['text-field']) {
              map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name'], ''])
            }
          })
          addMarkers(map, MB)
        })
        map.on('error', (e: any) => console.error('Map error:', e))
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

  // Re-render markers and fly to fit them whenever the properties list changes
  useEffect(() => {
    const map = mapRef.current
    const MB = mbRef.current
    if (!map || !MB || !map.isStyleLoaded()) return

    addMarkers(map, MB)
    setSelectedProperty(null)
    selectedPinRef.current = null

    // Fly to fit all visible markers
    const coords = properties.map(getCoords).filter(Boolean) as { lat: number; lng: number }[]
    if (coords.length === 0) return
    if (coords.length === 1) {
      map.flyTo({ center: [coords[0].lng, coords[0].lat], zoom: 15, duration: 800 })
    } else {
      const bounds = new MB.LngLatBounds()
      coords.forEach(c => bounds.extend([c.lng, c.lat]))
      map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 800 })
    }
  }, [properties])

  function addMarkers(map: any, MB: any) {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    properties.forEach(property => {
      const coords = getCoords(property)
      if (!coords) return

      const pinColor = property.is_featured ? '#f59e0b' : '#dc2626'
      const { el, head, tip } = createPinElement(pinColor)

      // Hover effect
      el.addEventListener('mouseenter', () => {
        if (selectedPinRef.current?.head !== head) {
          head.style.transform = 'scale(1.15)'
        }
      })
      el.addEventListener('mouseleave', () => {
        if (selectedPinRef.current?.head !== head) {
          head.style.transform = 'scale(1)'
        }
      })

      // Click: reset previous pin, highlight this one
      el.addEventListener('click', (e) => {
        e.stopPropagation()

        // Reset previously selected pin
        if (selectedPinRef.current) {
          const { head: prevHead, tip: prevTip, color: prevColor } = selectedPinRef.current
          prevHead.style.background = prevColor
          prevTip.style.borderTopColor = prevColor
          prevHead.style.transform = 'scale(1)'
        }

        // Highlight this pin
        head.style.background = '#1a3d2b'
        tip.style.borderTopColor = '#1a3d2b'
        head.style.transform = 'scale(1.2)'
        selectedPinRef.current = { head, tip, color: pinColor }

        setSelectedProperty(property)
        if (onPropertyClick) onPropertyClick(property)
        map.flyTo({ center: [coords.lng, coords.lat], zoom: 15, duration: 800 })
      })

      try {
        // anchor:'bottom' so the triangle tip touches the exact coordinate
        const marker = new MB.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map)

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
        <div style={{ position: 'absolute', bottom: 16, left: 16, width: 240, background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{selectedProperty.title}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                {(selectedProperty as any).neighborhood?.name || selectedProperty.city}
                {selectedProperty.bedrooms ? ` · ${selectedProperty.bedrooms} bed` : ''}
                {selectedProperty.size_sqm ? ` · ${selectedProperty.size_sqm}m²` : ''}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3d2b' }}>
                {formatETB(selectedProperty.listing_intent === 'rent' ? selectedProperty.rent_per_month_etb : selectedProperty.price_etb)}
                {selectedProperty.listing_intent === 'rent' && <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>/mo</span>}
              </div>
            </div>
            <button
              onClick={() => {
                // Also reset the pin color when closing the popup
                if (selectedPinRef.current) {
                  const { head, tip, color } = selectedPinRef.current
                  head.style.background = color
                  tip.style.borderTopColor = color
                  head.style.transform = 'scale(1)'
                  selectedPinRef.current = null
                }
                setSelectedProperty(null)
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, padding: '0 4px', lineHeight: 1 }}
            >×</button>
          </div>
          <a href={`/property/${selectedProperty.id}`}
            style={{ display: 'block', marginTop: 10, background: '#1a3d2b', color: '#fff', textAlign: 'center', padding: '9px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
          >
            View property →
          </a>
        </div>
      )}
    </div>
  )
}
