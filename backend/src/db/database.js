const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, "plants.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Fehler:", err.message);
  else console.log("📦 Verbunden mit SQLite.");
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE COLLATE NOCASE,
    password_hash TEXT,
    display_name TEXT,
    account_type TEXT NOT NULL CHECK (account_type IN ('registered', 'guest')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS plants (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    type TEXT,
    baseInterval INTEGER,
    lastWatered TEXT,
    image TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.all("PRAGMA table_info(plants)", [], (err, columns) => {
    if (err) {
      console.error("Schema Fehler:", err.message);
      return;
    }

    const hasUserId = columns.some((column) => column.name === "user_id");
    const createPlantIndex = () => {
      db.run("CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id)");
    };

    if (hasUserId) {
      createPlantIndex();
      return;
    }

    db.run("ALTER TABLE plants ADD COLUMN user_id TEXT", createPlantIndex);
  });
});

function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    accountType: row.account_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

exports.findAll = (userId) => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM plants WHERE user_id = ?", [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

exports.findById = (id, userId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM plants WHERE id = ? AND user_id = ?",
      [id, userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

exports.findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      else resolve(mapUser(row));
    });
  });
};

exports.findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      else resolve(mapUser(row));
    });
  });
};

exports.create = (plant) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO plants (id, user_id, name, type, baseInterval, lastWatered, image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      plant.id,
      plant.userId,
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

exports.createRegisteredUser = (user) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO users (
        id, email, password_hash, display_name, account_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'registered', ?, ?)`,
      [user.id, user.email, user.passwordHash, user.displayName, now, now],
      function (err) {
        if (err) reject(err);
        else resolve(exports.findUserById(user.id));
      }
    );
  });
};

exports.createGuestUser = (id) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO users (
        id, email, password_hash, display_name, account_type, created_at, updated_at
      ) VALUES (?, NULL, NULL, NULL, 'guest', ?, ?)`,
      [id, now, now],
      function (err) {
        if (err) reject(err);
        else resolve(exports.findUserById(id));
      }
    );
  });
};

exports.upgradeGuestUser = (userId, details) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users
       SET email = ?, password_hash = ?, display_name = ?, account_type = 'registered', updated_at = ?
       WHERE id = ? AND account_type = 'guest'`,
      [
        details.email,
        details.passwordHash,
        details.displayName,
        new Date().toISOString(),
        userId,
      ],
      function (err) {
        if (err) reject(err);
        else if (this.changes === 0) resolve(null);
        else resolve(exports.findUserById(userId));
      }
    );
  });
};

exports.deleteById = (id, userId) => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM plants WHERE id = ? AND user_id = ?",
      [id, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};

exports.updateWatering = (id, newDate, userId) => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE plants SET lastWatered = ? WHERE id = ? AND user_id = ?",
      [newDate, id, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};

exports.raw = db;
