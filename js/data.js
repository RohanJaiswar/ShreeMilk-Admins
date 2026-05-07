/* DATA STATE — TO BE REPLACED DYNAMICALLY BY SUPABASE */

const DATA = {

  /* ── KPI ── */
  kpi: [
    { id: 'revenue',    label: 'Total Revenue',        value: 'Loading...', trend: '',  trendDir: 'neutral',   sub: 'fetching database...',           color: 'green', icon: '<ion-icon name="cash-outline"></ion-icon>' },
    { id: 'dues',       label: 'Total Pending Dues',   value: 'Loading...', trend: '',  trendDir: 'neutral',   sub: 'fetching database...',    color: 'red',   icon: '<ion-icon name="warning-outline"></ion-icon>' },
    { id: 'orders',     label: 'Orders Today',         value: 'Loading...', trend: '',  trendDir: 'neutral',   sub: 'fetching database...',           color: 'blue',  icon: '<ion-icon name="cube-outline"></ion-icon>' },
    { id: 'containers', label: 'Containers Out',       value: 'Loading...', trend: '',  trendDir: 'neutral',   sub: 'fetching database...',    color: 'orange',icon: '<ion-icon name="water-outline"></ion-icon>' },
  ],

  /* ── CHARTS ── */
  months: [],
  revenue: [],
  collection: [],
  orders: [],
  donut: [],

  /* ── VENDORS ── */
  vendors: [],

  /* ── PRODUCTS ── */
  products: {
    month: [],
    week: [],
    today: [],
  },

  /* ── DELIVERY ── */
  delivery: {
    total: 0, delivered: 0,
    agents: [],
    missed: [],
  },

};

/* Claude AI prompt data */
const AI_CONTEXT = `Current data: Monthly revenue April=₹14.5k, orders=312, top products: Dahi Tub 184 units, Dahi Can 124 units, Tak Plain 98 units (low stock), Paneer 43 units (critical stock). Overdue vendors: Patel Provision ₹2,210 (20 days), Mehta Grocery ₹3,150 (28 days). Containers overdue: 2 containers >7 days out. Season: summer (April). Previous months revenue trend: 8.2k→9.4k→7.8k→11k→13k→14.5k`;

const AI_SYSTEM = `You are an AI business analyst for Shreeji Milk Center, a dairy delivery business in Maharashtra. Analyze the provided business data and return ONLY valid JSON with these exact keys:
{
  "demand_forecast": [{ "product": "string", "next_week_units": 0, "trend": "up|down|stable", "confidence": 0 }],
  "revenue_prediction": { "next_month": 0, "growth_percent": 0, "reasoning": "string" },
  "collection_risk": [{ "vendor": "string", "risk": "high|medium|low", "reason": "string" }],
  "stock_alert": [{ "product": "string", "days_remaining": 0, "action": "string" }],
  "business_insight": "string"
}`;
