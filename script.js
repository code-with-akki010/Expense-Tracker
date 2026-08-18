// ==================== DOM HELPER ====================

const $ = (id) => document.getElementById(id);


// ==================== APPLICATION STATE ====================

let transactions = JSON.parse(
    localStorage.getItem("expenseTrackerTransactions") || "[]"
);

let editingId = null;


// ==================== INITIAL SETUP ====================

$("date").value = new Date().toISOString().split("T")[0];


// ==================== UTILITY FUNCTIONS ====================

/**
 * Format a number as Indian Rupee currency.
 */
const money = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
};


/**
 * Save transactions to LocalStorage.
 */
const save = () => {
    localStorage.setItem(
        "expenseTrackerTransactions",
        JSON.stringify(transactions)
    );
};


/**
 * Escape HTML characters to prevent HTML injection.
 */
function safe(value) {
    return value.replace(
        /[&<>"']/g,
        (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character])
    );
}


// ==================== RENDER TRANSACTIONS ====================

function render() {

    // Calculate total income
    const income = transactions
        .filter((transaction) => transaction.type === "income")
        .reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );


    // Calculate total expenses
    const expense = transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );


    // Update dashboard summary
    $("balance").textContent = money(income - expense);
    $("income").textContent = money(income);
    $("expense").textContent = money(expense);
    $("count").textContent = transactions.length;


    // ==================== FILTERS ====================

    const query = $("search").value.toLowerCase();

    const filterType = $("filterType").value;

    const filterCategory = $("filterCategory").value;


    // Filter and sort transactions
    const rows = transactions
        .filter((transaction) => {

            const matchesSearch =
                transaction.title
                    .toLowerCase()
                    .includes(query) ||
                transaction.category
                    .toLowerCase()
                    .includes(query);

            const matchesType =
                filterType === "all" ||
                transaction.type === filterType;

            const matchesCategory =
                filterCategory === "all" ||
                transaction.category === filterCategory;

            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );
        })
        .sort((a, b) => b.date.localeCompare(a.date));


    // ==================== DISPLAY TRANSACTIONS ====================

    if (rows.length === 0) {

        $("list").innerHTML =
            '<p class="empty">No matching transactions.</p>';

    } else {

        $("list").innerHTML = rows
            .map((transaction) => {

                return `
                    <div class="transaction">

                        <div>
                            <h3>
                                ${safe(transaction.title)}
                            </h3>

                            <p class="meta">
                                ${safe(transaction.category)}
                                •
                                ${transaction.date}
                            </p>
                        </div>


                        <div class="right">

                            <div class="amount ${transaction.type}">
                                ${
                                    transaction.type === "income"
                                        ? "+"
                                        : "-"
                                }${money(transaction.amount)}
                            </div>


                            <div class="actions">

                                <button
                                    class="edit"
                                    onclick="editTx('${transaction.id}')"
                                >
                                    Edit
                                </button>

                                <button
                                    class="delete"
                                    onclick="deleteTx('${transaction.id}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");
    }


    // Update charts
    updateCharts(transactions);
}


// ==================== ADD / UPDATE TRANSACTION ====================

$("form").addEventListener("submit", (event) => {

    event.preventDefault();


    const transaction = {

        id: editingId || crypto.randomUUID(),

        title: $("title").value.trim(),

        amount: Number($("amount").value),

        type: $("type").value,

        category: $("category").value,

        date: $("date").value
    };


    // Update existing transaction
    if (editingId) {

        transactions = transactions.map((transactionItem) =>
            transactionItem.id === editingId
                ? transaction
                : transactionItem
        );

    }

    // Add new transaction
    else {

        transactions = [
            ...transactions,
            transaction
        ];
    }


    // Reset editing state
    editingId = null;


    // Save data
    save();


    // Reset form
    event.target.reset();

    $("date").value =
        new Date().toISOString().split("T")[0];


    // Reset button text
    event.target.querySelector(".primary").textContent =
        "Add Transaction";


    // Update UI
    render();
});


// ==================== EDIT TRANSACTION ====================

window.editTx = (id) => {

    const transaction = transactions.find(
        (item) => item.id === id
    );


    if (!transaction) {
        return;
    }


    editingId = id;


    // Populate form
    $("title").value = transaction.title;

    $("amount").value = transaction.amount;

    $("type").value = transaction.type;

    $("category").value = transaction.category;

    $("date").value = transaction.date;


    // Change button text
    $("form").querySelector(".primary").textContent =
        "Update Transaction";


    // Focus title field
    $("title").focus();
};


// ==================== DELETE TRANSACTION ====================

window.deleteTx = (id) => {

    transactions = transactions.filter(
        (transaction) => transaction.id !== id
    );


    save();

    render();
};


// ==================== CLEAR ALL TRANSACTIONS ====================

$("clearAllBtn").onclick = () => {

    if (
        transactions.length &&
        confirm("Delete all transactions?")
    ) {

        transactions = [];

        save();

        render();
    }
};


// ==================== SEARCH & FILTER ====================

[
    "search",
    "filterType",
    "filterCategory"
].forEach((id) => {

    $(id).addEventListener("input", render);

});


// ==================== INITIAL RENDER ====================

render();
