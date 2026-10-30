-- ThaliTrack Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'manager')),
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dishes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(8, 2) NOT NULL,
  veg BOOLEAN NOT NULL DEFAULT true,
  avg_portion_weight_kg NUMERIC(6, 3) NOT NULL,
  daily_capacity INTEGER NOT NULL DEFAULT 100,
  remaining_quantity INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  public_order_id VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  slot_start VARCHAR(10) NOT NULL,
  slot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'preparing', 'ready', 'picked_up', 'cancelled')),
  total NUMERIC(8, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  dish_id INTEGER REFERENCES dishes(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(8, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_production (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
  prepared_qty INTEGER NOT NULL DEFAULT 0,
  sold_qty INTEGER NOT NULL DEFAULT 0,
  leftover_qty INTEGER NOT NULL DEFAULT 0,
  leftover_kg NUMERIC(8, 3) NOT NULL DEFAULT 0,
  baseline_guess_prepared_qty INTEGER NOT NULL DEFAULT 0,
  baseline_guess_leftover_kg NUMERIC(8, 3) NOT NULL DEFAULT 0,
  UNIQUE(date, dish_id)
);

CREATE TABLE IF NOT EXISTS leftover_logs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
  leftover_kg NUMERIC(8, 3) NOT NULL,
  logged_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL,
  lecture_end_time VARCHAR(10) NOT NULL,
  student_count_estimate INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS surplus_offers (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL,
  original_price NUMERIC(8, 2) NOT NULL,
  discount_price NUMERIC(8, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_slot ON orders(slot_date, slot_start);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_daily_prod_date ON daily_production(date);

