CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'SREC FC user',
  wallet_balance numeric(12, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE wallet_transaction_type AS ENUM ('TOPUP', 'PAYMENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  amount numeric(12, 2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  amount numeric(12, 2) NOT NULL,
  type wallet_transaction_type NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);