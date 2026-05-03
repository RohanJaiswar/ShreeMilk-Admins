/* =========================================================================
 * SUPABASE INTEGRATION SCRIPT
 * This script connects your frontend forms to the Supabase backend.
 * ========================================================================= */

// 1. INITIALIZE SUPABASE CLIENT
// Replace SUPABASE_ANON_KEY with your actual anon key
const SUPABASE_URL = 'https://tqtvxtipqbnvyquljgtg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_na3VEkRe9gb7Nysy5crL1g_oR-M2W9x';

// Check if supabase library is loaded
let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized!");
} else {
    console.warn("Supabase library not found. Please ensure the CDN script is included.");
    alert("Database connection could not be established. Please refresh the page.");
}

// 2. FETCH FUNCTIONS
async function fetchDirectory() {
    const tableBody = document.getElementById('directory_table_body');
    if (!tableBody) return; // Only run on vendors page

    try {
        // Fetch vendors
        const { data: vendors, error: vError } = await supabaseClient.from('vendors').select('*').order('created_at', { ascending: false });
        if (vError) throw vError;

        // Fetch delivery partners
        const { data: partners, error: pError } = await supabaseClient.from('delivery_partners').select('*').order('created_at', { ascending: false });
        if (pError) throw pError;

        if ((!vendors || vendors.length === 0) && (!partners || partners.length === 0)) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No vendors or delivery partners added till now.</td></tr>';
            
            // Update counts to 0
            const cv = document.getElementById('count_vendors');
            const cp = document.getElementById('count_partners');
            if (cv) cv.innerText = "0";
            if (cp) cp.innerText = "0";
            
            return;
        }

        let rowsHTML = '';
        
        // Render Vendors & Update Count
        const cv = document.getElementById('count_vendors');
        if (cv) cv.innerText = vendors ? vendors.length : "0";

        // Populate container vendor select if present
        const cVendorSelect = document.getElementById('c_vendor_select');
        if (cVendorSelect && vendors) {
            cVendorSelect.innerHTML = '<option value="">-- Select a Vendor --</option>' + 
                vendors.map(v => `<option value="${v.id}" data-containers="${v.containers_balance || 0}">${v.store_name || v.username} (${v.containers_balance || 0} containers)</option>`).join('');
        }

        if (vendors) {
            vendors.forEach(v => {
                const bal = v.containers_balance || 0;
                let balTag = 'tag-success';
                if (bal >= 5) balTag = 'tag-danger';
                else if (bal >= 3) balTag = 'tag-warning';
                rowsHTML += `
                <tr>
                  <td><span class="tag tag-info"><ion-icon name="storefront-outline"></ion-icon> Vendor</span></td>
                  <td style="font-weight: 500;">${v.store_name}</td>
                  <td>${v.zone}</td>
                  <td>${v.phone_number}</td>
                  <td><span class="tag ${balTag}" style="font-weight:600;"><ion-icon name="cube-outline"></ion-icon> ${bal}</span></td>
                  <td><span class="tag tag-success">Active</span></td>
                  <td><button class="btn btn-ghost btn-sm">View</button></td>
                </tr>`;
            });
        }

        // Render Partners & Update Count
        const cp = document.getElementById('count_partners');
        if (cp) cp.innerText = partners ? partners.length : "0";

        if (partners) {
            partners.forEach(p => {
                rowsHTML += `
                <tr>
                  <td><span class="tag tag-purple"><ion-icon name="bicycle-outline"></ion-icon> Partner</span></td>
                  <td style="font-weight: 500;">${p.full_name}</td>
                  <td>${p.assigned_zone}</td>
                  <td>${p.phone_number}</td>
                  <td style="color: var(--text-muted);">—</td>
                  <td style="font-family: monospace; color: var(--text-secondary);">${p.vehicle_number}</td>
                  <td><button class="btn btn-ghost btn-sm">View</button></td>
                </tr>`;
            });
        }

        tableBody.innerHTML = rowsHTML;

    } catch (error) {
        console.error("Error fetching directory:", error);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--danger);">Error loading directory.</td></tr>`;
    }
}

