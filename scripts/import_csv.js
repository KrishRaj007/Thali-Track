// CSV Import Tool for ThaliTrack
// Supports importing dishes, daily_production, or timetable from custom CSV files
const fs = require('fs');
const path = require('path');

let pgModule;
try {
  pgModule = require('pg');
} catch (e) {
  pgModule = require(path.join(__dirname, '..', 'api', 'node_modules', 'pg'));
}
const { Client } = pgModule;

async function importCsv(type, filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/thalitrack';

  const client = new Client({ connectionString });
  await client.connect();

  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split('\n').filter(Boolean);
  if (lines.length < 2) {
    console.log('No data rows found.');
    await client.end();
    return;
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  console.log(`Importing ${type} from ${filePath} (${lines.length - 1} rows)...`);

  try {
    if (type === 'dishes') {
      // Expected headers: name, price, veg, avg_portion_weight_kg, daily_capacity
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        const [id, name, price, veg, weight, cap] = parts.length === 6 ? parts : [null, ...parts];
        await client.query(
          `
          INSERT INTO dishes (name, price, veg, avg_portion_weight_kg, daily_capacity, remaining_quantity)
          VALUES ($1, $2, $3, $4, $5, $5)
          ON CONFLICT DO NOTHING;
        `,
          [name, parseFloat(price), veg === 'true', parseFloat(weight), parseInt(cap, 10)]
        );
      }
    } else if (type === 'daily_production') {
      // Expected headers: date, dish_id, prepared_qty, sold_qty, leftover_qty, leftover_kg, baseline_guess_prepared_qty, baseline_guess_leftover_kg
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        const date = parts[0];
        const dishId = parseInt(parts[1], 10);
        // ignore dish_name if present in pos 2
        const shift = parts.length === 9 ? 1 : 0;
        const prepared = parseInt(parts[2 + shift], 10);
        const sold = parseInt(parts[3 + shift], 10);
        const leftoverQty = parseInt(parts[4 + shift], 10);
        const leftoverKg = parseFloat(parts[5 + shift]);
        const baselinePrep = parseInt(parts[6 + shift] || '0', 10);
        const baselineLeftoverKg = parseFloat(parts[7 + shift] || '0');

        await client.query(
          `
          INSERT INTO daily_production 
          (date, dish_id, prepared_qty, sold_qty, leftover_qty, leftover_kg, baseline_guess_prepared_qty, baseline_guess_leftover_kg)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (date, dish_id) DO UPDATE SET
            prepared_qty = EXCLUDED.prepared_qty,
            sold_qty = EXCLUDED.sold_qty,
            leftover_qty = EXCLUDED.leftover_qty,
            leftover_kg = EXCLUDED.leftover_kg,
            baseline_guess_prepared_qty = EXCLUDED.baseline_guess_prepared_qty,
            baseline_guess_leftover_kg = EXCLUDED.baseline_guess_leftover_kg;
        `,
          [date, dishId, prepared, sold, leftoverQty, leftoverKg, baselinePrep, baselineLeftoverKg]
        );
      }
    }
    console.log(`Successfully imported ${lines.length - 1} records into ${type}.`);
  } finally {
    await client.end();
  }
}

const args = process.argv.slice(2);
const type = args[0] || 'dishes';
const file = args[1] || path.join(__dirname, '..', 'data', `${type}.csv`);
importCsv(type, file).catch(console.error);

