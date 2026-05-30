const API_BASE = "http://127.0.0.1:5000";

const state = {
    products: [],
    selected: {}
};

const productContainer = document.getElementById("product_name");
const productSearch = document.getElementById("product-search");
const discountEl = document.getElementById("discount");
const totalAmountText = document.getElementById("total_amount");
const finalAmountText = document.getElementById("final_amount");
const totalAmountVal = document.getElementById("total_amount_val");
const btnGenerate = document.getElementById("btn-generate");
const btnCancel = document.getElementById("btn-cancel");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const paymentModeSelect = document.getElementById("payment_mode");

function createProductHtml(product) {
    const selectedQty = state.selected[product.id] || 0;
    return `
        <div class="product-item" data-id="${product.id}">
            <div class="product-row">
                <div class="product-name">${escapeHtml(product.product_name)}</div>
                <div class="product-price">₹${product.price}</div>
            </div>
            <div class="product-actions">
                <label>Qty</label>
                <input
                    type="number"
                    min="0"
                    value="${selectedQty}"
                    class="product-qty"
                    data-id="${product.id}"
                />
            </div>
        </div>`;
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        if (!Array.isArray(products)) {
            throw new Error("Invalid product list from backend.");
        }
        state.products = products;
        renderProducts(products);
        updateTotals();
    } catch (error) {
        console.error("Unable to load products:", error);
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="error-message">
                    Unable to load products. Please check the backend server.
                </div>`;
        }
    }
}

function renderProducts(products) {
    if (!productContainer) return;
    if (products.length === 0) {
        productContainer.innerHTML = `
            <div class="empty-state">
                No products available. Add stock first.
            </div>`;
        return;
    }
    productContainer.innerHTML = products.map(createProductHtml).join("");
}

function onSearchChange() {
    const searchValue = productSearch.value.toLowerCase().trim();
    const filtered = state.products.filter(product =>
        product.product_name.toLowerCase().includes(searchValue)
    );
    renderProducts(filtered);
}

function onQuantityInput(event) {
    const target = event.target;
    if (!target.classList.contains("product-qty")) return;

    const productId = target.dataset.id;
    const quantity = parseInt(target.value, 10) || 0;

    if (quantity > 0) {
        state.selected[productId] = quantity;
    } else {
        delete state.selected[productId];
    }

    updateTotals();
}

function getSelectedProducts() {
    return Object.entries(state.selected)
        .map(([id, quantity]) => {
            const product = state.products.find(item => item.id == id);
            if (!product) return null;
            return {
                id: product.id,
                product_name: product.product_name,
                price: product.price,
                quantity: quantity
            };
        })
        .filter(Boolean);
}

function updateTotals() {
    const selectedProducts = getSelectedProducts();
    const total = selectedProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const discountPct = parseFloat(discountEl.value) || 0;
    const discountAmt = Math.round((total * discountPct) / 100);
    const finalTotal = total - discountAmt;

    if (totalAmountText) totalAmountText.textContent = `₹${total}`;
    if (finalAmountText) finalAmountText.textContent = `₹${finalTotal}`;
    if (totalAmountVal) totalAmountVal.value = total;
}

function validateBill() {
    const customerName = nameInput.value.trim();
    const mobile = phoneInput.value.trim();
    const selectedProducts = getSelectedProducts();

    if (!customerName) {
        alert("Enter customer name.");
        return false;
    }

    if (!mobile || mobile.length < 10) {
        alert("Enter a valid 10-digit mobile number.");
        return false;
    }

    if (selectedProducts.length === 0) {
        alert("Select at least one product and quantity.");
        return false;
    }

    return true;
}

async function createBill() {
    const customerName = nameInput.value.trim();
    const mobile = phoneInput.value.trim();
    const paymentMode = paymentModeSelect.value;
    const discountPct = parseFloat(discountEl.value) || 0;
    const selectedProducts = getSelectedProducts();
    const total = selectedProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const discountAmt = Math.round((total * discountPct) / 100);
    const finalTotal = total - discountAmt;

    const billData = {
        bill_date: new Date().toISOString().split("T")[0],
        customer_name: customerName,
        mobile: mobile,
        payment_mode: paymentMode,
        products: selectedProducts,
        total_amount: total,
        discount: discountPct,
        final_amount: finalTotal
    };

    try {
        const response = await fetch(`${API_BASE}/api/bills`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(billData)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Unable to create bill.");
        }

        billData.bill_id = result.bill_id || `BILL-${Date.now()}`;
        billData.product_name = selectedProducts;
        billData.products = selectedProducts;

        localStorage.setItem("shree_cloth_bill", JSON.stringify(billData));

        window.location.href = "invoice.html";
    } catch (error) {
        console.error("Failed to create bill:", error);
        alert(error.message || "Failed to save bill. Please try again.");
    }
}

function bindEvents() {
    if (productSearch) {
        productSearch.addEventListener("input", onSearchChange);
    }

    if (productContainer) {
        productContainer.addEventListener("input", onQuantityInput);
    }

    if (discountEl) {
        discountEl.addEventListener("input", updateTotals);
    }

    if (btnGenerate) {
        btnGenerate.addEventListener("click", async () => {
            if (!validateBill()) return;
            await createBill();
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener("click", () => {
            window.history.back();
        });
    }
}

function init() {
    fetchProducts();
    bindEvents();
}

init();