async function fetchProducts() {
    const tableBody = document.getElementById('products_table_body');
    if (!tableBody) return; // Only run on settings page

    try {
        const { data: products, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!products || products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No products added till now.</td></tr>';
            return;
        }

        let rowsHTML = '';
        products.forEach(p => {
            // Pick tag color based on category
            let tagClass = "tag-info";
            if (p.category.toLowerCase().includes('paneer')) tagClass = "tag-warning";
            else if (p.category.toLowerCase().includes('by-product')) tagClass = "tag-purple";

            rowsHTML += `
            <tr>
              <td><div style="width: 40px; height: 40px; background: #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #94a3b8;"><ion-icon name="image-outline"></ion-icon></div></td>
              <td style="font-weight: 600;">${p.product_name}</td>
              <td><span class="tag ${tagClass}">${p.category}</span></td>
              <td>${p.unit_weight}</td>
              <td style="font-weight: 600; color: var(--success);">₹ ${parseFloat(p.base_price).toFixed(2)}</td>
              <td><button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="alert('Delete functionality coming soon!')"><ion-icon name="trash-outline"></ion-icon> Remove</button></td>
            </tr>`;
        });

        tableBody.innerHTML = rowsHTML;

    } catch (error) {
        console.error("Error fetching products:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--danger);">Error loading products.</td></tr>`;
    }
}

// =========================================================================
// TRANSACTIONS MODULE
// =========================================================================

let _allTransactions = [];
let _allVendorsTx = [];

async function fetchTransactions() {
    const tableBody = document.getElementById('transactions_table_body');
    if (!tableBody) return; // Only run on transactions page

    try {
        // Fetch vendors to populate dropdown and for summary stats
        const { data: vendors, error: vError } = await supabaseClient
            .from('vendors')
            .select('id, store_name, username, outstanding_balance');
            
        if (!vError && vendors) {
            _allVendorsTx = vendors;
            renderVendorChips(_allVendorsTx);
        }

        const { data: transactions, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        _allTransactions = transactions || [];
        window._allTransactions = _allTransactions; // expose for export button
        
        // Setup filter listeners
        document.getElementById('dateFilter')?.addEventListener('change', applyTransactionFilters);
        document.getElementById('searchFilter')?.addEventListener('input', applyTransactionFilters);
        
        document.getElementById('vendorSearchInput')?.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = _allVendorsTx.filter(v => (v.store_name || v.username || '').toLowerCase().includes(val));
            renderVendorChips(filtered);
        });

        applyTransactionFilters();

    } catch (error) {
        console.error("Error fetching transactions:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--danger);">Error loading transactions.</td></tr>`;
    }
}

let _activeVendorId = '';

function renderVendorChips(vendors) {
    const container = document.getElementById('vendorChipsContainer');
    if (!container) return;
    
    let html = `<button class="vendor-chip ${_activeVendorId === '' ? 'active' : ''}" data-id="" onclick="window.selectVendor('')" style="padding: 8px 16px; border-radius: 20px; border: 1px solid var(--primary); background: ${_activeVendorId === '' ? 'var(--primary)' : 'transparent'}; color: ${_activeVendorId === '' ? 'white' : 'var(--text-main)'}; cursor: pointer; white-space: nowrap; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                    All Vendors
                </button>`;
                
    vendors.forEach(v => {
        const name = v.store_name || v.username || 'Unknown';
        const isActive = _activeVendorId === v.id;
        html += `<button class="vendor-chip ${isActive ? 'active' : ''}" data-id="${v.id}" onclick="window.selectVendor('${v.id}')" style="padding: 8px 16px; border-radius: 20px; border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}; background: ${isActive ? 'var(--primary)' : 'transparent'}; color: ${isActive ? 'white' : 'var(--text-main)'}; cursor: pointer; white-space: nowrap; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                    ${name}
                </button>`;
    });
    container.innerHTML = html;
}

window.selectVendor = function(vendorId) {
    _activeVendorId = vendorId;
    
    // Update chip styling
    const chips = document.querySelectorAll('.vendor-chip');
    chips.forEach(c => {
        if (c.getAttribute('data-id') === vendorId) {
            c.classList.add('active');
            c.style.background = 'var(--primary)';
            c.style.color = 'white';
            c.style.borderColor = 'var(--primary)';
        } else {
            c.classList.remove('active');
            c.style.background = 'transparent';
            c.style.color = 'var(--text-main)';
            c.style.borderColor = c.getAttribute('data-id') === '' ? 'var(--primary)' : 'var(--border)';
            if(c.getAttribute('data-id') === '' && _activeVendorId !== '') {
               c.style.borderColor = 'var(--border)'; 
            }
        }
    });

    applyTransactionFilters();
};

function applyTransactionFilters() {
    const vendorId = _activeVendorId;
    const dateVal = document.getElementById('dateFilter')?.value || '';
    const searchVal = (document.getElementById('searchFilter')?.value || '').toLowerCase();
    
    // Vendor Summary Card Logic
    const summaryCard = document.getElementById('vendorSummaryCard');
    if (vendorId && summaryCard) {
        const vendor = _allVendorsTx.find(v => v.id === vendorId);
        
        // Outstanding Dues
        const dues = vendor?.outstanding_balance || 0;
        document.getElementById('summaryDues').innerText = '₹ ' + parseFloat(dues).toLocaleString('en-IN');
        
        // Outstanding Containers (Mocked deterministic based on vendor id string length)
        const mockContainers = vendor ? (vendor.id.charCodeAt(0) % 15) : 0;
        document.getElementById('summaryContainers').innerText = mockContainers;
        
        // Total Paid (Calculated from transactions)
        const vendorTxns = _allTransactions.filter(t => t.vendor_id === vendorId);
        const totalPaid = vendorTxns.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        document.getElementById('summaryPaid').innerText = '₹ ' + totalPaid.toLocaleString('en-IN');
        
        summaryCard.style.display = 'block';
    } else if (summaryCard) {
        summaryCard.style.display = 'none';
    }

    // Filter Transactions
    const filtered = _allTransactions.filter(t => {
        const tDate = t.created_at ? t.created_at.split('T')[0] : '';
        const dateOk = !dateVal || tDate === dateVal;
        const vendorOk = !vendorId || t.vendor_id === vendorId;
        const searchStr = `${t.transaction_ref || ''} ${t.id || ''} ${t.vendor_name || ''}`.toLowerCase();
        const searchOk = !searchVal || searchStr.includes(searchVal);
        
        return dateOk && vendorOk && searchOk;
    });

    renderTransactionsTable(filtered);
}

function renderTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactions_table_body');
    if (!tableBody) return;

    if (!transactions || transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No transactions found.</td></tr>';
        return;
    }

    let rowsHTML = '';
    transactions.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const txnId = t.transaction_ref || (t.id ? t.id.substring(0, 8).toUpperCase() : 'N/A');
        const entityName = t.vendor_name || t.delivery_partner_name || '—';
        const amount = parseFloat(t.amount || 0).toLocaleString('en-IN');
        
        let paymentIcon = 'wallet-outline';
        let tagClass = 'tag-info';
        const mode = (t.payment_mode || '').toLowerCase();
        
        if (mode.includes('upi')) {
            paymentIcon = 'phone-portrait-outline';
            tagClass = 'tag-purple';
        } else if (mode.includes('bank') || mode.includes('transfer')) {
            paymentIcon = 'time-outline';
            tagClass = 'tag-warning';
        } else if (mode.includes('cash')) {
            paymentIcon = 'wallet-outline';
            tagClass = 'tag-success';
        }
        
        const paymentModeDisplay = t.payment_mode ? (t.payment_mode.charAt(0).toUpperCase() + t.payment_mode.slice(1)) : 'Unknown';

        rowsHTML += `
          <tr>
            <td>${date}</td>
            <td style="font-family: monospace; color: var(--text-secondary);">${txnId}</td>
            <td style="font-weight: 500;">${entityName}</td>
            <td style="font-weight: 600;">₹ ${amount}</td>
            <td><span class="tag ${tagClass}"><ion-icon name="${paymentIcon}"></ion-icon> ${paymentModeDisplay}</span></td>
            <td><span class="tag tag-success">Completed</span></td>
          </tr>
        `;
    });

    tableBody.innerHTML = rowsHTML;
}

