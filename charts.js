// ==================== CHART INSTANCES ====================

let categoryChart;
let monthlyChart;


// ==================== UPDATE CHARTS ====================

function updateCharts(data) {

    // ==================== EXPENSES BY CATEGORY ====================

    const byCategory = {};

    const expenses = data.filter(
        (transaction) => transaction.type === "expense"
    );


    expenses.forEach((transaction) => {

        const category = transaction.category;

        byCategory[category] =
            (byCategory[category] || 0) +
            transaction.amount;

    });


    // Destroy previous category chart
    // before creating a new one.

    if (categoryChart) {
        categoryChart.destroy();
    }


    categoryChart = new Chart(
        document.getElementById("categoryChart"),
        {
            type: "doughnut",

            data: {
                labels: Object.keys(byCategory),

                datasets: [
                    {
                        data: Object.values(byCategory)
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        }
    );


    // ==================== MONTHLY ANALYSIS ====================

    const months = {};


    data.forEach((transaction) => {

        const month = transaction.date.slice(0, 7);


        // Create month entry if it doesn't exist
        if (!months[month]) {

            months[month] = {
                income: 0,
                expense: 0
            };

        }


        // Add transaction amount
        months[month][transaction.type] +=
            transaction.amount;

    });


    // Sort months chronologically
    const labels = Object.keys(months).sort();


    // ==================== INCOME VS EXPENSE CHART ====================

    // Destroy previous monthly chart
    // before creating a new one.

    if (monthlyChart) {
        monthlyChart.destroy();
    }


    monthlyChart = new Chart(
        document.getElementById("monthlyChart"),
        {
            type: "bar",

            data: {
                labels: labels,

                datasets: [
                    {
                        label: "Income",

                        data: labels.map(
                            (month) => months[month].income
                        )
                    },

                    {
                        label: "Expense",

                        data: labels.map(
                            (month) => months[month].expense
                        )
                    }
                ]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}
