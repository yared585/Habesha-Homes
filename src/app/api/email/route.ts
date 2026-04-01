import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Habesha Properties <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://habeshaproperties.com'
// Until domain is verified, all emails go to admin email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'yohanesy585@gmail.com'

// ── Email templates ────────────────────────────────────────────────────────

function inquiryEmailHtml({ agentName, buyerName, buyerEmail, buyerPhone, message, propertyTitle, propertyUrl }: any) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    
    <!-- Header -->
    <div style="background:#0d2318;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">New Inquiry</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Someone is interested in your property</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border:1px solid #eae9e4;border-top:none;">
      <p style="font-size:15px;color:#333;margin:0 0 20px;">Hi <strong>${agentName}</strong>,</p>
      <p style="font-size:15px;color:#333;margin:0 0 24px;">
        A potential buyer has sent an inquiry about your listing on Habesha Properties.
      </p>

      <!-- Property -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Property</div>
        <a href="${propertyUrl}" style="font-size:16px;font-weight:700;color:#111;text-decoration:none;">${propertyTitle}</a>
      </div>

      <!-- Buyer details -->
      <div style="background:#f9f9f7;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:14px;">Buyer Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="font-size:13px;color:#888;padding:5px 0;width:80px;">Name</td><td style="font-size:14px;font-weight:600;color:#111;padding:5px 0;">${buyerName}</td></tr>
          <tr><td style="font-size:13px;color:#888;padding:5px 0;">Email</td><td style="font-size:14px;color:#111;padding:5px 0;"><a href="mailto:${buyerEmail}" style="color:#16a34a;">${buyerEmail}</a></td></tr>
          ${buyerPhone ? `<tr><td style="font-size:13px;color:#888;padding:5px 0;">Phone</td><td style="font-size:14px;color:#111;padding:5px 0;"><a href="tel:${buyerPhone}" style="color:#16a34a;">${buyerPhone}</a></td></tr>` : ''}
        </table>
      </div>

      <!-- Message -->
      <div style="margin-bottom:28px;">
        <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">Their Message</div>
        <div style="background:#f9f9f7;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:14px 16px;font-size:14px;color:#555;line-height:1.7;">
          ${message}
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="mailto:${buyerEmail}" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;margin-right:10px;">
          Reply to buyer
        </a>
        <a href="${propertyUrl}" style="display:inline-block;background:#f9f9f7;color:#555;padding:13px 24px;border-radius:10px;font-size:14px;font-weight:500;text-decoration:none;border:1px solid #eae9e4;">
          View listing
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f7;border:1px solid #eae9e4;border-top:none;border-radius:0 0 14px 14px;padding:20px 32px;text-align:center;">
      <p style="font-size:12px;color:#aaa;margin:0;">
        Habesha Properties · Ethiopian Property Marketplace<br/>
        <a href="${APP_URL}" style="color:#16a34a;text-decoration:none;">${APP_URL}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function listingApprovedHtml({ agentName, propertyTitle, propertyUrl }: any) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#0d2318;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Listing Approved! ✓</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Your property is now live on Habesha Properties</p>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #eae9e4;border-top:none;">
      <p style="font-size:15px;color:#333;margin:0 0 20px;">Hi <strong>${agentName}</strong>,</p>
      <p style="font-size:15px;color:#333;margin:0 0 24px;">
        Great news! Your property listing has been reviewed and approved. It is now live and visible to buyers on Habesha Properties.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:28px;">
        <div style="font-size:16px;font-weight:700;color:#111;">${propertyTitle}</div>
        <div style="font-size:13px;color:#16a34a;margin-top:4px;">✓ Now live and searchable</div>
      </div>
      <div style="text-align:center;">
        <a href="${propertyUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
          View your listing →
        </a>
      </div>
    </div>
    <div style="background:#f9f9f7;border:1px solid #eae9e4;border-top:none;border-radius:0 0 14px 14px;padding:16px 32px;text-align:center;">
      <p style="font-size:12px;color:#aaa;margin:0;">Habesha Properties · <a href="${APP_URL}" style="color:#16a34a;">${APP_URL}</a></p>
    </div>
  </div>
