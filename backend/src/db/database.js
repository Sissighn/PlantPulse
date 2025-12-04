const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "plants.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Fehler:", err.message);
  else console.log("📦 Verbunden mit SQLite.");
});

db.serialize(() => {
  // Wir fügen die Spalte 'image' hinzu
  db.run(`CREATE TABLE IF NOT EXISTS plants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    baseInterval INTEGER,
    lastWatered TEXT,
    image TEXT 
  )`);
});

exports.findAll = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM plants", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM plants WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

exports.create = (plant) => {
  return new Promise((resolve, reject) => {
    // Hier wird jetzt auch das IMAGE gespeichert
    const sql = `INSERT INTO plants (id, name, type, baseInterval, lastWatered, image) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      plant.id,
      plant.name,
      plant.type,
      plant.baseInterval,
      plant.lastWatered,
      plant.image,
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error("Insert Fehler:", err); // Hilft beim Debuggen
        reject(err);
      } else {
        resolve(plant);
      }
    });
  });
};

exports.deleteById = (id) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM plants WHERE id = ?", [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
};

exports.updateWatering = (id, newDate) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE plants SET lastWatered = ? WHERE id = ?",
      [newDate, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};
