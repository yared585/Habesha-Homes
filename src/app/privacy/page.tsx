import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Habesha Homes',
  description: 'Privacy Policy for Habesha Homes Ethiopian property marketplace',
}

export default function PrivacyPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ background: '#0d2318', padding: '48px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
            {['#078930','#FCDD09','#DA121A'].map(c => <div key={c} style={{ width: 28, height: 3, borderRadius: 2, background: c }}/>)}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-.02em' }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Last updated: March 2026</p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        {[
          {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly: name, email address, phone number, and profile information when you create an account. For agents, we collect agency name and business details. We also collect property listing data, inquiry messages, and payment transaction records (processed securely by Stripe — we never store card details).'
          },
          {
            title: '2. How We Use Your Information',
            content: 'We use your information to: provide and improve our services; match buyers with relevant properties; process AI report requests; send transaction and service notifications; communicate about your account; prevent fraud and ensure platform security; comply with Ethiopian legal requirements.'
          },
          {
            title: '3. AI Processing',
            content: 'When you use AI-powered features (fraud detection, valuations, contract analysis), your uploaded documents and property details are processed by Anthropic\'s Claude AI. Documents are processed in real-time and are not stored permanently by Anthropic. We store the generated report results in your account.'
          },
          {
            title: '4. Information Sharing',
            content: 'We do not sell your personal information. We share information only: with agents when you submit an inquiry about their listing; with Stripe for payment processing; with Anthropic for AI report generation; when required by Ethiopian law or legal process; with your explicit consent.'
          },
          {
            title: '5. Data Storage',
            content: 'Your data is stored securely on Supabase (PostgreSQL database) with encryption at rest and in transit. Property photos are stored on Supabase Storage. We retain your data for as long as your account is active. You may request deletion of your account and data at any time.'
          },
          {
            title: '6. Cookies',
            content: 'We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect platform functionality.'
          },
          {
            title: '7. Diaspora Users',
            content: 'If you are an Ethiopian diaspora user accessing the platform from abroad, your data is processed in accordance with both Ethiopian data protection laws and the laws of your country of residence.'
          },
          {
            title: '8. Security',
            content: 'We implement industry-standard security measures including SSL/TLS encryption, secure authentication via Supabase Auth, and row-level security on all database tables. However, no system is completely secure — please use a strong password and protect your account credentials.'
          },
          {
            title: '9. Your Rights',
            content: 'You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your account and data; export your data; opt out of non-essential communications. Contact us at privacy@habeshahomes.com to exercise these rights.'
          },
          {
            title: '10. Changes to Privacy Policy',
            content: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email. Continued use of the platform after changes constitutes acceptance of the updated policy.'
          },
          {
            title: '11. Contact',
            content: 'For privacy questions or data requests, contact our privacy team at privacy@habeshahomes.com or through our contact page.'
          },
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 10 }}>{title}</h2>
            <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, margin: 0 }}>{content}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #eae9e4', paddingTop: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/terms" style={{ fontSize: 14, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Terms of Service →</Link>
            <Link href="/contact" style={{ fontSize: 14, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>Contact us →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
