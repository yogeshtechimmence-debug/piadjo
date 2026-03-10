import { db } from "../../util//db.js";


export const createCard = (data, cb) => {
  db.query(
    "INSERT INTO cards (user_id, name, title, description, price) VALUES (?, ?, ?, ?, ?)",
    data,
    cb
  );
};

export const getCards = (userId, cb) => {
  db.query("SELECT * FROM cards WHERE user_id = ?", [userId], cb);
};