// =========================================================================
// ORDERS MODULE
// =========================================================================

/** All orders fetched from Supabase for the selected date (cached for filters) */
let _allOrders = [];

/**
 * Fetch orders for the date shown in #filterDate (defaults to today).
 * Populates the orders table, stats, and delivery cards.
 */
async function fetchOrders() {
    const tableBody = document.getElementById('orders_table_body');
    if (!tableBody) return; // Only run on delivery page

    // Determine the target date — fall back to today if input is empty or missing
    const dateInput = document.getElementById('filterDate');
    const today = new Date().toISOString().split('T')[0];
    const targetDate = (dateInput && dateInput.value) ? dateInput.value : today;

    // Also keep the input in sync with the resolved date
    if (dateInput && !dateInput.value) dateInput.value = today;

    // Show skeleton loader
    tableBody.innerHTML = `
        <tr class="skeleton-row"><td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr class="skeleton-row"><td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr class="skeleton-row"><td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;

    try {
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('order_date', targetDate)
            .order('created_at', { ascending: false });

        if (error) throw error;

        _allOrders = orders || [];
        window._allOrders = _allOrders; // expose for export button

        // Populate zone filter
        _populateZoneFilter(_allOrders);

        // Render table (with current filters)
        applyFilters();

        // Render delivery-tab components
        renderDeliveryCards(_allOrders);
        fetchDeliveryPartners();

    } catch (err) {
        console.error("Error fetching orders:", err);
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--danger);">
            <ion-icon name="warning-outline" style="font-size:24px;display:block;margin-bottom:8px;"></ion-icon>
            Failed to load orders: ${err.message || 'Check console for details.'}
        </td></tr>`;
    }
}

/** Populate the Zone filter dropdown from fetched orders */
function _populateZoneFilter(orders) {
    const select = document.getElementById('filterZone');
    if (!select) return;
    const currentVal = select.value;
    const zones = [...new Set(orders.map(o => o.vendor_zone).filter(Boolean))].sort();
    select.innerHTML = '<option value="">All Zones</option>' +
        zones.map(z => `<option value="${z}" ${z === currentVal ? 'selected' : ''}>${z}</option>`).join('');
}

/**
 * Apply search / zone / status filters to _allOrders and re-render the table.
 * Called on every filter change and after fresh data load.
 */
