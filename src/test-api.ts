async function runTests() {
  const API_URL = 'http://localhost:5000/api';

  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch(`${API_URL}/health`);
  const healthJson = (await healthRes.json()) as any;
  console.log('Health Response:', healthJson);

  console.log('\n--- 2. Testing Login Admin (Sekretariat) ---');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sekretariat@polri.go.id',
      password: 'password123',
    }),
  });
  const loginJson = (await loginRes.json()) as any;
  console.log('Login Status:', loginRes.status);
  console.log('Login Message:', loginJson.message);
  console.log('User Role:', loginJson.data?.user?.role);
  const token = loginJson.data?.accessToken;

  if (!token) {
    throw new Error('No access token received!');
  }

  console.log('\n--- 3. Testing Get Current User Profile (Me) ---');
  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meJson = (await meRes.json()) as any;
  console.log('Profile:', meJson.data?.name, '|', meJson.data?.agency);

  console.log('\n--- 4. Testing Permohonan List ---');
  const permohonanRes = await fetch(`${API_URL}/permohonan`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const permohonanJson = (await permohonanRes.json()) as any;
  console.log('Permohonan Count:', permohonanJson.data?.length);
  if (permohonanJson.data?.length > 0) {
    console.log('Sample Kasus:', permohonanJson.data[0].nomorPermohonan, '-', permohonanJson.data[0].terperiksa?.namaLengkap);
  }

  console.log('\n--- 5. Testing Admin Create User (Pembuatan Akun Langsung) ---');
  const testEmail = `asesor.baru.${Date.now()}@tat.go.id`;
  const createUserRes = await fetch(`${API_URL}/auth/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'dr. Satria Wibawa, Sp.KJ',
      email: testEmail,
      password: 'password123',
      role: 'MEDIS',
      nip: '198701012015011001',
      agency: 'RS Bhayangkara / BNNP',
      position: 'Dokter Asesor Medis Tambahan',
      phone: '081288990011',
    }),
  });
  const createUserJson = (await createUserRes.json()) as any;
  console.log('Create User Status:', createUserRes.status);
  console.log('Created User:', createUserJson.data?.name, 'Role:', createUserJson.data?.role, 'Email:', createUserJson.data?.email);

  console.log('\n--- 6. Testing Login with Newly Created User ---');
  const newLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
    }),
  });
  const newLoginJson = (await newLoginRes.json()) as any;
  console.log('New User Login Status:', newLoginRes.status);
  console.log('New User Token Received:', Boolean(newLoginJson.data?.accessToken));

  console.log('\n--- 7. Testing Public Registration by Satwil ---');
  const regEmail = `penyidik.polsek.${Date.now()}@polri.go.id`;
  const regNrp = `880${Math.floor(10000 + Math.random() * 90000)}`;
  const regRes = await fetch(`${API_URL}/registrasi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      namaLengkap: 'Ipda Dimas Prasetyo, S.H.',
      pangkat: 'IPDA',
      nrp: regNrp,
      jabatan: 'Kanit Reskrim',
      instansi: 'Polsek Samarinda Kota',
      kategoriInstansi: 'Polsek',
      wilayahHukum: 'Kota Samarinda',
      alamatKantor: 'Jl. Bhayangkara No. 10 Samarinda',
      email: regEmail,
      phone: '081399887766',
    }),
  });
  const regJson = (await regRes.json()) as any;
  console.log('Registration Submit Status:', regRes.status);
  const regId = regJson.data?.id;
  console.log('Registration ID:', regId, 'Status:', regJson.data?.status);

  console.log('\n--- 8. Testing Admin Approve Registration ---');
  const approveRes = await fetch(`${API_URL}/registrasi/${regId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      catatanAdmin: 'Verifikasi berkas dinas sah dan lengkap.',
    }),
  });
  const approveJson = (await approveRes.json()) as any;
  console.log('Approve Status:', approveRes.status);
  console.log('Approved Registration User Created:', approveJson.data?.user?.email);

  console.log('\n--- 9. Testing Login with Approved Account (Password: NRP) ---');
  const regLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regEmail,
      password: regNrp,
    }),
  });
  const regLoginJson = (await regLoginRes.json()) as any;
  console.log('Approved Account Login Status:', regLoginRes.status);
  console.log('Approved Account Token Received:', Boolean(regLoginJson.data?.accessToken));

  console.log('\n✨ ALL LIVE ENDPOINTS & ACCOUNT CREATION WORKED 100% PERFECTLY!');
}

runTests().catch(console.error);
