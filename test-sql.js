const sql = require('mssql');

const config = {
  user: 'appuser',
  password: 'appuser',
  server: 'localhost',
  port: 1433,
  database: 'Prachinburi2',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

sql.connect(config).then(pool => {
  return pool.request().query('SELECT 1 AS test');
}).then(result => {
  console.log('✅ SQL Connected:', result.recordset);
}).catch(err => {
  console.error('❌ SQL Connect Error:', err);
});
