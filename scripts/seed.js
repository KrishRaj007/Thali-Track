// Deterministic Seed Script for ThaliTrack
// Fixed random seed for 100% reproducible data
const path = require('path');
const fs = require('fs');

let pgModule, bcryptModule;
try {
  pgModule = require('pg');
  bcryptModule = require('bcryptjs');
} catch (e) {
  pgModule = require(path.join(__dirname, '..', 'api', 'node_modules', 'pg'));
  bcryptModule = require(path.join(__dirname, '..', 'api', 'node_modules', 'bcryptjs'));
}
const { Client } = pgModule;
const bcrypt = bcryptModule;

// Simple deterministic pseudo-random number generator (Mulberry32)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(424242);

function randRange(min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function randFloat(min, max) {
  return min + rng() * (max - min);
}

const DISHES = [
  { name: 'Rajma Chawal', price: 80.0, veg: true, weight: 0.38, cap: 120 },
  { name: 'Chole Bhature', price: 90.0, veg: true, weight: 0.4, cap: 110 },
  { name: 'Veg Biryani', price: 110.0, veg: true, weight: 0.35, cap: 90 },
  { name: 'Paneer Roll', price: 70.0, veg: true, weight: 0.22, cap: 80 },
  { name: 'Masala Dosa', price: 65.0, veg: true, weight: 0.28, cap: 100 },
  { name: 'Samosa (2 pc)', price: 30.0, veg: true, weight: 0.16, cap: 150 },
  { name: 'Poha', price: 35.0, veg: true, weight: 0.2, cap: 100 },
  { name: 'Aloo Paratha', price: 50.0, veg: true, weight: 0.25, cap: 90 },
  { name: 'Veg Thali', price: 120.0, veg: true, weight: 0.5, cap: 80 },
  { name: 'Chai', price: 15.0, veg: true, weight: 0.15, cap: 200 }
];

const TIMETABLE_ENTRIES = [
  // Mon-Fri
  ...[1, 2, 3, 4, 5].flatMap((day) => [
    { day, time: '10:50', students: 180 },
    { day, time: '12:50', students: 320 },
    { day, time: '13:50', students: 260 },
    { day, time: '15:20', students: 140 }
  ]),
  // Saturday
  { day: 6, time: '11:30', students: 110 },
  { day: 6, time: '13:00', students: 130 }
];

async function runSeed() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/thalitrack';

  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL for seeding...');

  try {
    // Clean existing data for deterministic fresh state
    await client.query(`
      TRUNCATE TABLE notifications, surplus_offers, leftover_logs, daily_production, order_items, orders, timetable, dishes, users RESTART IDENTITY CASCADE;
    `);

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const studentHash = await bcrypt.hash('student123', salt);
    const facultyHash = await bcrypt.hash('faculty123', salt);
    const managerHash = await bcrypt.hash('manager123', salt);

    const usersRes = await client.query(
      `
      INSERT INTO users (name, role, email, password_hash) VALUES
      ('Aarav Sharma', 'student', 'student@thalitrack.edu', $1),
      ('Dr. Priya Iyer', 'faculty', 'faculty@thalitrack.edu', $2),
      ('Chef Ramesh Gupta', 'manager', 'manager@thalitrack.edu', $3)
      RETURNING id, name, role, email;
    `,
      [studentHash, facultyHash, managerHash]
    );
    console.log('Seeded users:', usersRes.rows.map((u) => `${u.name} (${u.role})`));
    const managerId = usersRes.rows.find((u) => u.role === 'manager').id;
    const studentId = usersRes.rows.find((u) => u.role === 'student').id;

    // 2. Seed Dishes
    const dishesRes = [];
    for (const d of DISHES) {
      const res = await client.query(
        `
        INSERT INTO dishes (name, price, veg, avg_portion_weight_kg, daily_capacity, remaining_quantity, active)
        VALUES ($1, $2, $3, $4, $5, $5, true)
        RETURNING id, name, price, avg_portion_weight_kg, daily_capacity;
      `,
        [d.name, d.price, d.veg, d.weight, d.cap]
      );
      dishesRes.push(res.rows[0]);
    }
    console.log(`Seeded ${dishesRes.length} dishes.`);

    // 3. Seed Timetable
    for (const t of TIMETABLE_ENTRIES) {
      await client.query(
        `
        INSERT INTO timetable (day_of_week, lecture_end_time, student_count_estimate)
        VALUES ($1, $2, $3);
      `,
        [t.day, t.time, t.students]
      );
    }
    console.log(`Seeded ${TIMETABLE_ENTRIES.length} lecture timetable entries.`);

    // 4. Generate 28 days of daily_production and orders (2026-10-02 to 2026-10-29)
    // Reference today is 2026-10-30
    const today = new Date('2026-10-30T00:00:00+05:30');
    const productionRows = [];
    const leftoverLogRows = [];
    const orderExportRows = [];

    // Weekday multipliers (0: Sun=0, 1: Mon=0.9, 2: Tue=0.95, 3: Wed=1.05, 4: Thu=1.0, 5: Fri=1.1, 6: Sat=0.6)
    const dayMultipliers = [0, 0.9, 0.95, 1.05, 1.0, 1.1, 0.6];

    for (let dayOffset = 28; dayOffset >= 1; dayOffset--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];
      const dayOfWeek = targetDate.getDay();

      if (dayOfWeek === 0) {
        // Sunday - canteen closed
        continue;
      }

      const dayFactor = dayMultipliers[dayOfWeek];
      const isEarlyEra = dayOffset > 14; // First 2 weeks = old guess baseline; last 2 weeks = ThaliTrack recommendations

      for (const dish of dishesRes) {
        // Dish-specific weekday popularity
        let dishFactor = 1.0;
        if (dish.name === 'Chole Bhature' && (dayOfWeek === 3 || dayOfWeek === 5)) {
          dishFactor = 1.25; // Chole Bhature peak on Wed/Fri
        } else if (dish.name === 'Veg Biryani' && dayOfWeek === 5) {
          dishFactor = 1.3; // Biryani peak on Friday
        } else if (dish.name === 'Poha' && (dayOfWeek === 1 || dayOfWeek === 2)) {
          dishFactor = 1.2; // Breakfast Poha on Mon/Tue
        }

        // Base realistic demand
        const baseDemand = Math.round(dish.daily_capacity * 0.7 * dayFactor * dishFactor);
        const noise = randRange(-4, 5);
        const soldQty = Math.max(10, Math.min(dish.daily_capacity, baseDemand + noise));

        let preparedQty;
        let baselineGuessPrepared;
        let baselineGuessLeftover;

        // Old guess baseline was +25% to +45% overproduction
        baselineGuessPrepared = Math.round(soldQty * randFloat(1.25, 1.45));
        baselineGuessLeftover = (baselineGuessPrepared - soldQty) * dish.avg_portion_weight_kg;

        if (isEarlyEra) {
          // Early era was guessing
          preparedQty = baselineGuessPrepared;
        } else {
          // Late era uses ThaliTrack forecast + 5% buffer! Leftovers dramatically lower
          preparedQty = Math.round(soldQty * 1.05) + randRange(0, 2);
        }

        const leftoverQty = Math.max(0, preparedQty - soldQty);
        const leftoverKg = Number((leftoverQty * dish.avg_portion_weight_kg).toFixed(3));
        const baselineLeftoverKg = Number(Math.max(0, baselineGuessLeftover).toFixed(3));

        productionRows.push({
          date: dateStr,
          dish_id: dish.id,
          dish_name: dish.name,
          prepared_qty: preparedQty,
          sold_qty: soldQty,
          leftover_qty: leftoverQty,
          leftover_kg: leftoverKg,
          baseline_guess_prepared_qty: baselineGuessPrepared,
          baseline_guess_leftover_kg: baselineLeftoverKg
        });

        await client.query(
          `
          INSERT INTO daily_production 
          (date, dish_id, prepared_qty, sold_qty, leftover_qty, leftover_kg, baseline_guess_prepared_qty, baseline_guess_leftover_kg)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,
          [
            dateStr,
            dish.id,
            preparedQty,
            soldQty,
            leftoverQty,
            leftoverKg,
            baselineGuessPrepared,
            baselineLeftoverKg
          ]
        );

        // Closing leftover logs
        if (leftoverKg > 0) {
          leftoverLogRows.push({
            date: dateStr,
            dish_id: dish.id,
            leftover_kg: leftoverKg,
            logged_by: managerId
          });
          await client.query(
            `
            INSERT INTO leftover_logs (date, dish_id, leftover_kg, logged_by, logged_at)
            VALUES ($1, $2, $3, $4, $5::timestamp);
          `,
            [dateStr, dish.id, leftoverKg, managerId, `${dateStr} 17:30:00+05:30`]
          );
        }
      }
    }
    console.log(`Seeded 28 days of daily_production and leftover_logs.`);

    // 5. Seed some representative orders for recent days + today (2026-10-30) for demo queue
    const demoSlots = ['10:50', '11:40', '12:00', '12:50', '13:00', '13:50', '14:20'];
    let orderSeq = 1001;

    for (let dayOffset = 3; dayOffset >= 0; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - dayOffset);
      const dateStr = orderDate.toISOString().split('T')[0];

      // For today, populate the 12:50 slot heavily (64 orders) for the demo requirement:
      // "Canteen dashboard shows 64 orders in the 12:50 slot (seed or simulate demo traffic)"
      const slotsToGenerate = dayOffset === 0 ? [{ slot: '12:50', count: 64 }, { slot: '10:50', count: 18 }, { slot: '13:50', count: 24 }] : demoSlots.map(s => ({ slot: s, count: randRange(8, 20) }));

      for (const { slot, count } of slotsToGenerate) {
        for (let i = 0; i < count; i++) {
          const publicId = `TT-${orderSeq++}`;
          const isCurrentToday = dayOffset === 0;
          let status = 'placed';
          if (!isCurrentToday) {
            status = 'picked_up';
          } else {
            // For today: majority placed or preparing, a couple ready
            if (i < 5) status = 'ready';
            else if (i < 15) status = 'preparing';
            else status = 'placed';
          }

          const dish = dishesRes[randRange(0, dishesRes.length - 1)];
          const qty = randRange(1, 2);
          const total = Number(dish.price) * qty;

          const ordRes = await client.query(
            `
            INSERT INTO orders (public_order_id, user_id, customer_name, slot_start, slot_date, status, total, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
          `,
            [
              publicId,
              studentId,
              i % 2 === 0 ? 'Aarav Sharma' : `Campus Guest #${(i % 50) + 1}`,
              slot,
              dateStr,
              status,
              total,
              `${dateStr} ${slot}:00+05:30`
            ]
          );

          await client.query(
            `
            INSERT INTO order_items (order_id, dish_id, qty, unit_price)
            VALUES ($1, $2, $3, $4);
          `,
            [ordRes.rows[0].id, dish.id, qty, dish.price]
          );

          orderExportRows.push({
            order_id: publicId,
            date: dateStr,
            slot,
            dish_name: dish.name,
            qty,
            unit_price: dish.price,
            status,
            total
          });
        }
      }
    }
    console.log(`Seeded demo orders (including 64 orders in 12:50 slot for today).`);

    // 6. Seed a sample surplus offer for after 3 PM demo
    await client.query(`
      INSERT INTO surplus_offers (date, dish_id, qty, original_price, discount_price, active)
      VALUES 
      (CURRENT_DATE, 1, 8, 80.00, 45.00, true),
      (CURRENT_DATE, 6, 12, 30.00, 18.00, true);
    `);

    // 7. Seed sample notification
    await client.query(`
      INSERT INTO notifications (user_id, message, type)
      VALUES 
      (NULL, 'Post-3 PM Surplus Alert: 40% OFF on Rajma Chawal and Samosa plates at Counter 2!', 'surplus'),
      (NULL, 'Timetable Tip: 12:50 slot is heavily loaded (64 orders). Choose 13:00 to save ~8 mins queue time.', 'rush');
    `);

    // 8. Export CSVs to /data directory
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // dishes.csv
    const dishesCsvHeader = 'id,name,price,veg,avg_portion_weight_kg,daily_capacity\n';
    const dishesCsvContent = dishesRes
      .map(
        (d) =>
          `${d.id},"${d.name}",${d.price},true,${d.avg_portion_weight_kg},${d.daily_capacity}`
      )
      .join('\n');
    fs.writeFileSync(path.join(dataDir, 'dishes.csv'), dishesCsvHeader + dishesCsvContent);

    // daily_production.csv
    const prodCsvHeader =
      'date,dish_id,dish_name,prepared_qty,sold_qty,leftover_qty,leftover_kg,baseline_guess_prepared_qty,baseline_guess_leftover_kg\n';
    const prodCsvContent = productionRows
      .map(
        (r) =>
          `${r.date},${r.dish_id},"${r.dish_name}",${r.prepared_qty},${r.sold_qty},${r.leftover_qty},${r.leftover_kg},${r.baseline_guess_prepared_qty},${r.baseline_guess_leftover_kg}`
      )
      .join('\n');
    fs.writeFileSync(
      path.join(dataDir, 'daily_production.csv'),
      prodCsvHeader + prodCsvContent
    );

    // timetable.csv
    const timeCsvHeader = 'day_of_week,lecture_end_time,student_count_estimate\n';
    const timeCsvContent = TIMETABLE_ENTRIES.map(
      (t) => `${t.day},${t.time},${t.students}`
    ).join('\n');
    fs.writeFileSync(path.join(dataDir, 'timetable.csv'), timeCsvHeader + timeCsvContent);

    // orders_sample.csv
    const ordersCsvHeader =
      'order_id,date,slot,dish_name,qty,unit_price,status,total\n';
    const ordersCsvContent = orderExportRows
      .map(
        (o) =>
          `${o.order_id},${o.date},${o.slot},"${o.dish_name}",${o.qty},${o.unit_price},${o.status},${o.total}`
      )
      .join('\n');
    fs.writeFileSync(
      path.join(dataDir, 'orders_sample.csv'),
      ordersCsvHeader + ordersCsvContent
    );

    console.log('Deterministic sample CSVs exported to /data successfully.');
    console.log('Seeding completed successfully with seed 424242.');
  } finally {
    await client.end();
  }
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
