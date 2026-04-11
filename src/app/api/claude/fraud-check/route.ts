// src/app/api/claude/fraud-check/route.ts
// Title document fraud detection using Claude Vision

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeTitleDocument } from '@/lib/claude'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // 5 fraud checks per user per hour
    const rl = rateLimit(`fraud-check:${user.id}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetIn / 1000)) } }
      )
    }

    const formData = await request.formData()
    const file = formData.get('document') as File | null
    const propertyId = formData.get('property_id') as string | null
    const context = formData.get('context') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No document provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP' 
      }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400 })
    }

    // Convert to base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Upload original to Supabase storage (private bucket)
    const fileName = `${user.id}/${Date.now()}-title-doc.${file.name.split('.').pop()}`
    const { data: uploadData } = await supabase.storage
      .from('title-documents')
      .upload(fileName, buffer, { contentType: file.type })

    const documentUrl = uploadData?.path || null

    // Run Claude fraud analysis
    const result = await analyzeTitleDocument(
      base64, 
      file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      context || undefined
    )

    // Save report to database — don't fail if columns missing
    try {
      await supabase.from('ai_reports').insert({
        property_id: propertyId || null,
        user_id: user.id,
        report_type: 'fraud_check',
        is_paid: false,
        status: 'completed',
      })
    } catch {
      // Report save skipped — non-critical
    }

    // If property_id provided, update property record
    if (propertyId && result.verdict === 'safe') {
      await supabase
        .from('properties')
        .update({
          title_document_url: documentUrl,
          title_verification_report: result
        })
        .eq('id', propertyId)
    }

    return NextResponse.json({
      success: true,
      report_id: null,
      result,
    })

  } catch (error) {
    console.error('Fraud check error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}