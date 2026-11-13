/* ============================================================
   Expense & Budget Visualizer — app logic
   Vanilla JS, single file. Data persisted to localStorage.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- Constants ---------------- */
  const STORAGE_KEY = 'ebv_data_v1';
  const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];
  const PALETTE = [
    '#4f8cff', '#ff6b6b', '#3bc9a3', '#ffb454',
    '#9b7bff', '#22c1c3', '#ff7eb3', '#a8e063',
    '#f9c74f', '#577590', '#f94144', '#90be6d'
  ];

  /* ---------------- State ---------------- */
  let transactions = [];
  let categories = DEFAULT_CATEGORIES.slice();
  let budgetLimit = 0;
  let theme = 'light';
  let sortBy = 'date-desc';
  let selectedMonth = 'all';

  let chart = null;

  /* ---------------- DOM cache ---------------- */
  const dom = {};
  function cacheDom() {
    [
      'themeToggle', 'balance', 'budgetLimit', 'budgetStatus',
      'expenseForm', 'itemName', 'amount', 'category', 'customCategory',
      'addCategoryBtn', 'formError', 'categoryChart', 'chartEmpty',
      'monthSelect', 'sortBy', 'summaryCard', 'summaryTitle', 'summaryTotal',
      'summaryBreakdown', 'budgetProgressBar', 'budgetProgressLabel',
      'transactionList', 'emptyState'
    ].forEach(function (id) { dom[id] = document.getElementById(id); });
  }

  /* ---------------- Persistence ---------------- */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      transactions = Array.isArray(data.transactions) ? data.transactions : [];
      categories = Array.isArray(data.categories) && data.categories.length
        ? data.categories : DEFAULT_CATEGORIES.slice();
      budgetLimit = typeof data.budgetLimit === 'number' && isFinite(data.budgetLimit)
        ? data.budgetLimit : 0;
      theme = data.theme === 'dark' ? 'dark' : 'light';
    } catch (e) {
      console.warn('Could not load saved data:', e);
      categories = DEFAULT_CATEGORIES.slice();
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        transactions: transactions,
        categories: categories,
        budgetLimit: budgetLimit,
        theme: theme
      }));
    } catch (e) {
      console.warn('Could not save data:', e);
    }
  }

  /* ---------------- Helpers ---------------- */
  const moneyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function formatMoney(n) { return moneyFmt.format(Number(n) || 0); }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function categoryColor(cat) {
    const idx = categories.indexOf(cat);
    return PALETTE[(idx < 0 ? 0 : idx) % PALETTE.length];
  }

  function monthKey(dateStr) {
    const d = new Date(dateStr);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function monthLabel(key) {
    if (key === 'all') return 'All Months';
    const parts = key.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function filteredTransactions() {
    if (selectedMonth === 'all') return transactions.slice();
    return transactions.filter(function (t) { return monthKey(t.date) === selectedMonth; });
  }

  function sortedTransactions(list) {
    const arr = list.slice();
    switch (sortBy) {
      case 'date-asc': arr.sort(function (a, b) { return new Date(a.date) - new Date(b.date); }); break;
      case 'date-desc': arr.sort(function (a, b) { return new Date(b.date) - new Date(a.date); }); break;
      case 'amount-asc': arr.sort(function (a, b) { return a.amount - b.amount; }); break;
      case 'amount-desc': arr.sort(function (a, b) { return b.amount - a.amount; }); break;
      case 'category-asc': arr.sort(function (a, b) { return a.category.localeCompare(b.category); }); break;
      case 'category-desc': arr.sort(function (a, b) { return b.category.localeCompare(a.category); }); break;
    }
    return arr;
  }

  function totalsByCategory(list) {
    const map = {};
    list.forEach(function (t) { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }

  function sum(list) {
    return list.reduce(function (s, t) { return s + t.amount; }, 0);
  }

  /* ---------------- Theme ---------------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = dom.themeToggle.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /* ---------------- Renderers ---------------- */
  function renderCategorySelect() {
    const sel = dom.category;
    const current = sel.value;
    sel.innerHTML = '<option value="" disabled selected>Select a category</option>' +
      categories.map(function (c) {
        return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + '</option>';
      }).join('');
    if (categories.indexOf(current) !== -1) sel.value = current;
  }

  function renderMonthOptions() {
    const keys = {};
    transactions.forEach(function (t) { keys[monthKey(t.date)] = true; });
    const sortedKeys = Object.keys(keys).sort().reverse();
    if (selectedMonth !== 'all' && sortedKeys.indexOf(selectedMonth) === -1) {
      selectedMonth = 'all';
    }
    dom.monthSelect.innerHTML = '<option value="all">All Months</option>' +
      sortedKeys.map(function (k) {
        return '<option value="' + k + '">' + escapeHtml(monthLabel(k)) + '</option>';
      }).join('');
    dom.monthSelect.value = selectedMonth;
  }

  function renderBalance() {
    dom.balance.textContent = formatMoney(sum(transactions));
  }

  function renderList() {
    const list = sortedTransactions(filteredTransactions());
    dom.transactionList.innerHTML = '';
    if (list.length === 0) {
      dom.emptyState.hidden = false;
      dom.transactionList.hidden = true;
      return;
    }
    dom.emptyState.hidden = true;
    dom.transactionList.hidden = false;

    const frag = document.createDocumentFragment();
    list.forEach(function (t) {
      const li = document.createElement('li');
      li.className = 'transaction';
      const color = categoryColor(t.category);
      const dateLabel = new Date(t.date).toLocaleDateString('en-US',
        { month: 'short', day: 'numeric', year: 'numeric' });
      li.innerHTML =
        '<div class="t-info">' +
          '<span class="t-name">' + escapeHtml(t.name) + '</span>' +
          '<span class="t-meta">' +
            '<span class="t-badge" style="background:' + color + '">' + escapeHtml(t.category) + '</span>' +
            '<span class="t-date">' + dateLabel + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="t-right">' +
          '<span class="t-amount">' + formatMoney(t.amount) + '</span>' +
          '<button class="delete-btn" data-id="' + escapeHtml(t.id) + '" type="button" aria-label="Delete ' + escapeHtml(t.name) + '">\u2715</button>' +
        '</div>';
      frag.appendChild(li);
    });
    dom.transactionList.appendChild(frag);
  }

  function renderChart() {
    if (typeof Chart === 'undefined') {
      dom.chartEmpty.hidden = false;
      dom.chartEmpty.textContent = 'Chart.js failed to load — check your connection and reload.';
      return;
    }
    const list = filteredTransactions();
    const totals = totalsByCategory(list);
    const cats = Object.keys(totals);

    if (cats.length === 0) {
      dom.chartEmpty.hidden = false;
      dom.chartEmpty.textContent = 'No spending data for this view yet.';
      if (chart) { chart.destroy(); chart = null; }
      return;
    }
    dom.chartEmpty.hidden = true;

    const data = cats.map(function (c) { return totals[c]; });
    const colors = cats.map(function (c) { return categoryColor(c); });
    const borderColor = cssVar('--card-bg') || '#ffffff';
    const labelColor = cssVar('--text') || '#1f2a44';

    if (chart) {
      chart.data.labels = cats;
      chart.data.datasets[0].data = data;
      chart.data.datasets[0].backgroundColor = colors;
      chart.data.datasets[0].borderColor = borderColor;
      chart.options.plugins.legend.labels.color = labelColor;
      chart.update();
    } else {
      const ctx = dom.categoryChart.getContext('2d');
      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: cats,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderColor: borderColor,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: labelColor, padding: 12, usePointStyle: true }
            },
            tooltip: {
              callbacks: {
                label: function (ctx) { return ' ' + ctx.label + ': ' + formatMoney(ctx.parsed); }
              }
            }
          }
        }
      });
    }
  }

  function renderSummary() {
    const list = filteredTransactions();
    const total = sum(list);

    dom.summaryTitle.textContent = selectedMonth === 'all'
      ? 'Summary — All Months'
      : 'Summary — ' + monthLabel(selectedMonth);
    dom.summaryTotal.textContent = formatMoney(total);

    // Per-category breakdown
    const totals = totalsByCategory(list);
    const cats = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });
    if (cats.length === 0) {
      dom.summaryBreakdown.innerHTML = '<p class="empty-hint" style="margin:0">No spending recorded.</p>';
    } else {
      dom.summaryBreakdown.innerHTML = cats.map(function (c) {
        const pct = total > 0 ? Math.round((totals[c] / total) * 100) : 0;
        return '<div class="bd-row">' +
          '<span class="bd-dot" style="background:' + categoryColor(c) + '"></span>' +
          '<span class="bd-name">' + escapeHtml(c) + '</span>' +
          '<span class="bd-val">' + formatMoney(totals[c]) + ' <em>' + pct + '%</em></span>' +
        '</div>';
      }).join('');
    }

    // Budget progress + over-limit highlight
    renderBudget(total);
  }

  function renderBudget(total) {
    const limit = budgetLimit;
    if (limit > 0) {
      const pct = Math.min(100, Math.round((total / limit) * 100));
      const over = total >= limit;
      dom.budgetProgressBar.style.width = pct + '%';
      dom.budgetProgressBar.classList.toggle('over', over);
      dom.budgetProgressLabel.textContent = formatMoney(total) + ' of ' + formatMoney(limit) + ' (' + pct + '%)';
      dom.summaryCard.classList.toggle('over-limit', over);
      if (over) {
        dom.budgetStatus.hidden = false;
        dom.budgetStatus.textContent = '⚠ Budget limit exceeded for this view!';
        dom.budgetStatus.className = 'budget-status over';
      } else {
        dom.budgetStatus.hidden = true;
        dom.budgetStatus.className = 'budget-status';
      }
    } else {
      dom.budgetProgressBar.style.width = '0%';
      dom.budgetProgressBar.classList.remove('over');
      dom.budgetProgressLabel.textContent = 'Set a budget limit to track spending.';
      dom.summaryCard.classList.remove('over-limit');
      dom.budgetStatus.hidden = true;
    }
  }

  function renderAll() {
    renderMonthOptions();
    renderBalance();
    renderList();
    renderChart();
    renderSummary();
  }

  /* ---------------- Actions ---------------- */
  function addTransaction(e) {
    e.preventDefault();
    const name = dom.itemName.value.trim();
    const amount = parseFloat(dom.amount.value);
    const category = dom.category.value;

    let error = '';
    if (!name) error = 'Please enter an item name.';
    else if (!isFinite(amount) || amount <= 0) error = 'Please enter a valid amount greater than 0.';
    else if (!category) error = 'Please select a category.';

    if (error) {
      showFormError(error);
      return;
    }
    clearFormError();

    transactions.push({
      id: uid(),
      name: name,
      amount: amount,
      category: category,
      date: new Date().toISOString()
    });
    persist();

    dom.itemName.value = '';
    dom.amount.value = '';
    // keep selected category for quick repeat entries
    dom.itemName.focus();
    renderAll();
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(function (t) { return t.id !== id; });
    persist();
    renderAll();
  }

  function addCustomCategory() {
    const name = dom.customCategory.value.trim();
    if (!name) return;
    const exists = categories.some(function (c) {
      return c.toLowerCase() === name.toLowerCase();
    });
    if (exists) {
      showFormError('That category already exists.');
      window.setTimeout(clearFormError, 2500);
      return;
    }
    categories.push(name);
    persist();
    renderCategorySelect();
    dom.category.value = name;
    dom.customCategory.value = '';
    dom.customCategory.focus();
    clearFormError();
  }

  function showFormError(msg) {
    dom.formError.textContent = msg;
    dom.formError.hidden = false;
  }
  function clearFormError() { dom.formError.hidden = true; }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    persist();
    // Recreate chart so colors (borders, legend) refresh for the new theme
    if (chart) { chart.destroy(); chart = null; }
    renderChart();
  }

  /* ---------------- Events ---------------- */
  function bindEvents() {
    dom.expenseForm.addEventListener('submit', addTransaction);
    dom.addCategoryBtn.addEventListener('click', addCustomCategory);
    dom.customCategory.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); }
    });
    dom.transactionList.addEventListener('click', function (e) {
      const btn = e.target.closest('.delete-btn');
      if (btn) deleteTransaction(btn.getAttribute('data-id'));
    });
    dom.budgetLimit.addEventListener('input', function () {
      const v = parseFloat(dom.budgetLimit.value);
      budgetLimit = isFinite(v) && v >= 0 ? v : 0;
      persist();
      renderSummary();
    });
    dom.monthSelect.addEventListener('change', function () {
      selectedMonth = dom.monthSelect.value;
      renderAll();
    });
    dom.sortBy.addEventListener('change', function () {
      sortBy = dom.sortBy.value;
      renderList();
    });
    dom.themeToggle.addEventListener('click', toggleTheme);
  }

  /* ---------------- Init ---------------- */
  function init() {
    cacheDom();
    loadState();
    applyTheme();
    renderCategorySelect();
    dom.budgetLimit.value = budgetLimit > 0 ? budgetLimit : '';
    bindEvents();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
