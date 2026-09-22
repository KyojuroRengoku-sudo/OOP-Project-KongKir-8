const PRODUCTS = [
    "Whole Chicken",
    "BackBones",
    "Neck",
    "SKT Bones",
    "Skin",
    "Cuttings",
    "Fillet",
    "Liver",
    "Gizzard / B",
    "Atay Baticon",
    "Feet",
    "Heads",
    "Intestine",
    "Crps / Prvn / BTC",
    "Dugo",
    "Fats"
];


const DESTINATIONS = [
    "Main",
    "Aljun",
    "Riche",
    "Undo",
    "Lexzoe's",
    "Clients"
];


const STORAGE_KEY = "meatline_inventory_v2";


const DEFAULT_OPENING = {
    "Whole Chicken": 89.55,
    "BackBones": 107.25,
    "Neck": 80,
    "SKT Bones": 0,
    "Skin": 45.85,
    "Cuttings": 156.3,
    "Fillet": 0,
    "Liver": 36.5,
    "Gizzard / B": 0,
    "Atay Baticon": 2.25,
    "Feet": 82,
    "Heads": 65.5,
    "Intestine": 58,
    "Crps / Prvn / BTC": 0,
    "Dugo": 54,
    "Fats": 0
};


const DEFAULT_COST = {
    "Whole Chicken": 123.5,
    "BackBones": 90,
    "Neck": 70,
    "SKT Bones": 80,
    "Skin": 90,
    "Cuttings": 136.5,
    "Fillet": 250,
    "Liver": 81.7,
    "Gizzard / B": 100,
    "Atay Baticon": 130,
    "Feet": 58.3,
    "Heads": 35,
    "Intestine": 55,
    "Crps / Prvn / BTC": 60,
    "Dugo": 22.3,
    "Fats": 35
};


/* ========================================
   STATE
======================================== */

function getDefaultState() {

    return {
        day: 1,

        opening: {
            ...DEFAULT_OPENING
        },

        unitCost: {
            ...DEFAULT_COST
        },

        stockIn: [],

        distributions: []
    };
}


function loadState() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    if (!saved) {
        return getDefaultState();
    }


    try {

        const savedState =
            JSON.parse(saved);


        savedState.opening = {
            ...DEFAULT_OPENING,
            ...(savedState.opening || {})
        };


        savedState.unitCost = {
            ...DEFAULT_COST,
            ...(savedState.unitCost || {})
        };


        savedState.stockIn =
            savedState.stockIn || [];


        savedState.distributions =
            savedState.distributions || [];


        savedState.day =
            savedState.day || 1;


        return savedState;

    } catch (error) {

        return getDefaultState();
    }
}


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


let state = loadState();


/* ========================================
   INVENTORY CALCULATIONS
======================================== */

function getStockIn(product) {

    return state.stockIn
        .filter(item =>
            item.product === product
        )
        .reduce(
            (total, item) =>
                total + Number(item.quantity),
            0
        );
}


function getDistributed(product) {

    return state.distributions
        .filter(item =>
            item.product === product
        )
        .reduce(
            (total, item) =>
                total + Number(item.quantity),
            0
        );
}


function getRemaining(product) {

    const opening =
        Number(
            state.opening[product] || 0
        );


    return (
        opening +
        getStockIn(product) -
        getDistributed(product)
    );
}


function getUnitCost(product) {

    return Number(
        state.unitCost?.[product] ??
        DEFAULT_COST[product] ??
        0
    );
}


function getStockValue(product) {

    return (
        getRemaining(product) *
        getUnitCost(product)
    );
}


/* ========================================
   TOTALS
======================================== */

function sumOpening() {

    return PRODUCTS.reduce(
        (total, product) =>
            total +
            Number(state.opening[product] || 0),
        0
    );
}


function sumStockIn() {

    return state.stockIn.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );
}


function sumDistributed() {

    return state.distributions.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );
}


