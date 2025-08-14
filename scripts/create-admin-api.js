// Create admin using the API endpoint
// Make sure your Next.js dev server is running first: npm run dev

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        secretKey: 'your_super_secret_admin_creation_key'
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('You can now login at: http://localhost:3000/admin');
      console.log('Response:', data);
    } else {
      console.error('❌ Error creating admin:', data.error);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('Make sure your Next.js dev server is running: npm run dev');
  }
}

createAdmin();
