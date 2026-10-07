import 'dotenv/config';

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');

  const recipients = ['harykurniawan155@gmail.com'];
  
  // Test with onboarding@resend.dev
  const payload = {
    from: 'E-TAT POLRI <onboarding@resend.dev>',
    to: recipients,
    subject: '[E-TAT POLRI] Uji Coba Pengiriman Email Asesor Hukum',
    html: '<h3>Halo Asesor Hukum</h3><p>Ini adalah email uji coba dari sistem E-TAT POLRI.</p>',
  };

  console.log('Mengirim via Resend API...');
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

testResend().catch(console.error);