function applyFilters() {
    const search   = (document.getElementById('orderSearch')?.value || '').toLowerCase();
    const zone     = document.getElementById('filterZone')?.value || '';
    const status   = document.getElementById('filterStatus')?.value || '';

    const filtered = _allOrders.filter(o => {
        const nameOk   = !search || (o.vendor_name || '').toLowerCase().includes(search);
        const zoneOk   = !zone   || o.vendor_zone === zone;
        const statusOk = !status || (o.status || '').toLowerCase() === status.toLowerCase();
        return nameOk && zoneOk && statusOk;
    });

    _renderOrdersTable(filtered);
    _renderOrderStats(_allOrders); // Stats always show full-day totals
}

/** Render the orders table rows */
function _renderOrdersTable(orders) {
    const tableBody = document.getElementById('orders_table_body');
    if (!tableBody) return;

    const countEl = document.getElementById('orderCount');
    if (countEl) countEl.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;

    if (!orders.length) {
        tableBody.innerHTML = `
            <tr><td colspan="9">
              <div class="empty-state">
                <ion-icon name="document-text-outline"></ion-icon>
                <p>No orders found for the selected filters.</p>
              </div>
            </td></tr>`;
        return;
    }

    tableBody.innerHTML = orders.map(o => {
        const shortId = (o.id || '').substring(0, 8).toUpperCase();
        const amount  = parseFloat(o.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        const status  = (o.status || 'pending').toLowerCase();
        const tagClass = { pending: 'tag-warning', processing: 'tag-info', dispatched: 'tag-info', delivered: 'tag-success', cancelled: 'tag-danger' }[status] || 'tag-info';
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

        // Parse items_summary or items
        let itemsSummary = o.items_summary || '';
        if (!itemsSummary && o.items) {
            try {
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                if (Array.isArray(items)) {
                    itemsSummary = items.map(i => `${i.qty || i.quantity || '?'}x ${i.name || i.product_name || ''}`).join(', ');
                }
            } catch(e) { itemsSummary = '—'; }
        }

        // Items detail for expand row
        let itemsHTML = '';
        if (o.items) {
            try {
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                if (Array.isArray(items) && items.length) {
                    itemsHTML = `<ul>${items.map(i => `<li><strong>${i.qty || i.quantity || '?'}x</strong> ${i.name || i.product_name || 'Item'} — ₹${parseFloat(i.price || i.unit_price || 0).toFixed(2)} each</li>`).join('')}</ul>`;
                }
            } catch(e) { itemsHTML = `<p>${o.items}</p>`; }
        }
        const hasItems = !!itemsHTML;

        return `
        <tr id="row-${o.id}" style="cursor:${hasItems ? 'pointer' : 'default'};" ${hasItems ? `onclick="toggleItemsDetail('${o.id}')"` : ''}>
          <td style="text-align:center; padding: 10px 8px;">
            ${hasItems ? `<ion-icon name="chevron-forward-outline" id="chevron-${o.id}" style="color:var(--text-muted); transition:transform .2s;"></ion-icon>` : ''}
          </td>
          <td style="font-family:monospace; font-size:12px; font-weight:600;">#${shortId}</td>
          <td style="font-weight:600;">${o.vendor_name || '—'}</td>
          <td><span class="tag tag-info" style="font-size:11px;">${o.vendor_zone || '—'}</span></td>
          <td style="font-size:13px; color:var(--text-secondary);">${o.phone_number || '—'}</td>
          <td style="font-size:12px; color:var(--text-secondary); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsSummary}">${itemsSummary || '—'}</td>
          <td style="text-align:right; font-weight:700; color:var(--primary);">₹ ${amount}</td>
          <td>
            <select class="status-select" onclick="event.stopPropagation()" onchange="updateOrderStatus('${o.id}', this.value)">
              <option value="pending"    ${status==='pending'    ? 'selected':''}>Pending</option>
              <option value="processing" ${status==='processing' ? 'selected':''}>Processing</option>
              <option value="dispatched" ${status==='dispatched' ? 'selected':''}>Dispatched</option>
              <option value="delivered"  ${status==='delivered'  ? 'selected':''}>Delivered</option>
              <option value="cancelled"  ${status==='cancelled'  ? 'selected':''}>Cancelled</option>
            </select>
          </td>
          <td onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm" onclick="window.open('invoice.html?id=${o.id}&vendor=${encodeURIComponent(o.vendor_name||'')}', '_blank')">
              <ion-icon name="print-outline"></ion-icon> Print
            </button>
          </td>
        </tr>
        ${hasItems ? `<tr id="detail-${o.id}"><td colspan="9" style="padding:0;"><div class="items-detail" id="items-${o.id}">${itemsHTML}</div></td></tr>` : ''}`;
    }).join('');
}

/** Expand/collapse item details row */
window.toggleItemsDetail = function(id) {
    const detail = document.getElementById('items-' + id);
    const chevron = document.getElementById('chevron-' + id);
    if (!detail) return;
    detail.classList.toggle('open');
    if (chevron) chevron.style.transform = detail.classList.contains('open') ? 'rotate(90deg)' : '';
};

/** Render stat bar numbers */
function _renderOrderStats(orders) {
    const total     = orders.length;
    const pending   = orders.filter(o => ['pending','processing'].includes((o.status||'').toLowerCase())).length;
    const delivered = orders.filter(o => (o.status||'').toLowerCase() === 'delivered').length;
    const value     = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-total',     total);
    set('stat-pending',   pending);
    set('stat-delivered', delivered);
    set('stat-value',     '₹ ' + value.toLocaleString('en-IN', { minimumFractionDigits: 0 }));

    // Delivery tab stats
    const dispatched = orders.filter(o => (o.status||'').toLowerCase() === 'dispatched').length;
    const cancelled  = orders.filter(o => (o.status||'').toLowerCase() === 'cancelled').length;
    set('d-stat-dispatched', dispatched);
    set('d-stat-delivered',  delivered);
    set('d-stat-cancelled',  cancelled);
}

/** Render kanban-style delivery cards in the delivery tab */
function renderDeliveryCards(orders) {
    const grid = document.getElementById('delivery_cards_grid');
    if (!grid) return;

    const relevant = orders.filter(o => ['pending','processing','dispatched','delivered'].includes((o.status||'').toLowerCase()));

    if (!relevant.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
            <ion-icon name="bicycle-outline"></ion-icon>
            <p>No active orders for today.</p>
        </div>`;
        return;
    }

    grid.innerHTML = relevant.map(o => {
        const status = (o.status || 'pending').toLowerCase();
        const tagMap = { pending: 'tag-warning', processing: 'tag-info', dispatched: 'tag-info', delivered: 'tag-success' };
        const tagLabel = { pending: 'Pending Packing', processing: 'Processing', dispatched: 'Ready to Dispatch', delivered: 'Delivered' };
        const shortId = (o.id || '').substring(0, 8).toUpperCase();
        const amount  = parseFloat(o.total_amount || 0).toLocaleString('en-IN');

        // Build item list
        let itemsHtml = '';
        if (o.items) {
            try {
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                if (Array.isArray(items)) {
                    itemsHtml = `<ul style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;padding-left:18px;">
                        ${items.slice(0, 5).map(i => `<li>${i.qty || i.quantity || '?'}x ${i.name || i.product_name || 'Item'}</li>`).join('')}
                        ${items.length > 5 ? `<li style="color:var(--text-muted);">+${items.length - 5} more…</li>` : ''}
                    </ul>`;
                }
            } catch(e) {}
        }
        if (!itemsHtml) {
            itemsHtml = `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">${o.items_summary || '—'}</p>`;
        }

        // Action button based on status
        let actionBtn = '';
        if (status === 'pending') {
            actionBtn = `<button class="btn btn-primary btn-sm" style="width:100%;justify-content:center;" onclick="updateOrderStatus('${o.id}','processing')">
                <ion-icon name="cube-outline"></ion-icon> Mark as Processing
            </button>`;
        } else if (status === 'processing') {
            actionBtn = `<button class="btn btn-outline btn-sm" style="width:100%;justify-content:center;" onclick="updateOrderStatus('${o.id}','dispatched')">
                <ion-icon name="bicycle-outline"></ion-icon> Mark as Dispatched
            </button>`;
        } else if (status === 'dispatched') {
            actionBtn = `<button class="btn btn-success btn-sm" style="width:100%;justify-content:center;" onclick="updateOrderStatus('${o.id}','delivered')">
                <ion-icon name="checkmark-circle-outline"></ion-icon> Mark Delivered
            </button>`;
        } else {
            actionBtn = `<div style="font-size:12px;color:var(--success);display:flex;align-items:center;gap:4px;">
                <ion-icon name="checkmark-done-outline"></ion-icon> Delivered successfully
            </div>`;
        }

        return `
        <div class="card" id="card-${o.id}">
          <div class="card-header" style="background:var(--surface-2,#f8fafc);">
            <div style="font-weight:600;font-size:14px;">#${shortId} &mdash; ${o.vendor_name || '—'}</div>
            <span class="tag ${tagMap[status]}">${tagLabel[status]}</span>
          </div>
          <div class="card-body">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">
              <ion-icon name="location-outline"></ion-icon> ${o.vendor_zone || '—'} &nbsp;|&nbsp;
              <ion-icon name="call-outline"></ion-icon> ${o.phone_number || '—'}
            </div>
            ${itemsHtml}
            <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:14px;">₹ ${amount}</div>
            ${actionBtn}
          </div>
        </div>`;
    }).join('');
}