function sumRemaining() {

    return PRODUCTS.reduce(
        (total, product) =>
            total + getRemaining(product),
        0
    );
}


function sumStockValue() {

    return PRODUCTS.reduce(
        (total, product) =>
            total + getStockValue(product),
        0
    );
}


/* ========================================
   FORMAT
======================================== */

function formatQty(number) {

    return Number(number).toLocaleString(
        undefined,
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


function formatMoney(number) {

    return Number(number).toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* ========================================
   COMMON PAGE INFORMATION
======================================== */

function loadCommon() {

    const day =
        document.getElementById(
            "sidebarDay"
        );


    if (day) {

        day.textContent =
            "Day " + state.day;
    }


    const date =
        document.getElementById(
            "todayDate"
        );


    if (date) {

        date.textContent =
            new Date().toLocaleDateString(
                "en-PH",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );
    }
}


/* ========================================
   LOW STOCK
======================================== */

function getLowStockProducts() {

    return PRODUCTS.filter(
        product =>
            getRemaining(product) < 10
    );
}


function renderLowStockAlerts() {

    const container =
        document.getElementById(
            "lowStockAlerts"
        );


    if (!container) {
        return;
    }


    const lowProducts =
        getLowStockProducts();


    if (lowProducts.length === 0) {

        container.innerHTML = `
            <div class="empty-side">
                No low stock items.
            </div>
        `;

        return;
    }


    container.innerHTML =
        lowProducts
        .slice(0, 5)
        .map(product => `

            <div class="alert-item">

                <div class="alert-dot">
                    !
                </div>

                <div>

                    <strong>
                        ${product}
                    </strong>

                    <small>
                        ${formatQty(
                            getRemaining(product)
                        )} kg remaining
                    </small>

                </div>

            </div>

        `)
        .join("");
}


/* ========================================
   RECENT ACTIVITY
======================================== */

function renderRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );


    if (!container) {
        return;
    }


    const stockActivity =
        state.stockIn.map(item => ({

            type: "Stock In",

            text:
                `${formatQty(item.quantity)} kg ${item.product}`,

            detail:
                item.supplier ||
                "Stock received",

            date:
                item.date || ""
        }));


    const distributionActivity =
        state.distributions.map(item => ({

            type: "Distribution",

            text:
                `${formatQty(item.quantity)} kg ${item.product}`,

            detail:
                item.destination,

            date:
                item.date || ""
        }));


    const activities = [
        ...stockActivity,
        ...distributionActivity
    ]
    .sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    )
    .slice(0, 4);


    if (activities.length === 0) {

        container.innerHTML = `
            <div class="empty-side">
                No activity recorded today.
            </div>
        `;

        return;
    }


    container.innerHTML =
        activities.map(item => `

            <div class="activity-item">

                <div class="activity-dot">

                    ${
                        item.type === "Stock In"
                            ? "↓"
                            : "→"
                    }

                </div>

                <div>

                    <strong>
                        ${item.type}: ${item.text}
                    </strong>

                    <small>
                        ${item.detail}
                    </small>

                </div>

            </div>

        `)
        .join("");
}


/* ========================================
   INVENTORY SEARCH
======================================== */

function setupInventorySearch() {

    const search =
        document.getElementById(
            "inventorySearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            const term =
                this.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    "#inventoryBody tr"
                )
                .forEach(row => {

                    const text =
                        row.textContent
                            .toLowerCase();


                    row.style.display =
                        text.includes(term)
                            ? ""
                            : "none";
                });
        }
    );
}


/* ========================================
   DASHBOARD
======================================== */

