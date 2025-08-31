document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense-form");
  const itemInput = document.getElementById("item");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const expenseList = document.getElementById("expense-list");
  const yearlyBreakdown = document.getElementById("yearly-breakdown");

  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  let monthlyPieChart, monthlyBarChart, monthlyLineChart;
  let yearlyPieChart, yearlyBarChart, yearlyLineChart;
  let categoryPieChart, categoryBarChart;

  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function renderExpenses() {
    expenseList.innerHTML = "";
    expenses.forEach((exp, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${exp.item} - ${exp.amount} BDT (${exp.date}) [${exp.category}]
        <button onclick="deleteExpense(${index})">Delete</button>`;
      expenseList.appendChild(li);
    });
    renderYearlyBreakdown();
    renderCharts();
  }

  window.deleteExpense = function(index) {
    expenses.splice(index, 1);
    saveExpenses();
    renderExpenses();
  };

  function renderYearlyBreakdown() {
    yearlyBreakdown.innerHTML = "";
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const yearData = {};
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const year = expDate.getFullYear();
      if (!yearData[year]) yearData[year] = [];
      yearData[year].push(exp);
    });

    for (let y = 2013; y <= 2050; y++) {
      const yearExpenses = yearData[y] || [];
      if (yearExpenses.length === 0) continue;

      const yearDiv = document.createElement("div");
      yearDiv.innerHTML = `<h2>Year: ${y}</h2>`;

      months.forEach((month, i) => {
        const monthExp = yearExpenses.filter(exp => new Date(exp.date).getMonth() === i);
        if (monthExp.length === 0) return;

        let monthTotal = monthExp.reduce((sum, e) => sum + e.amount, 0);

        let table = `<table class="year-table">
          <tr class="month-title"><th colspan="4">${month} - Total: ${monthTotal} BDT</th></tr>
          <tr><th>Item</th><th>Amount</th><th>Date</th><th>Category</th></tr>`;

        monthExp.forEach(e => {
          table += `<tr><td>${e.item}</td><td>${e.amount}</td><td>${e.date}</td><td>${e.category}</td></tr>`;
        });

        table += `</table>`;
        yearDiv.innerHTML += table;
      });

      let yearlyTotal = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
      yearDiv.innerHTML += `<p><strong>Total for ${y}: ${yearlyTotal} BDT</strong></p>`;

      yearlyBreakdown.appendChild(yearDiv);
    }
  }

  function renderCharts() {
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const currentYear = new Date().getFullYear();

    const monthlyData = new Array(12).fill(0);
    const yearlyData = {};
    const categoryData = {};

    expenses.forEach(exp => {
      const d = new Date(exp.date);
      if(d.getFullYear() === currentYear) monthlyData[d.getMonth()] += exp.amount;
      const y = d.getFullYear();
      if(!yearlyData[y]) yearlyData[y] = 0;
      yearlyData[y] += exp.amount;
      if(!categoryData[exp.category]) categoryData[exp.category] = 0;
      categoryData[exp.category] += exp.amount;
    });

    const colors = [
      "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40",
      "#C9CBCF","#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#8BC34A"
    ];

    // Monthly Charts
    if(monthlyPieChart) monthlyPieChart.destroy();
    monthlyPieChart = new Chart(document.getElementById("monthlyPieChart"), {
      type: "pie",
      data: { labels: months, datasets:[{data: monthlyData, backgroundColor: colors}] },
      options:{responsive:true, plugins:{legend:{position:'bottom'}}}
    });

    if(monthlyBarChart) monthlyBarChart.destroy();
    monthlyBarChart = new Chart(document.getElementById("monthlyBarChart"), {
      type:"bar",
      data:{ labels: months, datasets:[{label:`${currentYear} Expenses`, data: monthlyData, backgroundColor: colors}] },
      options:{ responsive:true, scales:{y:{beginAtZero:true}} }
    });

    if(monthlyLineChart) monthlyLineChart.destroy();
    monthlyLineChart = new Chart(document.getElementById("monthlyLineChart"), {
      type:"line",
      data:{ labels: months, datasets:[{label:`${currentYear} Trend`, data: monthlyData, borderColor:"#FF6384", fill:false}] },
      options:{ responsive:true, scales:{y:{beginAtZero:true}} }
    });

    // Yearly Charts
    const yearLabels = Object.keys(yearlyData);
    const yearValues = Object.values(yearlyData);

    if(yearlyPieChart) yearlyPieChart.destroy();
    yearlyPieChart = new Chart(document.getElementById("yearlyPieChart"), {
      type:"pie",
      data:{ labels: yearLabels, datasets:[{data: yearValues, backgroundColor: colors}] },
      options:{ responsive:true, plugins:{legend:{position:'bottom'}} }
    });

    if(yearlyBarChart) yearlyBarChart.destroy();
    yearlyBarChart = new Chart(document.getElementById("yearlyBarChart"), {
      type:"bar",
      data:{ labels: yearLabels, datasets:[{label:"Yearly Expenses", data: yearValues, backgroundColor: colors}] },
      options:{ responsive:true, scales:{y:{beginAtZero:true}} }
    });

    if(yearlyLineChart) yearlyLineChart.destroy();
    yearlyLineChart = new Chart(document.getElementById("yearlyLineChart"), {
      type:"line",
      data:{ labels: yearLabels, datasets:[{label:"Yearly Trend", data: yearValues, borderColor:"#36A2EB", fill:false}] },
      options:{ responsive:true, scales:{y:{beginAtZero:true}} }
    });

    // Category-wise Charts
    const catLabels = Object.keys(categoryData);
    const catValues = Object.values(categoryData);

    if(categoryPieChart) categoryPieChart.destroy();
    categoryPieChart = new Chart(document.getElementById("categoryPieChart"), {
      type:"pie",
      data:{ labels: catLabels, datasets:[{data: catValues, backgroundColor: colors}] },
      options:{ responsive:true, plugins:{legend:{position:'bottom'}} }
    });

    if(categoryBarChart) categoryBarChart.destroy();
    categoryBarChart = new Chart(document.getElementById("categoryBarChart"), {
      type:"bar",
      data:{ labels: catLabels, datasets:[{label:"Category Expenses", data: catValues, backgroundColor: colors}] },
      options:{ responsive:true, scales:{y:{beginAtZero:true}} }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const expense = {
      item: itemInput.value,
      amount: parseFloat(amountInput.value),
      date: dateInput.value,
      category: categoryInput.value
    };
    expenses.push(expense);
    saveExpenses();
    renderExpenses();
    form.reset();
  });

  renderExpenses();
});