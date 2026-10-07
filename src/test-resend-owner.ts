import 'dotenv/config';

async function testResendToOwner() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = 'etatsiappulih@gmail.com';
  
  const payload = {
    from: 'E-TAT POLRI <onboarding@resend.dev>',
    to: [to],
    subject: '[E-TAT POLRI] Uji Coba Penugasan Asesmen Hukum & Medis',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
        <h2 style="color: #1e3a8a;">Sistem E-TAT POLRI - Notifikasi Asesmen</h2>
        <p>Halo Tim E-TAT,</p>
        <p>Ini adalah email simulasi notifikasi penugasan <strong>Asesor Hukum</strong> dan <strong>Asesor Medis</strong>.</p>
        <div style="background: #ffffff; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 15px 0;">
          <strong>No. Permohonan:</strong> TAT/2026/10/0008<br>
          <strong>Tersangka:</strong> Rian Saputra (28 Th)<br>
          <strong>Status Medis:</strong> FINAL (Positif Metamfetamin - Rawat Inap 3 Bulan)<br>
          <strong>Tindak Lanjut:</strong> Asesor Hukum segera melakukan telaah yuridis & sidang pleno.
        </div>
        <p style="color: #64748b; font-size: 12px;">Sistem Elektronik Tim Asesmen Terpadu POLRI</p>
      </div>
    `,
  };

  console.log(`Mengirim email uji coba ke ${to}...`);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('Status HTTP:', res.status);
  console.log('Response Body:', JSON.stringify(data, null, 2));
}

testResendToOwner().catch(console.error);
