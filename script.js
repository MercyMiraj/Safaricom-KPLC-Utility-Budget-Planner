// Data State
let tokenData = JSON.parse(localStorage.getItem('kplc_token_data')) || null;
let utilities = JSON.parse(localStorage.getItem('household_utilities')) || [];

// DOM Elements
const currentDateEl = document.getElementById('current-date');
const tokenForm = document.getElementById('token-form');
const utilityForm = document.getElementById('utility-form');
const utilityBody = document.getElementById('utility-body');
const resetBtn = document.getElementById('reset-utility-btn');

// Stats Elements
const statUnits = document.getElementById('stat-units');
const statBurn = document.getElementById('stat-burn');
const statDays = document.getElementById('stat-days');
const statUtilities = document.getElementById('stat-utilities');

currentDateEl.textContent = new Date().toLocaleDateString('en-KE', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
});

// Set Today as default date for inputs
document.getElementById('purchase-date').valueAsDate = new Date();
document.getElementById('util-due').valueAsDate = new Date();

// Handle Token Purchase Logging
tokenForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  tokenData = {
    date: document.getElementById('purchase-date').value,
    cost: parseFloat(document.getElementById('token-cost').value),
    units: parseFloat(document.getElementById('token-units').value),
    dailyAvg: parseFloat(document.getElementById('daily-avg').value)
  };

  saveAndRender();
});

// Handle Adding Utility Bill
utilityForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newUtil = {
    id: Date.now(),
    name: document.getElementById('util-name').value,
    category: document.getElementById('util-category').value,
    cost: parseFloat(document.getElementById('util-cost').value),
    due: document.getElementById('util-due').value
  };

  utilities.push(newUtil);
  saveAndRender();
  utilityForm.reset();
  document.getElementById('util-due').valueAsDate = new Date();
});

// Render Function
function render() {
  // 1. Calculate KPLC Token Projections
  if (tokenData) {
    document.getElementById('purchase-date').value = tokenData.date;
    document.getElementById('token-cost').value = tokenData.cost;
    document.getElementById('token-units').value = tokenData.units;
    document.getElementById('daily-avg').value = tokenData.dailyAvg;

    const purchaseDate = new Date(tokenData.date);
    const today = new Date();
    purchaseDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const daysElapsed = Math.max(0, Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24)));
    const unitsUsed = daysElapsed * tokenData.dailyAvg;
    const remainingUnits = Math.max(0, tokenData.units - unitsUsed);
    const estDaysLeft = tokenData.dailyAvg > 0 ? Math.floor(remainingUnits / tokenData.dailyAvg) : 0;

    statUnits.textContent = `${remainingUnits.toFixed(1)} kWh`;
    statBurn.textContent = `${tokenData.dailyAvg.toFixed(1)} kWh / day`;
    statDays.textContent = `${estDaysLeft} Day${estDaysLeft !== 1 ? 's' : ''}`;
  } else {
    statUnits.textContent = "0.0 kWh";
    statBurn.textContent = "0.0 kWh / day";
    statDays.textContent = "-- Days";
  }

  // 2. Render Utility Table & Monthly Total
  utilityBody.innerHTML = '';
  let totalUtilCost = tokenData ? tokenData.cost : 0;

  if (utilities.length === 0) {
    utilityBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No monthly utilities logged yet.</td></tr>`;
  }

  utilities.forEach(util => {
    totalUtilCost += util.cost;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${util.name}</strong></td>
      <td><span class="badge">${util.category}</span></td>
      <td>${util.due}</td>
      <td class="gold-text">KES ${util.cost.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
      <td><button onclick="deleteUtil(${util.id})" class="btn-danger"><i class="fa-solid fa-trash"></i></button></td>
    `;
    utilityBody.appendChild(tr);
  });

  statUtilities.textContent = `KES ${totalUtilCost.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

// Delete Single Utility Item
function deleteUtil(id) {
  utilities = utilities.filter(u => u.id !== id);
  saveAndRender();
}

// Reset All Data
resetBtn.addEventListener('click', () => {
  if (confirm("Reset all token readings and saved utility bills?")) {
    tokenData = null;
    utilities = [];
    localStorage.removeItem('kplc_token_data');
    localStorage.removeItem('household_utilities');
    tokenForm.reset();
    document.getElementById('purchase-date').valueAsDate = new Date();
    render();
  }
});

// Save to LocalStorage and Render
function saveAndRender() {
  if (tokenData) {
    localStorage.setItem('kplc_token_data', JSON.stringify(tokenData));
  }
  localStorage.setItem('household_utilities', JSON.stringify(utilities));
  render();
}

// Initial Run
render();
