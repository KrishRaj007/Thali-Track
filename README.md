# ThaliTrack — Campus Canteen Pre-Order & Food Waste Prediction

ThaliTrack is a full-stack campus canteen pre-ordering and food-waste forecasting web application built for hackathon problem statement **PS-06 (Campus + Sustainability)**.

Between lectures, campus canteens endure intense 15-minute rushes. Students face long queues, leading to skipped meals and tardiness, while canteen management guesses prep quantities blindly, causing popular dishes to stock out while other food goes to waste.

ThaliTrack solves this by allowing students and faculty to pre-order meals for dedicated 10-minute pickup slots, while kitchen managers receive automated demand forecasts, track real-time queue loads, log closing leftovers, and calculate verified food waste savings.

---

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT DEVICES                                    |
|   Student Mobile View (Phone 1)             Canteen Kitchen Board (Phone 2/Tablet) |
|   - 30s 3-tap pre-order flow                - Slot-grouped incoming queue         |
|   - 10-min slot picker with rush badges     - One-click "Mark Ready" trigger      |
|   - Live token (TT-XXXX) via SSE            - Closing leftover kg log form        |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (HTTP / SSE Stream)
+-----------------------------------------------------------------------------------+
|                        API GATEWAY & BACKEND (Node.js / Express)                  |
|   - Atomic transaction stock decrement (prevents overselling)                     |
|   - Slot capacity gatekeeper (max 40 orders per 10-min window)                    |
|   - Realtime Server-Sent Events (SSE) dispatcher for live sync                    |
|   - Fallback 7-day same-weekday moving average forecaster (zero downtime)         |
|   - Food saved calculation engine                                                 |
+-----------------------------------------------------------------------------------+
                     │                                            │
                     ▼                                            ▼
+---------------------------------------+    +--------------------------------------+
|        POSTGRESQL DATABASE            |    |       FORECASTING MICROSERVICE       |
|  - users (bcrypt auth, student/mgr)   |    |         (Python / FastAPI)           |
|  - dishes (10 items, INR, weights)    |    |  - 4-point same-weekday moving avg   |
|  - orders & order_items               |    |  - Cyclical linear regression model  |
|  - daily_production (28-day history)  |    |  - Backtest validation (lower MAE)   |
|  - leftover_logs & surplus_offers     |    |  - Leftover feedback damping         |
|  - timetable (lecture end rush times) |    |  - Safety buffer calculation (+5%)   |
+---------------------------------------+    +--------------------------------------+
```

---

## 2. Measurable Goals & Key Metrics

- **Sub-30-Second Ordering**: 3-tap workflow from dish selection to confirmed pickup token.
- **Accurate Kitchen Forecast**: Automatic model selection (Linear Regression vs. Moving Average) reporting holdout MAE per dish.
- **Explainable Food Saved (kg)**: Computed from stored database production data, comparing historical baseline waste with recommendation-driven waste.
- **Zero Overselling**: Transactions decrement inventory atomically with strict checks against slot capacity.

---

## 3. Technology Stack

- **Frontend**: React 19 (Vite) + Tailwind CSS (mobile-first responsive, strict token palette, Inter font, 20 website baseline features).
- **Backend**: Node.js + Express + `pg` (node-postgres), Server-Sent Events (SSE).
- **Database**: PostgreSQL 16+ (Normalized schema, indexed slot and status queries).
- **Forecasting Microservice**: Python (FastAPI, pandas, scikit-learn).
- **Deployment**: DigitalOcean App Platform with Managed PostgreSQL.

---

## 4. Design System Tokens

Strict compliance with the design tokens:
- **Background**: `#1B2A4A`
- **Surface / Card**: `#24345A`
- **Primary / Accent**: `#E4A0A0`
- **Secondary Accent**: `#EED9A0`
- **Text (main)**: `#FFFFFF`
- **Text (muted)**: `#B8C2D9`
- **Danger**: `#EF4444`
- **Typography**: Inter across all headings and body copy.
- **Border Radius**: Consistent 8px everywhere.
- **Aesthetic**: Restrained food-and-campus palette, no purple gradients, no fake customer counters, no emoji icons (using Lucide).

---

## 5. Forecasting Method & Waste Reduction Logic

### Baseline vs. Machine Learning Selection
1. **4-Point Same-Weekday Moving Average**: Computes average historical sold portions across matching weekdays over the last 4 weeks.
2. **Linear Regression with Cyclical Features**: Incorporates time trend index along with sine/cosine transformed weekday features (`sin(2π*dow/7)`, `cos(2π*dow/7)`).
3. **Holdout Backtesting**: Holds out the last 7 days of historical observations to compute Mean Absolute Error (MAE) for both models. The system automatically selects the model with lower MAE for each dish.

### Leftover Feedback Formula
When the canteen manager logs closing leftovers, the next day's recommended batch automatically scales down to avoid compounding surplus:
$$\text{leftover\_units} = \frac{\text{leftover\_kg}}{\text{avg\_portion\_weight\_kg}}$$
$$\text{recommended\_qty} = \max\left(\text{forecast\_qty} - 5, \text{recommended\_qty} - \text{round}(0.5 \times \text{leftover\_units})\right)$$

### Food Saved (kg) Calculation
The food saved metric shown on the Manager Impact dashboard is never hardcoded. It compares the empirical baseline waste under the historical "guess" era against the actual leftovers recorded under ThaliTrack guidance:
$$\text{Food Saved (kg)} = \sum (\text{baseline\_guess\_leftover\_kg} - \text{actual\_leftover\_kg})$$

---

## 6. Monorepo Structure

