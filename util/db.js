import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mysql@123",
  database: "man_and_van_libya",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("MySQL Connected");




