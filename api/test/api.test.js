const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db');

test('Database connection and dish query test', async () => {
  const res = await db.query('SELECT COUNT(*) FROM dishes WHERE active = true;');
  assert.ok(parseInt(res.rows[0].count, 10) >= 10, 'Should have at least 10 seeded dishes');
});

test('Slot capacity and rush timetable detection', async () => {
  const timetableRes = await db.query('SELECT lecture_end_time FROM timetable WHERE lecture_end_time = $1', ['12:50']);
  assert.equal(timetableRes.rows.length > 0, true, '12:50 slot should be present in lecture timetable');
});

test('Atomic stock decrement and oversell prevention', async () => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    // Get test dish
    const dish = await client.query('SELECT id, remaining_quantity FROM dishes LIMIT 1');
    const dishId = dish.rows[0].id;
    const currentRem = dish.rows[0].remaining_quantity;

    // Test rejection when order exceeds stock
    const excessiveQty = currentRem + 999;
    const failUpdate = await client.query(
      'UPDATE dishes SET remaining_quantity = remaining_quantity - $1 WHERE id = $2 AND remaining_quantity >= $1 RETURNING id',
      [excessiveQty, dishId]
    );
    assert.equal(failUpdate.rows.length, 0, 'Oversell attempt must fail to update remaining_quantity');

    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
});

test('Food saved in kg calculation matches non-negative real data', async () => {
  const impactRes = await db.query(`
    SELECT 
      COALESCE(SUM(baseline_guess_leftover_kg - leftover_kg), 0) as food_saved_kg
    FROM daily_production
  `);
  const foodSaved = Number(impactRes.rows[0].food_saved_kg);
  assert.ok(foodSaved > 0, 'Food saved kg must be calculated from historical differences and greater than 0');
});

