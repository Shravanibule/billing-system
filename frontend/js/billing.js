const API_BASE = "http://127.0.0.1:5000";

const state = {
    products: [],
    selected: {} // State shape maintained safely: { [productId]: quantity }
};

const productContainer = document.getElementById("product_name");
const productDropdown = document.querySelector(".product-dropdown");
const productSearch = document.getElementById("product-search");
const productDropdownClose = document.getElementById("productDropdownClose");
const selectedSummary = document.getElementById("selectedSummary");
const discountEl = document.getElementById("discount");
const totalAmountText = document.getElementById("total_amount");
const finalAmountText = document.getElementById("final_amount");
const totalAmountVal = document.getElementById("total_amount_val");
const btnGenerate = document.getElementById("btn-generate");
const btnCancel = document.getElementById("btn-cancel");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const paymentModeSelect = document.getElementById("payment_mode");

// Generates structural markup using your design's exact CSS classes
function createProductHtml(product) {
    const isSelected = state.selected[product.id] !== undefined;
    const selectedQty = state.selected[product.id] || 1;

    return `
        <div class="product-item ${isSelected ? 'selected' : ''}" data-id="${product.id}">
            <input 
                type="checkbox" 
                class="product-checkbox" 
                data-id="${product.id}" 
                ${isSelected ? 'checked' : ''} 
            />
            <div class="product-item-label">${escapeHtml(product.product_name)}</div>
            <div class="product-item-price">₹${product.price}/unit</div>
            
            ${isSelected ? `
                <div class="qty-control" data-id="${product.id}">
                    <button type="button" class="qty-btn minus-btn">—</button>
                    <span class="qty-val">${selectedQty}</span>
                    <button type="button" class="qty-btn plus-btn">+</button>
                </div>
            ` : ''}
        </div>`;
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function openProductDropdown() {
    if (!productDropdown) return;
    productDropdown.classList.add("open");
}

function closeProductDropdown() {
    if (!productDropdown) return;
    productDropdown.classList.remove("open");
}

function toggleProductDropdown() {
    if (!productDropdown) return;
    productDropdown.classList.toggle("open");
}

function updateSelectedSummary() {
    if (!selectedSummary) return;
    const selectedCount = Object.keys(state.selected).length;
    if (selectedCount === 0) {
        selectedSummary.textContent = "No items selected";
    } else if (selectedCount === 1) {
        selectedSummary.textContent = "1 item selected";
    } else {
        selectedSummary.textContent = `${selectedCount} items selected`;
    }
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
        updateSelectedSummary();
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
    openProductDropdown();
}

// Custom handler for selecting rows and stepping quantities up/down
function handleProductClick(event) {
    const itemRow = event.target.closest(".product-item");
    if (!itemRow) return;

    const productId = itemRow.dataset.id;

    // Clicked minus button
    if (event.target.classList.contains("minus-btn")) {
        event.stopPropagation();
        if (state.selected[productId] > 1) {
            state.selected[productId]--;
        } else {
            delete state.selected[productId];
        }
        refreshVisibleRow(productId);
        updateTotals();
        return;
    }

    // Clicked plus button
    if (event.target.classList.contains("plus-btn")) {
        event.stopPropagation();
        state.selected[productId]++;
        refreshVisibleRow(productId);
        updateTotals();
        return;
    }

    // Ignore raw numeric-label surface clicks
    if (event.target.classList.contains("qty-control") || event.target.classList.contains("qty-val")) {
        return;
    }

    // Toggle overall item row checkbox selection status
    if (state.selected[productId] !== undefined) {
        delete state.selected[productId];
    } else {
        state.selected[productId] = 1;
    }
    
    refreshVisibleRow(productId);
    updateTotals();
}

// In-place UI row replacement logic so screen-scroll state doesn't jitter
function refreshVisibleRow(productId) {
    const product = state.products.find(item => item.id == productId);
    if (!product) return;
    
    const oldRow = productContainer.querySelector(`.product-item[data-id="${productId}"]`);
    if (oldRow) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = createProductHtml(product);
        const newRow = wrapper.firstElementChild;
        oldRow.replaceWith(newRow);
    }
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
    updateSelectedSummary();
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
        productSearch.addEventListener("focus", openProductDropdown);
        productSearch.addEventListener("click", (event) => {
            event.stopPropagation();
            openProductDropdown();
        });
        productSearch.addEventListener("input", onSearchChange);
        productSearch.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeProductDropdown();
            }
        });
    }

    if (productDropdownClose) {
        productDropdownClose.addEventListener("click", (event) => {
            event.stopPropagation();
            closeProductDropdown();
        });
    }

    // Handles row interaction, custom check-switches, and count manipulation safely
    if (productContainer) {
        productContainer.addEventListener("click", handleProductClick);
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