/** Update order status in Supabase and refresh */
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) throw error;

        // Update cached data locally for instant UI
        const idx = _allOrders.findIndex(o => o.id === orderId);
        if (idx !== -1) _allOrders[idx].status = newStatus;

        // Re-render
        applyFilters();
        renderDeliveryCards(_allOrders);

    } catch (err) {
        console.error("Error updating order status:", err);
        alert('❌ Could not update status: ' + (err.message || 'Check console.'));
    }
};

/** Fetch delivery partners and render their table */
async function fetchDeliveryPartners() {
    const tbody = document.getElementById('delivery_partners_body');
    if (!tbody) return;

    try {
        const { data: partners, error } = await supabaseClient
            .from('delivery_partners')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!partners || !partners.length) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No delivery partners registered.</td></tr>`;
            return;
        }

        tbody.innerHTML = partners.map(p => {
            const initials = (p.full_name || 'DP').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            return `
            <tr>
              <td style="font-weight:500;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="user-avatar" style="width:28px;height:28px;font-size:11px;">${initials}</div>
                  ${p.full_name}
                </div>
              </td>
              <td>${p.assigned_zone || '—'}</td>
              <td>${p.vehicle_number || '—'}</td>
              <td><span class="tag tag-success"><ion-icon name="bicycle-outline"></ion-icon> Active</span></td>
              <td style="font-size:13px;color:var(--text-muted);">${p.phone_number || '—'}</td>
              <td><button class="btn btn-ghost btn-sm">View</button></td>
            </tr>`;
        }).join('');

    } catch (err) {
        console.error("Error fetching delivery partners:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--danger);">Error loading partners.</td></tr>`;
    }
}

