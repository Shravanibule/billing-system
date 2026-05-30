// ============================================================
// BUILD SELECTED PRODUCTS ARRAY
// ============================================================

const selectedProducts = Object.entries(state.selected).map(([id, quantity]) => {

    const product = PRODUCTS.find(p => p.id == id);

    return {
        id: product.id,
        product_name: product.product_name || product.name,
        price: product.price,
        quantity: quantity
    };
});

// ============================================================
// CALCULATE TOTALS
// ============================================================

const total_amount = selectedProducts.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
);

const discount_value = parseFloat(discountEl.value) || 0;

const final_amount =
    total_amount - ((total_amount * discount_value) / 100);

// ============================================================
// BILL DATA
// ============================================================

const billData = {

    bill_id: null,

    bill_date: new Date()
        .toISOString()
        .split("T")[0],

    customer_name:
        document.getElementById("name")
        .value
        .trim(),

    mobile:
        document.getElementById("phone")
        .value
        .trim(),

    payment_mode:
        document.getElementById("payment_mode")
        .value,

    product_name:
        selectedProducts,

    total_amount:
        total_amount,

    discount:
        discount_value,

    final_amount:
        final_amount
};

// ============================================================
// SEND TO BACKEND
// ============================================================

fetch("/api/bills", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify(billData)

})
.then(response => response.json())
.then(data => {

    console.log("Bill Saved:", data);

    window.location.href = "invoice.html";

})
.catch(error => {

    console.error(error);

    alert("Failed to save bill");
});