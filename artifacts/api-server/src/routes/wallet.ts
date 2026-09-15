import { Router, type IRouter, type Request } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { orders, users, walletTransactions } from "@workspace/db/schema";

const router: IRouter = Router();

function getUserEmail(req: Request) {
  const email = req.header("x-user-email")?.trim().toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

async function getOrCreateUser(email: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(users).values({ email }).onConflictDoNothing({ target: users.email });
  const created = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return created[0] ?? null;
}

function parseAmount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

router.get("/wallet/balance", async (req, res) => {
  const email = getUserEmail(req);
  if (!email) return res.status(401).json({ message: "A signed-in user is required." });
  const user = await getOrCreateUser(email);
  if (!user) return res.status(500).json({ message: "Unable to load wallet." });
  const transactions = await db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.id)).orderBy(desc(walletTransactions.createdAt)).limit(20);
  return res.json({
    balance: Number(user.walletBalance),
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt,
    })),
  });
});

router.post("/wallet/topup", async (req, res) => {
  const email = getUserEmail(req);
  const amount = parseAmount(req.body?.amount);
  if (!email) return res.status(401).json({ message: "A signed-in user is required." });
  if (amount === null) return res.status(400).json({ message: "Top-up amount must be greater than zero." });
  const user = await getOrCreateUser(email);
  if (!user) return res.status(500).json({ message: "Unable to load wallet." });
  const result = await db.transaction(async (tx) => {
    const [updatedUser] = await tx.update(users).set({ walletBalance: sql`${users.walletBalance} + ${amount.toFixed(2)}` }).where(eq(users.id, user.id)).returning({ balance: users.walletBalance });
    await tx.insert(walletTransactions).values({ userId: user.id, amount: amount.toFixed(2), type: "TOPUP", description: "SREC Wallet top-up" });
    return updatedUser;
  });
  return res.json({ balance: Number(result.balance) });
});

router.post("/wallet/pay", async (req, res) => {
  const email = getUserEmail(req);
  const amount = parseAmount(req.body?.amount);
  const orderId = typeof req.body?.orderId === "string" ? req.body.orderId.trim() : "";
  if (!email) return res.status(401).json({ message: "A signed-in user is required." });
  if (!orderId || amount === null) return res.status(400).json({ message: "orderId and a valid amount are required." });
  const user = await getOrCreateUser(email);
  if (!user) return res.status(500).json({ message: "Unable to load wallet." });
  try {
    const result = await db.transaction(async (tx) => {
      const [lockedUser] = await tx.select().from(users).where(eq(users.id, user.id)).for("update");
      if (!lockedUser || Number(lockedUser.walletBalance) < amount) {
        const error = new Error("Insufficient wallet balance.");
        error.name = "InsufficientWalletBalance";
        throw error;
      }
      const [updatedUser] = await tx.update(users).set({ walletBalance: sql`${users.walletBalance} - ${amount.toFixed(2)}` }).where(eq(users.id, user.id)).returning({ balance: users.walletBalance });
      await tx.insert(walletTransactions).values({ userId: user.id, amount: amount.toFixed(2), type: "PAYMENT", description: `Wallet payment for order ${orderId}` });
      const updatedOrder = await tx.update(orders).set({ status: "PAID" }).where(eq(orders.id, orderId)).returning({ id: orders.id });
      if (!updatedOrder[0]) await tx.insert(orders).values({ id: orderId, userId: user.id, amount: amount.toFixed(2), status: "PAID" });
      return updatedUser;
    });
    return res.json({ balance: Number(result.balance), orderId, status: "PAID" });
  } catch (error) {
    if (error instanceof Error && error.name === "InsufficientWalletBalance") return res.status(402).json({ message: error.message });
    throw error;
  }
});

export default router;