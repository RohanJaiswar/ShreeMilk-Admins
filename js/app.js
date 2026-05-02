/* ── MAIN APP ── */

/* ── PROFILE MENU LOGIC ── */
window.toggleProfileMenu = function(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('profileDropdown');
  if(dropdown) {
    dropdown.classList.toggle('show');
  }
};

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('profileDropdown');
  const userInfo = document.querySelector('.user-info');
  if (dropdown && dropdown.classList.contains('show') && userInfo && !userInfo.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

/* ── SIDEBAR TOGGLE ── */
function initSidebar() {
  const sider = document.getElementById('sider');
  const wrapper = document.getElementById('mainWrapper');
  const toggle = document.getElementById('sideToggle');
  const overlay = document.getElementById('overlay');
  const isMobile = () => window.innerWidth <= 768;

  toggle.addEventListener('click', () => {
    if (isMobile()) {
      sider.classList.toggle('mobile-open');
      overlay.classList.toggle('show');
    } else {
      sider.classList.toggle('collapsed');
      wrapper.classList.toggle('shifted');
    }
  });
  overlay.addEventListener('click', () => {
    sider.classList.remove('mobile-open');
    overlay.classList.remove('show');
  });

  /* Nav items */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (isMobile()) {
        sider.classList.remove('mobile-open');
        overlay.classList.remove('show');
      }
    });
  });
}

/* ── DATE IN HEADER ── */
function initDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  el.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

/* ── KPI MASKS ── */
window.isKpiMasked = false;
window.toggleKpiMask = function() {
  window.isKpiMasked = !window.isKpiMasked;
  
  // Update UI texts if button exists
  const icon = document.getElementById('kpiEyeIcon');
  const text = document.getElementById('kpiMaskText');
  if (icon && text) {
    icon.setAttribute('name', window.isKpiMasked ? 'eye-outline' : 'eye-off-outline');
    text.textContent = window.isKpiMasked ? 'Show' : 'Mask';
  }

  // Toggle class on existing elements without full re-render
  document.querySelectorAll('.kpi-value').forEach(el => {
    if (window.isKpiMasked) {
      el.classList.add('masked');
    } else {
      el.classList.remove('masked');
    }
  });
};

/* ── KPI CARDS ── */
function renderKpi() {
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;
  grid.innerHTML = DATA.kpi.map(k => `
    <div class="kpi-card ${k.color}" title="${k.label}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${window.isKpiMasked ? 'masked' : ''}">${k.value}</div>
      <div class="kpi-trend ${k.trendDir}">
        ${k.trendDir==='up' ? '<ion-icon name="caret-up-outline"></ion-icon>' : k.trendDir==='down' ? '<ion-icon name="caret-down-outline"></ion-icon>' : '<ion-icon name="ellipse" style="font-size:8px"></ion-icon>'}
        ${k.trend}
        <span class="kpi-sub">&nbsp;${k.sub}</span>
      </div>
    </div>`).join('');
}

/* ── VENDOR TABLE ── */
let vendorSort = { col: null, dir: 'asc' };
let vendorFilters = { zone: 'all', status: 'all', search: '' };

function statusTag(s) {
  const map = { Paid:'tag-success', Overdue:'tag-danger', Partial:'tag-warning' };
  return `<span class="tag ${map[s]||'tag-info'}"><ion-icon name="${s==='Paid'?'checkmark-circle-outline':s==='Overdue'?'close-circle-outline':'remove-circle-outline'}"></ion-icon> ${s}</span>`;
}

function filteredVendors() {
  return DATA.vendors.filter(v => {
    const zoneOk = vendorFilters.zone === 'all' || v.zone === vendorFilters.zone;
    const statusOk = vendorFilters.status === 'all' || v.status === vendorFilters.status;
    const searchOk = v.name.toLowerCase().includes(vendorFilters.search.toLowerCase());
    return zoneOk && statusOk && searchOk;
  }).sort((a, b) => {
    if (!vendorSort.col) return 0;
    let va = a[vendorSort.col], vb = b[vendorSort.col];
    if (vendorSort.dir === 'desc') [va, vb] = [vb, va];
    return va > vb ? 1 : va < vb ? -1 : 0;
  });
}

