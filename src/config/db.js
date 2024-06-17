const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error in connection to DataBase :", err);
    return;
  }
  console.log("Connected to DataBase");
});

// db.query('Added Information of user', user, (err, res) => {
//     if (err) throw err;
//     console.log('New users added to DataBase with ID :', res.insertId);
// });

// db.end();

module.exports = db;
