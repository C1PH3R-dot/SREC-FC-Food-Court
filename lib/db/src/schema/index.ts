import { relations } from "drizzle-orm";
import { numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const walletTransactionType = pgEnum("wallet_transaction_type", ["TOPUP", "PAYMENT"]);

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name").notNull().default("SREC FC user"),
	walletBalance: numeric("wallet_balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
	id: text("id").primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	status: text("status").notNull().default("PENDING"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").notNull().references(() => users.id),
	amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
	type: walletTransactionType("type").notNull(),
	description: text("description").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	orders: many(orders),
	walletTransactions: many(walletTransactions),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
	user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
	user: one(users, { fields: [walletTransactions.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Order = typeof orders.$inferSelect;
// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

export {}