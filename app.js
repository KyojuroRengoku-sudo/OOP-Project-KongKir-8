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


function getDefaultState() {

    return {
        day: 1,

        opening: {
            ...DEFAULT_OPENING
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

        return JSON.parse(saved);

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


/* =========================
   CALCULATIONS
========================= */

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
        Number(state.opening[product] || 0);

    return (
        opening +
        getStockIn(product) -
        getDistributed(product)
    );

}


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


function formatQty(number) {

    return Number(number)
        .toLocaleString(
            undefined,
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}


function formatMoney(number) {

    return Number(number)
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* =========================
   COMMON PAGE DATA
========================= */

function loadCommon() {

    const day =
        document.getElementById("sidebarDay");

    if (day) {
        day.textContent =
            "Day " + state.day;
    }


    const date =
        document.getElementById("todayDate");

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


/* =========================
   DASHBOARD
========================= */

function loadDashboard() {

    loadCommon();


    document.getElementById(
        "openingTotal"
    ).textContent =
        formatQty(sumOpening()) + " kg";


    document.getElementById(
        "stockInTotal"
    ).textContent =
        formatQty(sumStockIn()) + " kg";


    document.getElementById(
        "distributedTotal"
    ).textContent =
        formatQty(sumDistributed()) + " kg";


    document.getElementById(
        "remainingTotal"
    ).textContent =
        formatQty(sumRemaining()) + " kg";


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
                        ${formatQty(remaining)} kg
                    </td>

                    <td>
                        <span class="
                            status
                            ${low ? "low" : "good"}
                        ">
                            ${
                                low
                                    ? "Low Stock"
                                    : "In Stock"
                            }
                        </span>
                    </td>

                </tr>
            `;

        }).join("");


    document.getElementById(
        "closeDayBtn"
    ).addEventListener(
        "click",
        closeDay
    );

}


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


/* =========================
   STOCK IN
========================= */

function loadStockInPage() {

    loadCommon();


    const productSelect =
        document.getElementById(
            "stockProduct"
        );


    productSelect.innerHTML =
        PRODUCTS.map(
            product =>
                `<option value="${product}">
                    ${product}
                </option>`
        ).join("");


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


function renderStockRecords() {

    const body =
        document.getElementById(
            "stockRecords"
        );


    document.getElementById(
        "stockPageTotal"
    ).textContent =
        formatQty(sumStockIn()) +
        " kg";


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
                item.quantity *
                item.unitCost;


            return `
                <tr>

                    <td>
                        <strong>
                            ${item.product}
                        </strong>
                    </td>

                    <td class="qty">
                        ${formatQty(item.quantity)}
                        kg
                    </td>

                    <td>
                        ${
                            item.supplier ||
                            "—"
                        }
                    </td>

                    <td>
                        ₱${formatMoney(
                            item.unitCost
                        )}
                    </td>

                    <td>
                        ₱${formatMoney(
                            amount
                        )}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================
   DISTRIBUTION
========================= */

function loadDistributionPage() {

    loadCommon();


    const productSelect =
        document.getElementById(
            "distProduct"
        );


    productSelect.innerHTML =
        PRODUCTS.map(
            product =>
                `<option value="${product}">
                    ${product}
                </option>`
        ).join("");


    const destinationSelect =
        document.getElementById(
            "distDestination"
        );


    destinationSelect.innerHTML =
        DESTINATIONS.map(
            destination =>
                `<option value="${destination}">
                    ${destination}
                </option>`
        ).join("");


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
        formatQty(remaining) +
        " kg";


    validateDistribution();

}


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