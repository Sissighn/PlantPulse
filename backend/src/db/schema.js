const { sql } = require("drizzle-orm");
const {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} = require("drizzle-orm/sqlite-core");

const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    passwordHash: text("password_hash"),
    displayName: text("display_name"),
    accountType: text("account_type").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    check(
      "users_account_type_check",
      sql`${table.accountType} in ('registered', 'guest')`
    ),
  ]
);

const plants = sqliteTable(
  "plants",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type"),
    baseInterval: integer("baseInterval"),
    lastWatered: text("lastWatered"),
    image: text("image"),
  },
  (table) => [index("idx_plants_user_id").on(table.userId)]
);

module.exports = {
  plants,
  users,
};
