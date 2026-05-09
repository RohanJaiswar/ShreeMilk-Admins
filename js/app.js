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
  if (!grid || typeof DATA === 'undefined' || !DATA.kpi) return;
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
  if (typeof DATA === 'undefined' || !DATA.vendors) return [];
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
          ${v.due > 0
            ? `<button class="btn btn-sm btn-primary" onclick="collectNow('${v.id}', '${v.name.replace(/'/g, "\\'")}',${ v.due })"><ion-icon name='cash-outline'></ion-icon> Collect</button>`
            : `<button class="btn btn-sm btn-success" disabled style="cursor:default;"><ion-icon name='checkmark-circle-outline'></ion-icon> Paid</button>`
          }
          <button class="btn-link" onclick="viewHistory('${v.id}', '${v.name.replace(/'/g, "\\'")}')" style="font-size:12px;color:var(--primary);">History</button>
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
  if (!tbody || typeof DATA === 'undefined' || !DATA.products) return;
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
  if (typeof DATA === 'undefined' || !DATA.delivery) return;
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
  const bar = document.getElementById('quickActions');
  if (!bar) return;
  bar.innerHTML = `
    <span class="quick-actions-label">Quick Actions:</span>
    <button class="btn btn-primary" id="qa-bills" onclick="quickActionGenerateBills()">
      <ion-icon name="receipt-outline"></ion-icon> Generate Bills
    </button>
    <button class="btn btn-success" id="qa-excel" onclick="quickActionExportExcel()">
      <ion-icon name="document-text-outline"></ion-icon> Export Excel
    </button>
    <button class="btn btn-outline" id="qa-reminders" onclick="quickActionSendReminders()">
      <ion-icon name="paper-plane-outline"></ion-icon> Send Reminders
    </button>
    <button class="btn btn-outline" id="qa-product" onclick="quickActionAddProduct()">
      <ion-icon name="add-circle-outline"></ion-icon> Add Product
    </button>
    <button class="btn btn-outline" id="qa-payment" onclick="quickActionRecordPayment()">
      <ion-icon name="wallet-outline"></ion-icon> Record Payment
    </button>
  `;
}

/* ── QUICK ACTION HANDLERS ── */
window.quickActionGenerateBills = function() {
  window.open('invoice.html', '_blank');
};

window.quickActionExportExcel = function() {
  exportTableToExcel('dashboard');
};

window.quickActionSendReminders = function() {
  const overdue = DATA.vendors.filter(v => v.status === 'Overdue' || v.status === 'Partial');
  if (!overdue.length) {
    showToast('✅ No pending reminders — all vendors are paid up!', 'success');
    return;
  }
  const list = overdue.map(v =>
    `<li style="padding:6px 0;border-bottom:1px solid var(--border);">
      <strong>${v.name}</strong> — <span style="color:${v.status==='Overdue'?'var(--danger)':'var(--warning)'}">${v.status}</span>
      ${v.due > 0 ? ` &nbsp;·&nbsp; <strong>₹${v.due.toLocaleString('en-IN')}</strong> due` : ''}
    </li>`
  ).join('');
  showModal(
    '<ion-icon name="paper-plane-outline"></ion-icon> Send Payment Reminders',
    `<p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">${overdue.length} vendor(s) have outstanding dues:</p>
    <ul style="list-style:none;padding:0;margin:0 0 16px;">${list}</ul>
    <p style="font-size:12px;color:var(--text-muted);"><ion-icon name="information-circle-outline"></ion-icon> In a production system this would send WhatsApp/SMS messages to vendors.</p>`,
    [{ label: 'Send All Reminders', cls: 'btn-primary', action: () => { showToast(`✅ ${overdue.length} reminder(s) queued for delivery!`, 'success'); closeModal(); } },
     { label: 'Cancel', cls: 'btn-outline', action: closeModal }]
  );
};

window.quickActionAddProduct = function() {
  window.location.href = 'settings.html#products';
};

window.quickActionRecordPayment = function() {
  window.location.href = 'transactions.html';
};

/* ── COLLECT NOW / VIEW HISTORY (vendor table) ── */
window.collectNow = function(vendorId, vendorName, vendorDue) {
  showModal(
    '<ion-icon name="cash-outline"></ion-icon> Collect Payment — ' + vendorName,
    `<div style="margin-bottom:16px;">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">Outstanding Due</div>
      <div style="font-size:28px;font-weight:800;color:var(--danger);">₹${parseInt(vendorDue).toLocaleString('en-IN')}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Amount Collected (₹)</label>
      <input type="number" id="modal_collect_amount" class="form-control" placeholder="Enter amount" value="${vendorDue}" />
    </div>
    <div class="form-group">
      <label class="form-label">Payment Mode</label>
      <select id="modal_collect_mode" class="form-control">
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank_transfer">Bank Transfer</option>
      </select>
    </div>`,
    [{ label: '<ion-icon name="checkmark-outline"></ion-icon> Record Collection', cls: 'btn-primary', action: async () => {
        const amt = document.getElementById('modal_collect_amount')?.value;
        const mode = document.getElementById('modal_collect_mode')?.value;
        if (!amt || isNaN(amt) || parseFloat(amt) <= 0) { showToast('❌ Please enter a valid amount.', 'error'); return; }
        
        // Log transaction to Supabase
        if (window.supabaseClient) {
            try {
                const txn = {
                    vendor_id: vendorId,
                    vendor_name: vendorName,
                    amount: parseFloat(amt),
                    payment_mode: mode,
                    transaction_ref: 'TXN-' + Math.random().toString(36).substr(2, 6).toUpperCase()
                };
                await window.supabaseClient.from('transactions').insert([txn]);
                // Update outstanding balance
                const newDue = vendorDue - parseFloat(amt);
                await window.supabaseClient.from('vendors').update({ outstanding_balance: newDue }).eq('id', vendorId);
                
                // Recalculate precise balances globally
                if (window.recalculateVendorBalances) await window.recalculateVendorBalances();
            } catch (err) {
                console.error("Error logging payment:", err);
                showToast('❌ Error recording payment.', 'error');
                return;
            }
        }

        showToast(`✅ ₹${parseFloat(amt).toLocaleString('en-IN')} collected from ${vendorName}`, 'success');
        closeModal();
        setTimeout(() => { window.location.href = 'transactions.html'; }, 1000);
      }
    },
    { label: 'Cancel', cls: 'btn-outline', action: closeModal }]
  );
};

