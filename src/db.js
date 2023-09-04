const mysql = require('mysql2/promise');

//   {
//   host: process.env.DB_PLANET_SCALE_HOST,
//   user: process.env.DB_PLANET_SCALE_USER,
//   password: process.env.DB_PLANET_SCALE_PASSWORD,
//   database: process.env.DB_PLANET_SCALE_NAME,
// }
const connection = mysql.createConnection(process.env.DB_PLANET_SCALE_STRING_CONNECTION);

connection
  .then((res) => {
    console.log(`DB ${res.config.database} Connected!`);
  })
  .catch((err) => {
    console.log('-- Error connecting DB: --', err);
  });
 
async function executeQuery(query, params = []) {
  try {
    const db = await connection
    const [rows, fields] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw new Error(`Error en la consulta: ${error.message}`);
  }
}

module.exports = { db: connection, query: executeQuery };
