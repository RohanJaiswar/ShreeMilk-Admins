/* DUMMY DATA — TODO: replace with real API */

const DATA = {

  /* ── KPI ── */
  kpi: [
    { id: 'revenue',    label: 'Total Revenue',        value: '₹14,500', trend: '+12%',  trendDir: 'up',   sub: 'vs last month',           color: 'green', icon: '<ion-icon name="cash-outline"></ion-icon>' },
    { id: 'dues',       label: 'Total Pending Dues',   value: '₹2,300',  trend: '+3',    trendDir: 'up',   sub: 'customers this week',    color: 'red',   icon: '<ion-icon name="warning-outline"></ion-icon>' },
    { id: 'orders',     label: 'Orders Today',         value: '42',      trend: '-8%',   trendDir: 'down', sub: 'vs last week',           color: 'blue',  icon: '<ion-icon name="cube-outline"></ion-icon>' },
    { id: 'containers', label: 'Containers Out',       value: '12',      trend: '2',     trendDir: 'neutral', sub: 'overdue > 7 days',    color: 'orange',icon: '<ion-icon name="water-outline"></ion-icon>' },
  ],

  /* ── CHARTS ── */
  months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
  revenue:    [8200,  9400,  7800,  11000, 13000, 14500],
  collection: [7000,  8800,  7200,  9500,  11000, 12200],
  orders:     [184,   210,   178,   245,   289,   312],

  donut: [
    { label: 'Shree Dahi Tub',         pct: 34, color: '#1677ff' },
    { label: 'Shree Dahi Can',         pct: 28, color: '#52c41a' },
    { label: 'Tak Plain',              pct: 18, color: '#fa8c16' },
    { label: 'Tak Masala',            pct: 12, color: '#722ed1' },
    { label: 'Analog Cheez Paneer',   pct:  8, color: '#ff4d4f' },
  ],

  /* ── VENDORS ── */
  vendors: [
    { id:1, name:'Ramesh Dairy',       zone:'Zone A', orders:14, due:840,  lastPay:'18 Apr 2026', status:'Paid'    },
    { id:2, name:'Patel Provision',    zone:'Zone B', orders:9,  due:2210, lastPay:'10 Apr 2026', status:'Overdue' },
    { id:3, name:'Sharma Cold Store',  zone:'Zone A', orders:20, due:420,  lastPay:'24 Apr 2026', status:'Partial' },
    { id:4, name:'Mehta Grocery',      zone:'Zone C', orders:6,  due:3150, lastPay:'02 Apr 2026', status:'Overdue' },
    { id:5, name:'Gupta Dairy Corner', zone:'Zone B', orders:15, due:1280, lastPay:'15 Apr 2026', status:'Partial' },
    { id:6, name:'Singh Provision',    zone:'Zone C', orders:8,  due:0,     lastPay:'26 Apr 2026', status:'Paid'    },
    { id:7, name:'Yadav Milk Centre',  zone:'Zone A', orders:11, due:1760, lastPay:'08 Apr 2026', status:'Overdue' },
    { id:8, name:'Joshi Kirana',       zone:'Zone B', orders:7,  due:530,  lastPay:'22 Apr 2026', status:'Partial' },
  ],

  /* ── PRODUCTS ── */
  products: {
    month: [
      { rank:1, name:'Shree Dahi Tub',      category:'Dahi',   units:184, revenue:'₹12.3k', avgDaily:6, spark:[4,6,6,7,5,6,6], stock:'OK'       },
      { rank:2, name:'Shree Dahi Can',       category:'Dahi',   units:124, revenue:'₹29.1k', avgDaily:4, spark:[4,4,4,4,4,4,4], stock:'OK'       },
      { rank:3, name:'Tak Plain',            category:'Tak',    units:98,  revenue:'₹2.7k',  avgDaily:3, spark:[3,3,3,4,3,3,3], stock:'Low Stock' },
      { rank:4, name:'Tak Masala',           category:'Tak',    units:72,  revenue:'₹2.1k',  avgDaily:2, spark:[2,3,2,3,2,2,2], stock:'OK'       },
      { rank:5, name:'Analog Cheez Paneer',  category:'Paneer', units:43,  revenue:'₹860',   avgDaily:1, spark:[2,1,1,1,1,1,1], stock:'Critical'  },
    ],
    week: [
      { rank:1, name:'Shree Dahi Tub',      category:'Dahi',   units:43,  revenue:'₹2.9k',  avgDaily:6, spark:[6,6,7,7,6,7,6], stock:'OK'       },
      { rank:2, name:'Shree Dahi Can',       category:'Dahi',   units:29,  revenue:'₹6.8k',  avgDaily:4, spark:[4,4,4,4,4,4,4], stock:'OK'       },
      { rank:3, name:'Tak Plain',            category:'Tak',    units:23,  revenue:'₹630',   avgDaily:3, spark:[3,3,3,3,3,3,3], stock:'Low Stock' },
      { rank:4, name:'Tak Masala',           category:'Tak',    units:17,  revenue:'₹490',   avgDaily:2, spark:[2,2,3,2,3,2,2], stock:'OK'       },
      { rank:5, name:'Analog Cheez Paneer',  category:'Paneer', units:10,  revenue:'₹190',   avgDaily:1, spark:[1,1,1,2,1,1,1], stock:'Critical'  },
    ],
    today: [
      { rank:1, name:'Shree Dahi Tub',      category:'Dahi',   units:6,   revenue:'₹400',   avgDaily:6, spark:[5,6,6,6,6,7,6], stock:'OK'       },
      { rank:2, name:'Shree Dahi Can',       category:'Dahi',   units:4,   revenue:'₹960',   avgDaily:4, spark:[4,4,4,4,4,4,4], stock:'OK'       },
      { rank:3, name:'Tak Plain',            category:'Tak',    units:3,   revenue:'₹90',    avgDaily:3, spark:[3,3,3,3,3,4,3], stock:'Low Stock' },
      { rank:4, name:'Tak Masala',           category:'Tak',    units:2,   revenue:'₹70',    avgDaily:2, spark:[2,2,3,2,3,2,2], stock:'OK'       },
      { rank:5, name:'Analog Cheez Paneer',  category:'Paneer', units:1,   revenue:'₹28',    avgDaily:1, spark:[2,1,1,2,1,1,1], stock:'Critical'  },
    ],
  },

  /* ── DELIVERY ── */
  delivery: {
    total: 42, delivered: 24,
    agents: [
      { name:'Suresh Kumar', zone:'Zone A', delivered:12, missed:1, pending:3, collected:'₹420' },
      { name:'Ravi Patel',   zone:'Zone B', delivered:8,  missed:0, pending:2,  collected:'₹310' },
      { name:'Mohan Singh',  zone:'Zone C', delivered:4,  missed:1, pending:4, collected:'₹180' },
    ],
    missed: [
      { customer:'Anil Sharma',     zone:'Zone A', reason:'Not home' },
      { customer:'Rakesh Yadav',    zone:'Zone B', reason:'Refused — dispute' },
      { customer:'Sunita Gupta',    zone:'Zone C', reason:'Not home' },
    ],
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
