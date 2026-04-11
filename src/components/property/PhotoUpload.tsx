'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'

interface Props {
  onUpload: (urls: string[]) => void
  maxPhotos?: number
  existingPhotos?: string[]
}

export function PhotoUpload({ onUpload, maxPhotos = 8, existingPhotos = [] }: Props) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (photos.length + fileArray.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    setUploading(true)
    setError('')
    const sb = createClient()
    const newUrls: string[] = []

    // Only allow safe raster formats — SVG is excluded (can carry XSS)
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, WebP, or GIF files are allowed')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each photo must be under 5MB')
        continue
      }

      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `property-photos/${filename}`

      const { data, error: uploadError } = await sb.storage
        .from('properties')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        continue
      }

      const { data: { publicUrl } } = sb.storage
        .from('properties')
        .getPublicUrl(path)

      newUrls.push(publicUrl)
    }

    const updated = [...photos, ...newUrls]
    setPhotos(updated)
    onUpload(updated)
    setUploading(false)
  }

  function removePhoto(url: string) {
    const updated = photos.filter(p => p !== url)
    setPhotos(updated)
    onUpload(updated)
  }

  // ── File drop on upload zone ──
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files)
  }

  // ── Drag-to-reorder handlers ──
  function handleItemDragStart(e: React.DragEvent, i: number) {
    setDragIndex(i)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleItemDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (i !== overIndex) setOverIndex(i)
  }

  function handleItemDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    const reordered = [...photos]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(i, 0, moved)
    setPhotos(reordered)
    onUpload(reordered)
    setDragIndex(null)
    setOverIndex(null)
  }

  function handleItemDragEnd() {
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div>
      {/* Upload zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? '#16a34a' : '#d0d0cc'}`,
          borderRadius: 12, padding: '28px 20px', textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? '#f0fdf4' : '#fafaf8',
          transition: 'all .15s', marginBottom: 14,
        }}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple style={{ display: 'none' }}
          onChange={e => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Loader size={28} color="#16a34a" style={{ animation: 'spin 1s linear infinite' }}/>
            <div style={{ fontSize: 14, color: '#16a34a', fontWeight: 600 }}>Uploading photos...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Upload size={28} color="#aaa"/>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>
              Click to upload or drag and drop
            </div>
            <div style={{ fontSize: 12, color: '#aaa' }}>
              JPG, PNG, WEBP up to 5MB each · Max {maxPhotos} photos
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {photos.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={e => handleItemDragStart(e, i)}
              onDragOver={e => handleItemDragOver(e, i)}
              onDrop={e => handleItemDrop(e, i)}
              onDragEnd={handleItemDragEnd}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 10,
                overflow: 'hidden',
                border: overIndex === i && dragIndex !== i
                  ? '2px solid #16a34a'
                  : '1px solid #eae9e4',
                opacity: dragIndex === i ? 0.4 : 1,
                cursor: 'grab',
                transition: 'opacity .15s, border .15s',
              }}
            >
              <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}/>
              {i === 0 && (
                <div style={{ position: 'absolute', top: 6, left: 6, background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                  COVER
                </div>
              )}
              <button
                onClick={() => removePhoto(url)}
                style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <X size={12}/>
              </button>
            </div>
          ))}
          {photos.length < maxPhotos && (
            <div
              onClick={() => inputRef.current?.click()}
              style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed #d0d0cc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafaf8' }}
            >
              <ImageIcon size={20} color="#ccc"/>
            </div>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
          First photo is the cover image · Drag to reorder
        </div>
      )}
    </div>
  )
}
