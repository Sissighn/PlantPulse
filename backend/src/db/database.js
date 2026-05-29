const BetterSqlite3 = require("better-sqlite3");
const { and, eq } = require("drizzle-orm");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
const path = require("path");
const schema = require("./schema");

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, "plants.db");

const sqlite = new BetterSqlite3(dbPath);
sqlite.pragma("foreign_keys = ON");

const orm = drizzle(sqlite, { schema });
migrate(orm, {
  migrationsFolder: path.resolve(__dirname, "..", "..", "drizzle"),
});

function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    displayName: user.displayName,
    accountType: user.accountType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

exports.findAll = async (userId) => {
  return orm
    .select()
    .from(schema.plants)
    .where(eq(schema.plants.userId, userId))
    .all();
};

exports.findById = async (id, userId) => {
  return (
    orm
      .select()
      .from(schema.plants)
      .where(and(eq(schema.plants.id, id), eq(schema.plants.userId, userId)))
      .get() || null
  );
};

exports.findUserByEmail = async (email) => {
  const user = orm
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .get();

  return toPublicUser(user);
};

exports.findUserById = async (id) => {
  const user = orm
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .get();

  return toPublicUser(user);
};

exports.create = async (plant) => {
  await orm
    .insert(schema.plants)
    .values({
      id: plant.id,
      userId: plant.userId,
      name: plant.name,
      type: plant.type,
      baseInterval: plant.baseInterval,
      lastWatered: plant.lastWatered,
      image: plant.image,
    })
    .run();

  return plant;
};

exports.createRegisteredUser = async (user) => {
  const now = new Date().toISOString();

  await orm
    .insert(schema.users)
    .values({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      accountType: "registered",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return exports.findUserById(user.id);
};

exports.createGuestUser = async (id) => {
  const now = new Date().toISOString();

  await orm
    .insert(schema.users)
    .values({
      id,
      email: null,
      passwordHash: null,
      displayName: null,
      accountType: "guest",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return exports.findUserById(id);
};

exports.upgradeGuestUser = async (userId, details) => {
  const result = await orm
    .update(schema.users)
    .set({
      email: details.email,
      passwordHash: details.passwordHash,
      displayName: details.displayName,
      accountType: "registered",
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(schema.users.id, userId),
        eq(schema.users.accountType, "guest")
      )
    )
    .run();

  if (result.changes === 0) return null;
  return exports.findUserById(userId);
};

exports.deleteById = async (id, userId) => {
  const result = await orm
    .delete(schema.plants)
    .where(and(eq(schema.plants.id, id), eq(schema.plants.userId, userId)))
    .run();

  return result.changes > 0;
};

exports.updateWatering = async (id, newDate, userId) => {
  const result = await orm
    .update(schema.plants)
    .set({ lastWatered: newDate })
    .where(and(eq(schema.plants.id, id), eq(schema.plants.userId, userId)))
    .run();

  return result.changes > 0;
};

exports.raw = sqlite;
exports.orm = orm;
