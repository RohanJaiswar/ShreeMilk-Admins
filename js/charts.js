/* ── CHARTS MODULE (Chart.js) ── */

function initCharts() {
  initRevenueChart();
  initOrderChart();
  initDonutChart();
}

/* ── Revenue vs Collection Bar Chart ── */
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.months,
      datasets: [
        {
          label: 'Revenue',
          data: DATA.revenue,
          backgroundColor: 'rgba(22, 119, 255, 0.82)',
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Collected',
          data: DATA.collection,
          backgroundColor: 'rgba(82, 196, 26, 0.82)',
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ' ₹' + (ctx.raw / 1000).toFixed(0) + 'k',
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          grid: { color: '#f0f2f5' },
          ticks: {
            font: { size: 11 },
            callback: v => '₹' + (v / 1000) + 'k',
          },
        },
      },
    },
  });
}

/* ── Order Volume Line Chart ── */
function initOrderChart() {
  const avg = Math.round(DATA.orders.reduce((a, b) => a + b, 0) / DATA.orders.length);
  const ctx = document.getElementById('orderChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: DATA.months,
      datasets: [
        {
          label: 'Orders',
          data: DATA.orders,
          borderColor: '#1677ff',
          backgroundColor: 'rgba(22,119,255,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#1677ff',
          borderWidth: 2,
        },
        {
          label: '6-Month Avg',
          data: DATA.months.map(() => avg),
          borderColor: '#fa8c16',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, padding: 12 },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { grid: { color: '#f0f2f5' }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

/* ── Product Sales Donut Chart ── */
function initDonutChart() {
  const ctx = document.getElementById('donutChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: DATA.donut.map(d => d.label),
      datasets: [{
        data: DATA.donut.map(d => d.pct),
        backgroundColor: DATA.donut.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 10 },
            padding: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.label + ': ' + ctx.raw + '%',
          },
        },
      },
    },
  });
}

/* ── SVG Progress Circle ── */
function renderProgressCircle(delivered, total) {
  const pct = delivered / total;
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return `
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle class="progress-track" cx="${cx}" cy="${cy}" r="${r}" />
      <circle class="progress-fill svg-progress" cx="${cx}" cy="${cy}" r="${r}"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
        style="transform-origin:center; transform:rotate(-90deg); fill:none; stroke:#1677ff; stroke-width:10; stroke-linecap:round;" />
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="18" font-weight="700" fill="#1677ff" font-family="Inter,sans-serif">${delivered}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="#94a3b8" font-family="Inter,sans-serif">of ${total}</text>
      <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="11" fill="#52c41a" font-weight="600" font-family="Inter,sans-serif">${Math.round(pct*100)}%</text>
    </svg>
  `;
}
