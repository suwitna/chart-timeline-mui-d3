const sql = require('mssql')

const config = {
  user: 'appuser',
  password: 'appuser',
  server: 'localhost', // หรือ 'localhost'
  port: 1433,
  database: 'Prachinburi2',
  options: {
    encrypt: true, // หากใช้ SQL Server Express หรือ Azure อาจต้องเปิด
    trustServerCertificate: true // กรณีใช้ local dev
  }
}

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Database connection success');
    return pool;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    throw err;
  }
}