window.viewHistory = function(vendorId, vendorName) {
  window.location.href = 'transactions.html';
};

/* ── MODAL SYSTEM ── */
function showModal(title, body, buttons) {
  let modal = document.getElementById('_globalModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = '_globalModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);';
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.body.appendChild(modal);
  }
  const btnsHTML = (buttons || []).map(b =>
    `<button class="btn ${b.cls}" id="_mbtn_${Math.random().toString(36).slice(2)}">${b.label}</button>`
  ).join('');
  modal.innerHTML = `
    <div style="background:var(--bg-card,#fff);border-radius:16px;padding:28px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="font-size:16px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px;">${title}</div>
      <div style="font-size:14px;color:var(--text-secondary);line-height:1.6;">${body}</div>
      <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;" id="_modalBtnRow"></div>
    </div>`;
  const btnRow = document.getElementById('_modalBtnRow');
  (buttons || []).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + b.cls;
    btn.innerHTML = b.label;
    btn.addEventListener('click', b.action);
    btnRow.appendChild(btn);
  });
  modal.style.display = 'flex';
}

window.closeModal = function() {
  const modal = document.getElementById('_globalModal');
  if (modal) modal.style.display = 'none';
};

/* ── TOAST NOTIFICATION ── */
function showToast(message, type) {
  let container = document.getElementById('_toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = '_toastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { success: '#16a34a', error: '#dc2626', info: '#1677ff' };
  toast.style.cssText = `background:${colors[type]||colors.info};color:white;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:slideInRight .3s ease;max-width:320px;`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

window.showToast = showToast;

/* ── EXCEL EXPORT ── */
function exportTableToExcel(context) {
  const rows = [];
  if (context === 'dashboard') {
    rows.push(['Vendor Name', 'Zone', 'This Month Orders', 'Amount Due (₹)', 'Last Payment', 'Status']);
    DATA.vendors.forEach(v => {
      rows.push([v.name, v.zone, v.orders, v.due, v.lastPay, v.status]);
    });
    downloadCSVAsExcel(rows, 'ShreejiMilk_Vendors_' + new Date().toISOString().slice(0,10));
  }
}

window.exportTransactionsExcel = function(transactions) {
  if (!transactions || !transactions.length) { showToast('No transactions to export.', 'info'); return; }
  const rows = [['Date', 'Transaction ID', 'Vendor', 'Amount (₹)', 'Payment Mode', 'Status']];
  transactions.forEach(t => {
    const date = new Date(t.created_at).toLocaleDateString('en-GB');
    const txnId = t.transaction_ref || (t.id ? t.id.substring(0, 8).toUpperCase() : 'N/A');
    const entity = t.vendor_name || t.delivery_partner_name || '—';
    const amount = parseFloat(t.amount || 0).toFixed(2);
    rows.push([date, txnId, entity, amount, t.payment_mode || 'Unknown', 'Completed']);
  });
  downloadCSVAsExcel(rows, 'ShreejiMilk_Transactions_' + new Date().toISOString().slice(0,10));
};

window.exportOrdersExcel = function(orders) {
  if (!orders || !orders.length) { showToast('No orders to export.', 'info'); return; }
  const rows = [['Order ID', 'Vendor', 'Zone', 'Phone', 'Items Summary', 'Amount (₹)', 'Status', 'Date']];
  orders.forEach(o => {
    const shortId = '#' + (o.id || '').substring(0, 8).toUpperCase();
    const amount = parseFloat(o.total_amount || 0).toFixed(2);
    rows.push([shortId, o.vendor_name || '—', o.vendor_zone || '—', o.phone_number || '—', o.items_summary || '—', amount, o.status || '—', o.order_date || '—']);
  });
  downloadCSVAsExcel(rows, 'ShreejiMilk_Orders_' + new Date().toISOString().slice(0,10));
};

function downloadCSVAsExcel(rows, filename) {
  // Build CSV content
  const csv = rows.map(row =>
    row.map(cell => {
      const val = String(cell ?? '');
      // Quote cells that contain commas, quotes, or newlines
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',')
  ).join('\n');

  // Add BOM for Excel UTF-8 recognition
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Export downloaded: ' + filename + '.csv', 'success');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initDate();
  // Data rendering is now triggered by Supabase after fetching
  // renderKpi();
  // initCharts();
  initVendorTable(); // We still init event listeners here, data will re-render later
  initProductsTable();
  initDelivery();
  initExpandPanels();
  initQuickActions();

});