</body>
</html>`
}

function welcomeEmailHtml({ name, role }: any) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#0d2318;border-radius:14px 14px 0 0;padding:28px 32px;text-align:center;">
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Welcome to Habesha Properties! 🇪🇹</h1>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">Ethiopia's smartest property marketplace</p>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #eae9e4;border-top:none;">
      <p style="font-size:15px;color:#333;margin:0 0 16px;">Hi <strong>${name}</strong>, እንኳን ደህና መጡ!</p>
      <p style="font-size:15px;color:#333;margin:0 0 24px;">
        ${role === 'agent' 
          ? 'Your agent account is ready. Start adding your listings and reach thousands of buyers across Ethiopia and the diaspora.'
          : 'Your account is ready. Browse thousands of verified properties and use our AI assistant to find your perfect home in Ethiopia.'
        }
      </p>
      <div style="text-align:center;">
        <a href="${APP_URL}${role === 'agent' ? '/dashboard/listings/new' : '/search'}" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;">
          ${role === 'agent' ? 'Add your first listing →' : 'Browse properties →'}
        </a>
      </div>
    </div>
    <div style="background:#f9f9f7;border:1px solid #eae9e4;border-top:none;border-radius:0 0 14px 14px;padding:16px 32px;text-align:center;">
      <p style="font-size:12px;color:#aaa;margin:0;">Habesha Properties · <a href="${APP_URL}" style="color:#16a34a;">${APP_URL}</a></p>
    </div>
  </div>
</body>
</html>`
}

// ── API handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, to, data } = body

    if (!type || !to) {
      return NextResponse.json({ error: 'Missing type or to' }, { status: 400 })
    }

    let subject = ''
    let html = ''

    switch (type) {
      case 'inquiry':
        subject = `New inquiry for "${data.propertyTitle}" — Habesha Properties`
        html = inquiryEmailHtml({
          ...data,
          propertyUrl: `${APP_URL}/property/${data.propertyId}`,
        })
        break

      case 'listing_approved':
        subject = `Your listing "${data.propertyTitle}" is now live! ✓`
        html = listingApprovedHtml({
          ...data,
          propertyUrl: `${APP_URL}/property/${data.propertyId}`,
        })
        break

      case 'welcome':
        subject = `Welcome to Habesha Properties, ${data.name}! 🇪🇹`
        html = welcomeEmailHtml(data)
        break

      case 'contact':
        subject = `Contact form: ${data.subject} — from ${data.name}`
        html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f9f7;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d2318;border-radius:14px 14px 0 0;padding:24px 32px;">
<h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">New Contact Form Message</h1>
</div>
<div style="background:#fff;padding:28px 32px;border:1px solid #eae9e4;border-top:none;border-radius:0 0 14px 14px;">
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
<tr><td style="font-size:13px;color:#888;padding:6px 0;width:80px;">Name</td><td style="font-size:14px;font-weight:600;color:#111;">${data.name}</td></tr>
<tr><td style="font-size:13px;color:#888;padding:6px 0;">Email</td><td style="font-size:14px;color:#111;"><a href="mailto:${data.email}" style="color:#16a34a;">${data.email}</a></td></tr>
${data.phone ? `<tr><td style="font-size:13px;color:#888;padding:6px 0;">Phone</td><td style="font-size:14px;color:#111;">${data.phone}</td></tr>` : ''}
<tr><td style="font-size:13px;color:#888;padding:6px 0;">Subject</td><td style="font-size:14px;font-weight:600;color:#111;">${data.subject}</td></tr>
</table>
<div style="background:#f9f9f7;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:14px 16px;font-size:14px;color:#555;line-height:1.7;">${data.message}</div>
<div style="margin-top:20px;">
<a href="mailto:${data.email}" style="display:inline-block;background:#16a34a;color:#fff;padding:11px 24px;border-radius:9px;font-size:14px;font-weight:700;text-decoration:none;">Reply to ${data.name}</a>
</div>
</div>
</div>
</body></html>`
        break

      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    // Use admin email until domain is verified
    const recipient = process.env.DOMAIN_VERIFIED === 'true' ? to : ADMIN_EMAIL

    const { data: result, error } = await resend.emails.send({
      from: FROM,
      to: recipient,
      subject: recipient !== to ? `[To: ${to}] ${subject}` : subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: result?.id })
  } catch (err: any) {
    console.error('Email API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