// =========================================================================
// DASHBOARD MODULE
// =========================================================================
async function fetchDashboardData() {
    // Only run on dashboard
    if (!document.getElementById('vendorTbody') && !document.getElementById('kpiGrid')) return;

    try {
        // Fetch all necessary data for KPIs
        const today = new Date().toISOString().split('T')[0];
        
        const [
            { data: vendors, error: vError },
            { data: products, error: pError },
            { data: partners, error: dpError },
            { data: ordersToday, error: oError },
            { data: transactions, error: tError }
        ] = await Promise.all([
            supabaseClient.from('vendors').select('*'),
            supabaseClient.from('products').select('*'),
            supabaseClient.from('delivery_partners').select('*'),
            supabaseClient.from('orders').select('id, total_amount, status').eq('order_date', today),
            supabaseClient.from('transactions').select('amount')
        ]);

        // Process KPI Data
        if (document.getElementById('kpiGrid')) {
            // Calculate Orders Today
            const totalOrdersToday = (ordersToday || []).length;
            
            // Calculate Total Revenue (All completed transactions)
            const totalRevenue = (transactions || []).reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
            // Update the global DATA object for KPI
            const kpiObj = DATA.kpi;
            
            // Update Revenue KPI
            if (kpiObj[0]) {
                kpiObj[0].value = '₹' + totalRevenue.toLocaleString('en-IN');
                kpiObj[0].trend = 'Live';
                kpiObj[0].sub = 'total collected';
            }
            
            // Update Orders Today KPI
            if (kpiObj[2]) {
                kpiObj[2].value = totalOrdersToday.toString();
                kpiObj[2].trend = 'Live';
                kpiObj[2].sub = 'dispatched/pending';
            }

            // We mock Pending Dues and Containers out as there is no specific table for them yet
            
            // Re-render KPI
            if (typeof renderKpi === 'function') renderKpi();
        }

        // Process Vendors (Users)
        if (!vError && vendors && vendors.length > 0) {
            DATA.vendors = vendors.map((v, index) => ({
                id: v.id || index + 1,
                name: v.store_name || v.username || 'Unknown',
                zone: v.zone || 'Zone A',
                orders: Math.floor(Math.random() * 25) + 1, // Mock orders for UI
                due: Math.floor(Math.random() * 4000),      // Mock dues
                lastPay: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: ['Paid', 'Overdue', 'Partial'][Math.floor(Math.random() * 3)]
            }));
            if (typeof renderVendorTable === 'function') renderVendorTable();
        }

        // Process Products
        if (!pError && products && products.length > 0) {
            const mappedProducts = products.map((p, idx) => ({
                rank: idx + 1,
                name: p.product_name,
                category: p.category,
                units: Math.floor(Math.random() * 200) + 10,
                revenue: '₹' + (parseFloat(p.base_price || 100) * 10).toLocaleString('en-IN'),
                avgDaily: Math.floor(Math.random() * 10) + 1,
                spark: [4,5,6,4,5,6,5],
                stock: ['OK', 'OK', 'Low Stock', 'Critical'][Math.floor(Math.random() * 4)]
            }));
            
            DATA.products.month = mappedProducts;
            DATA.products.week = mappedProducts;
            DATA.products.today = mappedProducts;
            
            if (typeof renderProductsTable === 'function') renderProductsTable();
        }

        // Process Delivery Partners
        if (!dpError && partners && partners.length > 0) {
            DATA.delivery.agents = partners.map(p => ({
                name: p.full_name,
                zone: p.assigned_zone || 'Zone A',
                delivered: Math.floor(Math.random() * 20),
                missed: Math.floor(Math.random() * 2),
                pending: Math.floor(Math.random() * 5),
                collected: '₹' + (Math.floor(Math.random() * 1000))
            }));
            if (typeof renderDelivery === 'function') renderDelivery();
        }

    } catch (err) {
        console.error("Error fetching dashboard data:", err);
    }
}

