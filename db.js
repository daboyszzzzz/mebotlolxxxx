const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',    // Change if using a remote database
  user: 'root',         // Your MySQL username
  password: 'mystMysqIli!!2', // Your MySQL password
  database: 'yep_rip_db'
}).promise();

module.exports = pool;