```
/
├── .do/                  # DigitalOcean App Platform specification (app.yaml)
├── api/                  # Node.js Express backend and PostgreSQL queries
│   ├── db.js             # Connection pool & client provider
│   ├── schema.sql        # Relational schema definition
│   ├── server.js         # API endpoints & SSE broadcaster
│   ├── test/             # Unit and integration test suite
│   └── Dockerfile        # Container build for API
├── data/                 # Exported 28-day sample datasets (dishes, production, timetable, orders)
├── forecast/             # Python FastAPI demand prediction microservice
│   ├── main.py           # Regression & moving average models
│   ├── requirements.txt  # FastAPI, pandas, scikit-learn
│   └── Dockerfile        # Container build for forecast service
├── scripts/              # Automation and evaluation tools
│   ├── seed.js           # Deterministic database seeder (fixed seed 424242)
│   ├── import_csv.js     # Starter CSV importer for organizer data
│   └── simulate_traffic.js # Demo traffic generator for 64-order rush simulations
└── web/                  # React Vite mobile-first frontend
    ├── src/              # React components, design system, 20 baseline features
    ├── public/           # Favicon suite, site manifest
    ├── Dockerfile        # Multi-stage Nginx container build
    └── nginx.conf        # Production proxy & fallback configuration
```

---

## 7. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (v14+) running locally on port 5432

### Step 1: Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE thalitrack;"

# Apply schema
psql -U postgres -d thalitrack -f api/schema.sql
```

### Step 2: Seed Deterministic Sample Data
```bash
node scripts/seed.js
```
*Note: All seeded records are labeled as "sample data" generated with random seed `424242` for benchmarking.*

### Step 3: Run Backend & Forecasting Services
**Terminal 1 (Python Microservice):**
```bash
cd forecast
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 (Node.js API):**
```bash
cd api
npm install
# Copy the repository environment template so the API can read DATABASE_URL,
# JWT_SECRET, and FORECAST_SERVICE_URL from api/.env.
cp ../.env.example .env
node server.js
```

**Terminal 3 (React Frontend):**
```bash
cd web
npm install
# Optional: set VITE_API_PROXY_TARGET in web/.env when the API is not on port 4000.
npm run dev
```
Open `http://localhost:3000` on your desktop browser or phone.

---

## 8. Two-Minute Live Judging Demo Script

### Goal: Demonstrate two phones operating in real time with instantaneous kitchen updates and forecast adaptation.

1. **Phone 1 (Student View)**:
   - Navigate to `http://localhost:3000`.
   - Tap **Sign In** -> Click 1-tap demo button **Student (Aarav)**.
   - Select **1 Rajma Chawal** (₹80) -> Tap **Pick Pickup Slot**.
   - Notice the Timetable Rush Tip warning that 12:50 is loaded. Select the **12:50** rush slot anyway to test capacity.
   - Tap **Proceed to Pay** -> Authorize demo UPI payment.
   - Confirmation screen immediately displays token **TT-XXXX** with status **PLACED**.

2. **Phone 2 / Tablet (Kitchen Manager View)**:
   - Navigate to `http://localhost:3000`.
   - Tap **Sign In** -> Click 1-tap demo button **Manager (Chef)**.
   - Go to **Kitchen Board**: Observe the incoming order from Phone 1 visible under the 12:50 slot.
   - Click **Mark Ready**.

3. **Live Sync Verification**:
   - Return your eyes to Phone 1 (Student). Without any page reload or polling, the token status automatically flips to **READY** via Server-Sent Events, showing green pickup clearance at Counter 1.

4. **Closing Leftover & Tomorrow's Forecast**:
   - In the Manager View, click **Log Leftovers**.
   - Enter `4.5` kg for Rajma Chawal and click **Submit Closing Leftovers**.
   - Navigate to **Demand Forecast**: Review tomorrow's table. Point out that the recommended batch has automatically reduced by 3 units using the leftover feedback formula.
   - Navigate to **Food Saved**: Highlight the real-time food savings in kg (e.g. 689+ kg across 24 days), explaining the baseline comparison formula.

---

## 9. DigitalOcean App Platform Deployment

The repository includes a ready-to-deploy `.do/app.yaml` configuration.

### Deployment Steps:
1. Fork or push this repository to GitHub/GitLab.
2. In the DigitalOcean Cloud Console, select **Apps** -> **Create App** -> **Import from App Spec**.
3. Select `.do/app.yaml`.
4. DigitalOcean provisions:
   - Managed PostgreSQL database (`db-thalitrack`).
   - `web`: Nginx container serving React SPA.
   - `api`: Node.js container communicating with managed database.
   - `forecast`: Python container running FastAPI.
5. In your App settings, add your custom domain (e.g., `thalitrack.yourcampus.edu`).

### Action Items Requiring Your Administrative Action:
1. **Domain DNS Settings**: Point your DNS `CNAME` or `A` record to the DigitalOcean App Platform default endpoint.
2. **Managed Database Secrets**: On DigitalOcean, check that `DATABASE_URL` is mapped to `${db-thalitrack.DATABASE_URL}`.
3. **Legal Review**: Review the drafted plain-language Privacy Policy and Terms & Conditions pages before opening real student accounts.

---

## 10. Known Limitations

- **Simulated Payments**: Financial transactions use a mock UPI interface designed for hackathon evaluation; production deployment requires integration with a gateway such as Razorpay or Cashfree.
- **Single Dining Hall Configuration**: Current slot capacities (40 orders / 10 mins) assume a single central campus canteen hall; multi-counter multi-building routing is planned for future releases.
- **Network Push Fallback**: Web Push notifications require active browser ServiceWorker permissions; when not granted, real-time in-app notification toasts are delivered via SSE.