function renderVendorTable() {
  const tbody = document.getElementById('vendorTbody');
  if (!tbody) return;
  const rows = filteredVendors();
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:32px">No vendors found</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(v => `
    <tr>
      <td><strong>${v.name}</strong></td>
      <td><span class="tag tag-info" style="font-size:11px">${v.zone}</span></td>
      <td style="text-align:right">${v.orders}</td>
      <td style="text-align:right;font-weight:600;color:${v.due>0?'#ff4d4f':'#52c41a'}">
        ${v.due > 0 ? '₹' + v.due.toLocaleString('en-IN') : '—'}
      </td>
      <td>${v.lastPay}</td>
      <td>${statusTag(v.status)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn btn-sm btn-primary" onclick="alert('Collect Now: ${v.name}')">Collect Now</button>
          <button class="btn-link" onclick="alert('View History: ${v.name}')">View History</button>
        </div>
      </td>
    </tr>`).join('');
}

function initVendorTable() {
  renderVendorTable();

  document.getElementById('vendorSearch')?.addEventListener('input', e => {
    vendorFilters.search = e.target.value;
    renderVendorTable();
  });
  document.getElementById('vendorZone')?.addEventListener('change', e => {
    vendorFilters.zone = e.target.value;
    renderVendorTable();
  });
  document.getElementById('vendorStatus')?.addEventListener('change', e => {
    vendorFilters.status = e.target.value;
    renderVendorTable();
  });

  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (vendorSort.col === col) vendorSort.dir = vendorSort.dir === 'asc' ? 'desc' : 'asc';
      else { vendorSort.col = col; vendorSort.dir = 'asc'; }
      document.querySelectorAll('[data-sort]').forEach(t => t.classList.remove('sorted'));
      th.classList.add('sorted');
      th.querySelector('.sort-icon').innerHTML = vendorSort.dir === 'asc' ? '<ion-icon name="caret-up-outline"></ion-icon>' : '<ion-icon name="caret-down-outline"></ion-icon>';
      renderVendorTable();
    });
  });
}

/* ── PRODUCTS TABLE ── */
let productPeriod = 'month';

function stockTag(s) {
  const map = { 'OK':'tag-success', 'Low Stock':'tag-warning', 'Critical':'tag-danger' };
  const icon = { 'OK':'<ion-icon name="checkmark-outline"></ion-icon>', 'Low Stock':'<ion-icon name="warning-outline"></ion-icon>', 'Critical':'<ion-icon name="alert-circle-outline"></ion-icon>' };
  return `<span class="tag ${map[s]||'tag-info'}" style="display:flex;align-items:center;gap:4px">${icon[s]||''} ${s}</span>`;
}

function sparklineHTML(vals) {
  const max = Math.max(...vals);
  return `<div class="sparkline">${vals.map(v =>
    `<div class="spark-bar" style="height:${Math.round((v/max)*100)}%"></div>`
  ).join('')}</div>`;
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTbody');
  if (!tbody) return;
  const rows = DATA.products[productPeriod] || [];
  tbody.innerHTML = rows.map(p => `
    <tr>
      <td><strong>#${p.rank}</strong></td>
      <td>${p.name}</td>
      <td><span class="tag tag-purple" style="font-size:11px">${p.category}</span></td>
      <td style="text-align:right;font-weight:600">${p.units.toLocaleString('en-IN')}</td>
      <td style="font-weight:600">${p.revenue}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-weight:600;min-width:30px">${p.avgDaily}/day</span>
          ${sparklineHTML(p.spark)}
        </div>
      </td>
      <td>${stockTag(p.stock)}</td>
    </tr>`).join('');
}

function initProductsTable() {
  renderProductsTable();
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      productPeriod = btn.dataset.period;
      renderProductsTable();
    });
  });
}

/* ── DELIVERY STATUS ── */
function renderDelivery() {
  const { total, delivered, agents, missed } = DATA.delivery;

  /* Progress circle */
  const circleWrap = document.getElementById('deliveryCircle');
  if (circleWrap) circleWrap.innerHTML = renderProgressCircle(delivered, total);

  /* Agents table */
  const tbody = document.getElementById('agentsTbody');
  if (tbody) {
    tbody.innerHTML = agents.map(a => `
      <tr>
        <td><strong>${a.name}</strong></td>
        <td><span class="tag tag-info" style="font-size:11px">${a.zone}</span></td>
        <td style="color:#52c41a;font-weight:600">${a.delivered}</td>
        <td style="color:#ff4d4f;font-weight:600">${a.missed}</td>
        <td style="color:#fa8c16;font-weight:600">${a.pending}</td>
        <td style="font-weight:600">${a.collected}</td>
      </tr>`).join('');
  }

  /* Missed deliveries */
  const missedList = document.getElementById('missedList');
  if (missedList) {
    missedList.innerHTML = missed.map(m => `
      <div class="missed-customer">
        <ion-icon name="ellipse" style="color:var(--danger);font-size:10px;margin-right:4px"></ion-icon>
        <strong>${m.customer}</strong>
        <span class="tag tag-info" style="font-size:10px;margin-left:4px">${m.zone}</span>
        <span style="color:#94a3b8;font-size:12px;margin-left:auto">${m.reason}</span>
      </div>`).join('');
  }
}

function initDelivery() {
  renderDelivery();
  /* Auto-refresh every 30s — simulated by re-rendering same data */
  setInterval(() => {
    const el = document.getElementById('lastRefresh');
    if (el) el.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN');
  }, 30000);
}

/* ── EXPAND PANEL (Missed Deliveries) ── */
function initExpandPanels() {
  document.querySelectorAll('.expand-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const arrow = header.querySelector('.expand-arrow');
      body.classList.toggle('open');
      if (arrow) arrow.innerHTML = body.classList.contains('open') ? '<ion-icon name="chevron-up-outline"></ion-icon>' : '<ion-icon name="chevron-down-outline"></ion-icon>';
    });
  });
}

/* ── QUICK ACTIONS ── */
function initQuickActions() {
  const actions = [
    { label:'Generate Bills', icon:'<ion-icon name="receipt-outline"></ion-icon>', style:'btn-primary' },
    { label:'Export Excel', icon:'<ion-icon name="document-text-outline"></ion-icon>', style:'btn-success' },
    { label:'Send Reminders', icon:'<ion-icon name="paper-plane-outline"></ion-icon>', style:'btn-outline' },
    { label:'Add Product', icon:'<ion-icon name="add-circle-outline"></ion-icon>', style:'btn-outline' },
    { label:'Record Payment', icon:'<ion-icon name="wallet-outline"></ion-icon>', style:'btn-outline' },
  ];
  const bar = document.getElementById('quickActions');
  if (!bar) return;
  bar.innerHTML = `<span class="quick-actions-label">Quick Actions:</span>` +
    actions.map(a => `<button class="btn ${a.style}" onclick="alert('${a.label} — coming soon!')">${a.icon} ${a.label}</button>`).join('');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initDate();
  renderKpi();
  initCharts();
  initVendorTable();
  initProductsTable();
  initDelivery();
  initExpandPanels();
  initQuickActions();

});