// 3. INITIALIZATION FUNCTION
function initSupabaseForms() {
    console.log("Initializing forms and fetching data...");

    // Fetch orders if on delivery page
    fetchOrders();

    // Fetch initial data for other pages
    fetchDirectory();
    fetchProducts();
    fetchTransactions();
    fetchDashboardData();

    /* ----------------------------------------------------------------------
     * CONTAINER MANAGEMENT LOGIC
     * ---------------------------------------------------------------------- */
    const cVendorSelect = document.getElementById('c_vendor_select');
    const cBalanceDisplay = document.getElementById('c_balance_display');

    if (cVendorSelect) {
        cVendorSelect.addEventListener('change', async () => {
            const vendorId = cVendorSelect.value;
            const issuedInput = document.getElementById('c_issued');
            const returnedInput = document.getElementById('c_returned');
            if (issuedInput) issuedInput.value = '';
            if (returnedInput) returnedInput.value = '';

            if (!vendorId) {
                if (cBalanceDisplay) cBalanceDisplay.textContent = '0';
                return;
            }

            // Fetch latest balance for selected vendor
            try {
                const { data, error } = await supabaseClient
                    .from('vendors')
                    .select('containers_balance')
                    .eq('id', vendorId)
                    .single();

                if (error) throw error;
                if (cBalanceDisplay) cBalanceDisplay.textContent = data.containers_balance || 0;
            } catch (err) {
                console.error('Error fetching container balance:', err);
                if (cBalanceDisplay) cBalanceDisplay.textContent = '?';
            }
        });
    }

    const btnUpdateContainers = document.getElementById('btn_update_containers');
    if (btnUpdateContainers) {
        btnUpdateContainers.addEventListener('click', async () => {
            const vendorId = document.getElementById('c_vendor_select')?.value;
            const issued = parseInt(document.getElementById('c_issued')?.value || '0', 10);
            const returned = parseInt(document.getElementById('c_returned')?.value || '0', 10);

            if (!vendorId) {
                alert('Please select a vendor first.');
                return;
            }
            if (issued === 0 && returned === 0) {
                alert('Enter at least one value — containers issued or returned.');
                return;
            }

            btnUpdateContainers.disabled = true;
            btnUpdateContainers.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> Saving…';

            try {
                // Get current balance
                const { data: vendor, error: fetchErr } = await supabaseClient
                    .from('vendors')
                    .select('containers_balance, store_name')
                    .eq('id', vendorId)
                    .single();

                if (fetchErr) throw fetchErr;

                const currentBalance = vendor.containers_balance || 0;
                const newBalance = currentBalance + issued - returned;

                // Update in Supabase
                const { error: updateErr } = await supabaseClient
                    .from('vendors')
                    .update({ containers_balance: newBalance })
                    .eq('id', vendorId);

                if (updateErr) throw updateErr;

                // Update UI
                if (cBalanceDisplay) cBalanceDisplay.textContent = newBalance;

                // Clear inputs
                const issuedInput = document.getElementById('c_issued');
                const returnedInput = document.getElementById('c_returned');
                if (issuedInput) issuedInput.value = '';
                if (returnedInput) returnedInput.value = '';

                alert(`✅ Updated ${vendor.store_name}:\n  Issued: +${issued}, Returned: -${returned}\n  New balance: ${newBalance} containers`);

                // Refresh the directory table to show updated counts
                fetchDirectory();

            } catch (err) {
                console.error('Error updating containers:', err);
                alert('❌ Failed to update containers: ' + (err.message || 'Check console.'));
            } finally {
                btnUpdateContainers.disabled = false;
                btnUpdateContainers.innerHTML = '<ion-icon name="save-outline"></ion-icon> Log Container Transaction';
            }
        });
    }

    /* ----------------------------------------------------------------------
     * ADD NEW VENDOR LOGIC
     * ---------------------------------------------------------------------- */
    const btnAddVendor = document.getElementById('btn_add_vendor');
    if (btnAddVendor) {
        btnAddVendor.addEventListener('click', async (e) => {
            e.preventDefault();

            // Gather values
            const storeName = document.getElementById('v_store_name')?.value;
            const phone = document.getElementById('v_phone')?.value;
            const zone = document.getElementById('v_zone')?.value;
            const username = document.getElementById('v_username')?.value;
            const password = document.getElementById('v_password')?.value;
            const address = document.getElementById('v_address')?.value;

            // Basic validation
            if (!storeName || !phone || !username || !password) {
                alert('Please fill in all mandatory fields (Store Name, Phone, Username, Password).');
                return;
            }

            // Visual feedback
            const originalText = btnAddVendor.innerHTML;
            btnAddVendor.innerHTML = '<ion-icon name="sync-outline" style="animation: spin 1s linear infinite;"></ion-icon> Saving...';
            btnAddVendor.disabled = true;

            try {
                // Insert into Supabase (Testing phase: password stored in plain text)
                const { data, error } = await supabaseClient
                    .from('vendors')
                    .insert([
                        { 
                            store_name: storeName, 
                            phone_number: phone, 
                            zone: zone, 
                            username: username, 
                            password: password, 
                            address: address 
                        }
                    ]);

                if (error) throw error;

                // Success Message
                alert('✅ Vendor successfully created in database!');
                
                // Clear Form
                document.getElementById('v_store_name').value = '';
                document.getElementById('v_phone').value = '';
                document.getElementById('v_username').value = '';
                document.getElementById('v_password').value = '';
                document.getElementById('v_address').value = '';

                // Refresh the table
                fetchDirectory();

            } catch (err) {
                console.error("Error inserting vendor:", err);
                alert('❌ Error creating vendor: ' + (err.message || "Check console for details."));
            } finally {
                // Restore button
                btnAddVendor.innerHTML = originalText;
                btnAddVendor.disabled = false;
            }
        });
    }

    /* ----------------------------------------------------------------------
     * ADD DELIVERY PARTNER LOGIC
     * ---------------------------------------------------------------------- */
    const btnAddDelivery = document.getElementById('btn_add_delivery');
    if (btnAddDelivery) {
        btnAddDelivery.addEventListener('click', async (e) => {
            e.preventDefault();

            // Gather values
            const fullName = document.getElementById('d_full_name')?.value;
            const phone = document.getElementById('d_phone')?.value;
            const zone = document.getElementById('d_zone')?.value;
            const username = document.getElementById('d_username')?.value;
            const password = document.getElementById('d_password')?.value;
            const vehicle = document.getElementById('d_vehicle')?.value;

            // Basic validation
            if (!fullName || !phone || !username || !password || !vehicle) {
                alert('Please fill in all mandatory fields.');
                return;
            }

            // Visual feedback
            const originalText = btnAddDelivery.innerHTML;
            btnAddDelivery.innerHTML = '<ion-icon name="sync-outline" style="animation: spin 1s linear infinite;"></ion-icon> Saving...';
            btnAddDelivery.disabled = true;

            try {
                // Insert into Supabase
                const { data, error } = await supabaseClient
                    .from('delivery_partners')
                    .insert([
                        { 
                            full_name: fullName, 
                            phone_number: phone, 
                            assigned_zone: zone, 
                            username: username, 
                            password: password, 
                            vehicle_number: vehicle 
                        }
                    ]);

                if (error) throw error;

                // Success Message
                alert('✅ Delivery Partner successfully created in database!');
                
                // Clear Form
                document.getElementById('d_full_name').value = '';
                document.getElementById('d_phone').value = '';
                document.getElementById('d_username').value = '';
                document.getElementById('d_password').value = '';
                document.getElementById('d_vehicle').value = '';

                // Refresh the table
                fetchDirectory();

            } catch (err) {
                console.error("Error inserting delivery partner:", err);
                alert('❌ Error creating delivery partner: ' + (err.message || "Check console for details."));
            } finally {
                // Restore button
                btnAddDelivery.innerHTML = originalText;
                btnAddDelivery.disabled = false;
            }
        });
    }

    /* ----------------------------------------------------------------------
     * ADD NEW PRODUCT LOGIC
     * ---------------------------------------------------------------------- */
    const btnAddProduct = document.getElementById('btn_add_product');
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', async (e) => {
            e.preventDefault();

            // Gather values
            const name = document.getElementById('p_name')?.value;
            const category = document.getElementById('p_category')?.value;
            const weight = document.getElementById('p_weight')?.value;
            const price = document.getElementById('p_price')?.value;

            // Basic validation
            if (!name || !category || !weight || !price) {
                alert('Please fill in all mandatory product fields.');
                return;
            }

            // Visual feedback
            const originalText = btnAddProduct.innerHTML;
            btnAddProduct.innerHTML = '<ion-icon name="sync-outline" style="animation: spin 1s linear infinite;"></ion-icon> Saving...';
            btnAddProduct.disabled = true;

            try {
                // Insert into Supabase
                const { data, error } = await supabaseClient
                    .from('products')
                    .insert([
                        { 
                            product_name: name, 
                            category: category, 
                            unit_weight: weight, 
                            base_price: parseFloat(price)
                        }
                    ]);

                if (error) throw error;

                // Success Message
                alert('✅ Product successfully added to the database!');
                
                // Clear Form
                document.getElementById('p_name').value = '';
                document.getElementById('p_weight').value = '';
                document.getElementById('p_price').value = '';

                // Refresh the table
                fetchProducts();

            } catch (err) {
                console.error("Error inserting product:", err);
                alert('❌ Error adding product: ' + (err.message || "Check console for details."));
            } finally {
                // Restore button
                btnAddProduct.innerHTML = originalText;
                btnAddProduct.disabled = false;
            }
        });
    }
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabaseForms);
} else {
    initSupabaseForms();
}
