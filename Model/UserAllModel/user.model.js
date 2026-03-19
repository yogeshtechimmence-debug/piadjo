import { db } from "../../util//db.js";

export const findUserByEmail = (email, cb) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], cb);
};

export const createUser = (data, cb) => {
  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    data,
    cb
  );
};
