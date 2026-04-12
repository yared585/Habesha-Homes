'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient, getClientUser } from '@/lib/supabase/client'
import { Camera, Save, User, Mail, Phone, Globe, MapPin, Loader } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px 11px 42px', border: '1.5px solid #e0dfd9',
  borderRadius: 10, fontSize: 14, outline: 'none', color: '#111',
  background: '#fff', transition: 'border .15s', fontFamily: 'inherit',
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex' }}>{icon}</div>
        {children}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { profile, loading } = useAuth(true)
  const [form, setForm] = useState({ full_name: '', phone: '', diaspora_country: '', avatar_url: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        diaspora_country: (profile as any).diaspora_country || '',
        avatar_url: (profile as any).avatar_url || '',
      })
    }
  }, [profile])

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Photo must be under 2MB'); return }

    setUploadingPhoto(true)
    setError('')
    const sb = createClient()
    const user = await getClientUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`

    const { error: uploadError } = await sb.storage.from('properties').upload(path, file, { upsert: true })
    if (uploadError) { setError('Photo upload failed: ' + uploadError.message); setUploadingPhoto(false); return }

    const { data: { publicUrl } } = sb.storage.from('properties').getPublicUrl(path)
    setForm(f => ({ ...f, avatar_url: publicUrl }))
    setUploadingPhoto(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    const sb = createClient()
    const user = await getClientUser()
    if (!user) return

    const { error: err } = await sb.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone || null,
      diaspora_country: form.diaspora_country || null,
      avatar_url: form.avatar_url || null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (err) { setError(err.message); setSaving(false); return }
    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa', fontSize: 14 }}>
      Loading profile...
    </div>
  )

  const isAgent = profile?.role === 'agent'

  return (
    <div style={{ background: '#f9f9f7', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', margin: '0 0 4px', letterSpacing: '-.02em' }}>My profile</h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            {isAgent ? '✦ Agent account' : 'Buyer account'} · {profile?.email}
          </p>
        </div>

        {/* Avatar section */}
        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eae9e4' }}/>
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700 }}>
                {form.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#16a34a', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {uploadingPhoto ? <Loader size={12} color="#fff" style={{ animation: 'spin 1s linear infinite' }}/> : <Camera size={12} color="#fff"/>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
            />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 2 }}>{form.full_name || 'Your name'}</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{profile?.email}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: isAgent ? '#f0fdf4' : '#eff6ff', color: isAgent ? '#16a34a' : '#2563eb' }}>
              {isAgent ? '✦ Agent' : 'Buyer'}
            </span>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 24, display: 'grid', gap: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Personal information</h3>

          <Field label="Full name" icon={<User size={15}/>}>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Your full name" style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
          </Field>

          <Field label="Email address" icon={<Mail size={15}/>}>
            <input value={profile?.email || ''} disabled
              style={{ ...inputStyle, background: '#f9f9f7', color: '#aaa', cursor: 'not-allowed' }}
            />
          </Field>

          <Field label="Phone number" icon={<Phone size={15}/>}>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+251 9XX XXX XXXX" style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#16a34a'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e0dfd9'}
            />
          </Field>

          {(profile as any)?.is_diaspora && (
            <Field label="Country of residence" icon={<Globe size={15}/>}>
              <select value={form.diaspora_country} onChange={e => setForm(f => ({ ...f, diaspora_country: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => (e.target as HTMLSelectElement).style.borderColor = '#16a34a'}
                onBlur={e => (e.target as HTMLSelectElement).style.borderColor = '#e0dfd9'}
              >
                <option value="">Select country</option>
                {['United States','United Kingdom','Canada','Germany','Sweden','Norway','Australia','UAE','Saudi Arabia','Other'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>
          )}

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a' }}>✓ Profile updated successfully!</div>
          )}

          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: saving ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#15803d' }}
            onMouseLeave={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#16a34a' }}
          >
            <Save size={15}/> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        {/* Account info */}
        <div style={{ background: '#fff', border: '1px solid #eae9e4', borderRadius: 16, padding: 24, marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>Account</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f2' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Account type</div>
              <div style={{ fontSize: 12, color: '#888' }}>{isAgent ? 'Real estate agent' : 'Property buyer / renter'}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: isAgent ? '#f0fdf4' : '#eff6ff', color: isAgent ? '#16a34a' : '#2563eb' }}>
              {isAgent ? 'Agent' : 'Buyer'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f2' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Password</div>
              <div style={{ fontSize: 12, color: '#888' }}>Change your account password</div>
            </div>
            <a href="/auth/reset" style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Change →</a>
          </div>
          {!isAgent && (
            <div style={{ padding: '12px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>Want to list properties?</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Upgrade to an agent account to add listings</div>
              <a href="/contact" style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>Contact us to upgrade →</a>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
