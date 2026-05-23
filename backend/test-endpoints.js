const BASE_URL = 'http://127.0.0.1:5000/api/v1';
const ROOT_URL = 'http://127.0.0.1:5000';

const runTests = async () => {
  console.log('🚀 STARTING FULL API ENDPOINT DIAGNOSTIC TEST ROUTINE\n');

  // Test 1: Root endpoint
  try {
    const res = await fetch(ROOT_URL);
    const data = await res.json();
    console.log(`✅ [GET /] Status: ${res.status} | Response Name: "${data.name}"`);
  } catch (err) {
    console.error('❌ [GET /] failed:', err.message);
  }

  // Test 2: Health probe
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log(`✅ [GET /health] Status: ${res.status} | DB Status: "${data.db}"`);
  } catch (err) {
    console.error('❌ [GET /health] failed:', err.message);
  }

  // Test 3: Liveness probe
  try {
    const res = await fetch(`${BASE_URL}/health/liveness`);
    const data = await res.json();
    console.log(`✅ [GET /health/liveness] Status: ${res.status} | Liveness: "${data.status}"`);
  } catch (err) {
    console.error('❌ [GET /health/liveness] failed:', err.message);
  }

  // Test 4: Readiness probe
  try {
    const res = await fetch(`${BASE_URL}/health/readiness`);
    const data = await res.json();
    console.log(`✅ [GET /health/readiness] Status: ${res.status} | Readiness: "${data.status}"`);
  } catch (err) {
    console.error('❌ [GET /health/readiness] failed:', err.message);
  }

  // Test 5: Login with email
  let accessToken = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'superadmin@lasustech.edu.ng',
        password: 'Password123!'
      })
    });
    const data = await res.json();
    if (data.success) {
      accessToken = data.data.accessToken;
      console.log(`✅ [POST /auth/login] (Email) Status: ${res.status} | User: "${data.data.user.name}" | Token Generated: Yes`);
    } else {
      console.error(`❌ [POST /auth/login] (Email) failed:`, data.message);
    }
  } catch (err) {
    console.error('❌ [POST /auth/login] (Email) failed:', err.message);
  }

  // Test 6: Login with Matric number
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '220303010001',
        password: 'Password123!'
      })
    });
    const data = await res.json();
    if (data.success) {
      console.log(`✅ [POST /auth/login] (Matric) Status: ${res.status} | User ID: "${data.data.user.id}" | Role: "${data.data.user.role}"`);
    } else {
      console.error(`❌ [POST /auth/login] (Matric) failed:`, data.message);
    }
  } catch (err) {
    console.error('❌ [POST /auth/login] (Matric) failed:', err.message);
  }

  // Test 7: Get Me (requires JWT)
  if (accessToken) {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      console.log(`✅ [GET /auth/me] Status: ${res.status} | Name in Profile: "${data.data.name}"`);
    } catch (err) {
      console.error('❌ [GET /auth/me] failed:', err.message);
    }
  }

  // Test 8: Public tracking of an empty/invalid ID (verifies no server crash)
  try {
    const res = await fetch(`${BASE_URL}/complaints/track/CMP-INVALID`);
    const data = await res.json();
    console.log(`✅ [GET /complaints/track/:refId] (Negative Test) Status: ${res.status} | Msg: "${data.message}"`);
  } catch (err) {
    console.error('❌ [GET /complaints/track/:refId] failed:', err.message);
  }

  console.log('\n🏁 API DIAGNOSTIC COMPLETED');
};

runTests();