function loadDashboard() {

    loadCommon();


    document.getElementById(
        "openingTotal"
    ).textContent =
        formatQty(
            sumOpening()
        ) + " kg";


    document.getElementById(
        "stockInTotal"
    ).textContent =
        formatQty(
            sumStockIn()
        ) + " kg";


    document.getElementById(
        "distributedTotal"
    ).textContent =
        formatQty(
            sumDistributed()
        ) + " kg";


    document.getElementById(
        "stockValueTotal"
    ).textContent =
        "₱" +
        formatMoney(
            sumStockValue()
        );


    const body =
        document.getElementById(
            "inventoryBody"
        );


    body.innerHTML =
        PRODUCTS.map(product => {

            const opening =
                Number(
                    state.opening[product] || 0
                );


            const stockIn =
                getStockIn(product);


            const distributed =
                getDistributed(product);


            const remaining =
                getRemaining(product);


            const low =
                remaining < 10;


            return `

                <tr>

                    <td>
                        <strong>
                            ${product}
                        </strong>
                    </td>

                    <td>
                        ${formatQty(opening)}
                    </td>

                    <td>
                        ${formatQty(stockIn)}
                    </td>

                    <td>
                        ${formatQty(distributed)}
                    </td>

                    <td class="qty">

                        ${formatQty(
                            remaining
                        )} kg

                    </td>

                    <td>

                        <span class="
                            status
                            ${low ? "low" : "good"}
                        ">

                            ${
                                low
                                    ? "Low Stock"
                                    : "Good"
                            }

                        </span>

                    </td>

                </tr>

            `;

        })
        .join("");


    renderRecentActivity();

    renderLowStockAlerts();

    setupInventorySearch();


    document.getElementById(
        "closeDayBtn"
    ).addEventListener(
        "click",
        closeDay
    );
}


/* ========================================
   CLOSE DAY
======================================== */

function closeDay() {

    const confirmation =
        confirm(
            "Close today's inventory and carry the remaining stock to the next day?"
        );


    if (!confirmation) {
        return;
    }


    PRODUCTS.forEach(product => {

        state.opening[product] =
            getRemaining(product);
    });


    state.stockIn = [];

    state.distributions = [];

    state.day++;


    saveState();

    loadDashboard();
}


/* ========================================
   STOCK IN PAGE
======================================== */

function loadStockInPage() {

    loadCommon();


    const productSelect =
        document.getElementById(
            "stockProduct"
        );


    productSelect.innerHTML =
        PRODUCTS.map(
            product => `

                <option value="${product}">
                    ${product}
                </option>

            `
        )
        .join("");


    const dateInput =
        document.getElementById(
            "stockDate"
        );


    dateInput.value =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "stockInForm"
    ).addEventListener(
        "submit",
        addStock
    );


    renderStockRecords();
}


/* ========================================
   ADD STOCK
======================================== */

function addStock(event) {

    event.preventDefault();


    const product =
        document.getElementById(
            "stockProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "stockQty"
            ).value
        );


    const supplier =
        document.getElementById(
            "stockSupplier"
        ).value.trim();


    const cost =
        Number(
            document.getElementById(
                "stockCost"
            ).value
        ) || 0;


    const date =
        document.getElementById(
            "stockDate"
        ).value;


    if (quantity <= 0) {

        alert(
            "Please enter a valid quantity."
        );

        return;
    }


    state.stockIn.push({

        product: product,

        quantity: quantity,

        supplier: supplier,

        unitCost: cost,

        date: date
    });


    /*
        Update the latest cost of the product.
    */

    if (cost > 0) {

        state.unitCost[product] =
            cost;
    }


    saveState();


    document.getElementById(
        "stockInForm"
    ).reset();


    document.getElementById(
        "stockDate"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    renderStockRecords();
}


/* ========================================
   STOCK RECORDS
======================================== */

