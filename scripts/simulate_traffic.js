// Simulation Tool: Places realistic simulated campus orders for demo purposes
// Clearly marked as a simulation tool, not for real users
const path = require('path');

let pgModule;
try {
  pgModule = require('pg');
} catch (e) {
  pgModule = require(path.join(__dirname, '..', 'api', 'node_modules', 'pg'));
}
const { Client } = pgModule;

async function simulateTraffic(slot = '12:50', count = 10) {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/thalitrack';

  const client = new Client({ connectionString });
  await client.connect();

  console.log(`[SIMULATION] Injecting ${count} realistic orders into slot ${slot}...`);

  try {
    const dishesRes = await client.query('SELECT id, name, price FROM dishes WHERE active = true;');
    const dishes = dishesRes.rows;
    const todayStr = new Date().toISOString().split('T')[0];

    const countRes = await client.query('SELECT COUNT(*) FROM orders;');
    let seq = parseInt(countRes.rows[0].count, 10) + 2000;

    for (let i = 0; i < count; i++) {
      const publicId = `TT-${seq++}`;
      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const qty = Math.random() > 0.7 ? 2 : 1;
      const total = Number(dish.price) * qty;

      const ordRes = await client.query(
        `
        INSERT INTO orders (public_order_id, customer_name, slot_start, slot_date, status, total)
        VALUES ($1, $2, $3, $4, 'placed', $5)
        RETURNING id;
      `,
        [publicId, `Simulated Student #${i + 1}`, slot, todayStr, total]
      );

      await client.query(
        `
        INSERT INTO order_items (order_id, dish_id, qty, unit_price)
        VALUES ($1, $2, $3, $4);
      `,
        [ordRes.rows[0].id, dish.id, qty, dish.price]
      );
    }
    console.log(`[SIMULATION] Successfully added ${count} orders to slot ${slot}.`);
  } finally {
    await client.end();
  }
}

const slotArg = process.argv[2] || '12:50';
const countArg = parseInt(process.argv[3] || '5', 10);
simulateTraffic(slotArg, countArg).catch(console.error);

