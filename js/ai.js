/* ── AI MODULE — Anthropic Claude API ── */
/* TODO: replace with secure server-side proxy in production */

let aiData = null;
let aiLoading = false;

/* Get API key from localStorage or prompt */
function getApiKey() {
  let key = localStorage.getItem('smc_claude_key');
  if (!key) {
    key = prompt('Enter your Anthropic API key to enable AI predictions:\n(It will be saved in localStorage — use a proxy in production)');
    if (key) localStorage.setItem('smc_claude_key', key.trim());
  }
  return key ? key.trim() : null;
}

async function fetchAiAnalysis() {
  if (aiLoading) return;
  const key = getApiKey();
  if (!key) {
    renderAiError('No API key provided. Click "Refresh AI Analysis" to try again.');
    return;
  }

  aiLoading = true;
  renderAiSkeleton();
  updateRefreshBtn(true);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: AI_SYSTEM,
        messages: [{ role: 'user', content: AI_CONTEXT }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const json = await res.json();
    const text = json.content?.[0]?.text || '';

    /* Extract JSON from response */
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse JSON from AI response');
    aiData = JSON.parse(match[0]);
    renderAiResults(aiData);

  } catch (e) {
    console.error('AI Error:', e);
    renderAiError(e.message || 'Failed to fetch AI analysis.');
  } finally {
    aiLoading = false;
    updateRefreshBtn(false);
  }
}

function updateRefreshBtn(loading) {
  const btn = document.getElementById('refreshAiBtn');
  if (!btn) return;
  const spin = btn.querySelector('.spin');
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
    spin.innerHTML = '<ion-icon name="refresh-outline" class="spinning"></ion-icon>';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    spin.innerHTML = '<ion-icon name="refresh-outline"></ion-icon>';
  }
}

function renderAiSkeleton() {
  const panels = ['aiDemand','aiRevenue','aiRisk','aiStock','aiInsight'];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = skeletonHTML(4);
  });
}

function skeletonHTML(lines = 3) {
  return Array.from({length: lines}, (_, i) =>
    `<div class="skeleton skeleton-line" style="width:${i===lines-1?'60%':'100%'}"></div>`
  ).join('');
}

function renderAiError(msg) {
  const panels = ['aiDemand','aiRevenue','aiRisk','aiStock','aiInsight'];
  const html = `<div class="alert alert-error" style="display:flex;align-items:center;gap:6px"><ion-icon name="warning-outline" style="font-size:16px"></ion-icon> ${msg}</div>`;
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

function renderAiResults(d) {
  renderDemandForecast(d.demand_forecast || []);
  renderRevenuePrediction(d.revenue_prediction || {});
  renderCollectionRisk(d.collection_risk || []);
  renderStockAlert(d.stock_alert || []);
  renderInsight(d.business_insight || '');
}

function trendArrow(t) {
  if (t === 'up')     return '<span style="color:#52c41a"><ion-icon name="trending-up-outline"></ion-icon> Up</span>';
  if (t === 'down')   return '<span style="color:#ff4d4f"><ion-icon name="trending-down-outline"></ion-icon> Down</span>';
  return '<span style="color:#fa8c16"><ion-icon name="remove-outline"></ion-icon> Stable</span>';
}

function renderDemandForecast(items) {
  const el = document.getElementById('aiDemand');
  if (!el) return;
  if (!items.length) { el.innerHTML = '<p style="color:#94a3b8;font-size:13px;">No data.</p>'; return; }
  el.innerHTML = `
    <table class="demand-table" style="width:100%">
      <thead><tr style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.4px">
        <th style="padding:6px 12px;text-align:left">Product</th>
        <th style="padding:6px 12px;text-align:right">Next Week</th>
        <th style="padding:6px 12px;text-align:center">Trend</th>
        <th style="padding:6px 12px;text-align:left">Confidence</th>
      </tr></thead>
      <tbody>${items.map(r => `
        <tr>
          <td>${r.product}</td>
          <td style="text-align:right;font-weight:600">${r.next_week_units}</td>
          <td style="text-align:center">${trendArrow(r.trend)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="confidence-bar"><div class="confidence-fill" style="width:${r.confidence}%"></div></div>
              <span style="font-size:12px;color:#64748b">${r.confidence}%</span>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderRevenuePrediction(p) {
  const el = document.getElementById('aiRevenue');
  if (!el) return;
  const fmt = v => '₹' + (v >= 100000 ? (v/100000).toFixed(1) + 'L' : (v/1000).toFixed(0) + 'k');
  el.innerHTML = `
    <div class="ai-stat-big">${fmt(p.next_month || 0)}</div>
    <div class="ai-stat-sub">Predicted next month revenue</div>
    <div style="margin-top:10px">
      <span class="tag ${(p.growth_percent||0) >= 0 ? 'tag-success' : 'tag-danger'}">
        ${(p.growth_percent||0) >= 0 ? '▲' : '▼'} ${Math.abs(p.growth_percent||0)}% growth
      </span>
    </div>
    <div class="ai-reasoning" style="margin-top:14px">
      <span class="ai-reasoning-icon"><ion-icon name="bulb-outline"></ion-icon></span>
      <span>${p.reasoning || ''}</span>
    </div>`;
}

function renderCollectionRisk(items) {
  const el = document.getElementById('aiRisk');
  if (!el) return;
  const tagClass = { high:'tag-danger', medium:'tag-warning', low:'tag-success' };
  el.innerHTML = `<div class="risk-list">${items.map(r => `
    <div class="risk-item">
      <div class="risk-info">
        <div class="risk-name" style="display:flex;align-items:center;gap:4px"><ion-icon name="storefront-outline"></ion-icon> ${r.vendor}</div>
        <div class="risk-reason">${r.reason}</div>
      </div>
      <span class="tag ${tagClass[r.risk] || 'tag-info'}">${r.risk?.toUpperCase()}</span>
    </div>`).join('')}
  </div>`;
}

function renderStockAlert(items) {
  const el = document.getElementById('aiStock');
  if (!el) return;
  const dotColor = d => d <= 3 ? '#ff4d4f' : d <= 7 ? '#fa8c16' : '#52c41a';
  el.innerHTML = `<div class="timeline">${items.map((s, i) => `
    <div class="timeline-item">
      <div class="timeline-dot" style="background:${dotColor(s.days_remaining)};color:#fff">${i+1}</div>
      <div class="timeline-content">
        <div class="timeline-title">${s.product}</div>
        <div class="timeline-desc">~${s.days_remaining} days remaining</div>
        <div class="timeline-action">→ ${s.action}</div>
      </div>
    </div>`).join('')}
  </div>`;
}

function renderInsight(text) {
  const el = document.getElementById('aiInsight');
  if (!el) return;
  el.innerHTML = `
    <div class="insight-card-body">
      <div class="insight-icon" style="color:var(--primary)"><ion-icon name="hardware-chip-outline"></ion-icon></div>
      <div style="font-weight:600;font-size:15px;margin-bottom:8px">Optimization Suggestion</div>
      <p>${text}</p>
    </div>
    <div class="insight-footer">
      <span class="ai-badge"><ion-icon name="sparkles"></ion-icon> Generated by Claude AI</span>
      <span style="margin-left:auto;font-size:11px">${new Date().toLocaleTimeString('en-IN')}</span>
    </div>`;
}