function renderStockRecords() {

    const body =
        document.getElementById(
            "stockRecords"
        );


    document.getElementById(
        "stockPageTotal"
    ).textContent =
        formatQty(
            sumStockIn()
        ) + " kg";


    if (state.stockIn.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >
                    No stock received yet.
                </td>

            </tr>

        `;

        return;
    }


    body.innerHTML =
        [...state.stockIn]
        .reverse()
        .map(item => {

            const amount =
                Number(item.quantity) *
                Number(item.unitCost || 0);


            return `

                <tr>

                    <td>

                        <strong>
                            ${item.product}
                        </strong>

                    </td>

                    <td class="qty">

                        ${formatQty(
                            item.quantity
                        )} kg

                    </td>

                    <td>

                        ${
                            item.supplier ||
                            "—"
                        }

                    </td>

                    <td>

                        ₱${formatMoney(
                            item.unitCost || 0
                        )}

                    </td>

                    <td>

                        ₱${formatMoney(
                            amount
                        )}

                    </td>

                </tr>

            `;

        })
        .join("");
}


/* ========================================
   DISTRIBUTION PAGE
======================================== */

function loadDistributionPage() {

    loadCommon();


    const productSelect =
        document.getElementById(
            "distProduct"
        );


    productSelect.innerHTML =
        PRODUCTS.map(
            product => `

                <option value="${product}">
                    ${product}
                </option>

            `
        )
        .join("");


    const destinationSelect =
        document.getElementById(
            "distDestination"
        );


    destinationSelect.innerHTML =
        DESTINATIONS.map(
            destination => `

                <option value="${destination}">
                    ${destination}
                </option>

            `
        )
        .join("");


    productSelect.addEventListener(
        "change",
        updateAvailable
    );


    document.getElementById(
        "distQty"
    ).addEventListener(
        "input",
        validateDistribution
    );


    document.getElementById(
        "distributionForm"
    ).addEventListener(
        "submit",
        addDistribution
    );


    updateAvailable();

    renderDistributionRecords();
}


/* ========================================
   AVAILABLE STOCK
======================================== */

function updateAvailable() {

    const product =
        document.getElementById(
            "distProduct"
        ).value;


    const remaining =
        getRemaining(product);


    document.getElementById(
        "availableQty"
    ).textContent =
        formatQty(
            remaining
        ) + " kg";


    validateDistribution();
}


/* ========================================
   VALIDATE DISTRIBUTION
======================================== */

function validateDistribution() {

    const product =
        document.getElementById(
            "distProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "distQty"
            ).value
        ) || 0;


    const available =
        getRemaining(product);


    const warning =
        document.getElementById(
            "distWarning"
        );


    const button =
        document.getElementById(
            "distSubmit"
        );


    if (quantity > available) {

        warning.textContent =
            "Quantity exceeds available stock.";

        button.disabled = true;

    } else {

        warning.textContent = "";

        button.disabled = false;
    }
}


/* ========================================
   ADD DISTRIBUTION
======================================== */

function addDistribution(event) {

    event.preventDefault();


    const product =
        document.getElementById(
            "distProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "distQty"
            ).value
        );


    const destination =
        document.getElementById(
            "distDestination"
        ).value;


    const available =
        getRemaining(product);


    if (
        quantity <= 0 ||
        quantity > available
    ) {

        alert(
            "Please enter a valid distribution quantity."
        );

        return;
    }


    state.distributions.push({

        product: product,

        quantity: quantity,

        destination: destination,

        date:
            new Date().toISOString()
    });


    saveState();


    document.getElementById(
        "distQty"
    ).value = "";


    updateAvailable();

    renderDistributionRecords();
}


/* ========================================
   DISTRIBUTION RECORDS
======================================== */

function renderDistributionRecords() {

    const body =
        document.getElementById(
            "distributionRecords"
        );


    document.getElementById(
        "distributionPageTotal"
    ).textContent =
        formatQty(
            sumDistributed()
        ) + " kg";


    if (
        state.distributions.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty"
                >
                    No distribution recorded yet.
                </td>

            </tr>

        `;

        return;
    }


    body.innerHTML =
        [...state.distributions]
        .reverse()
        .map(item => `

            <tr>

                <td>

                    <strong>
                        ${item.product}
                    </strong>

                </td>

                <td class="qty">

                    ${formatQty(
                        item.quantity
                    )} kg

                </td>

                <td>
                    ${item.destination}
                </td>

            </tr>

        `)
        .join("");
}