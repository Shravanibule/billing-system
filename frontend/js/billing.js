const btnGenerate = document.getElementById("btn-generate");
const discountEl = document.getElementById("discount");

function buildSelectedProducts() {
    if (!window.state || !window.PRODUCTS) {
        return [];
    }

    return Object.entries(state.selected || {}).map(([id, quantity]) => {
        const product = PRODUCTS.find(p => p.id == id);

        return {
            id: product.id,
            product_name: product.product_name || product.name,
            price: product.price,
            quantity: quantity
        };
    });
}

function getBillData(selectedProducts) {
    const total_amount = selectedProducts.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    const discount = parseFloat(discountEl.value) || 0;

    const final_amount =
        total_amount - ((total_amount * discount) / 100);

    return {
        bill_id: null,
        bill_date: new Date().toISOString().split("T")[0],
        customer_name: document.getElementById("name").value.trim(),
        mobile: document.getElementById("phone").value.trim(),
        payment_mode: document.getElementById("payment_mode").value,
        products: selectedProducts,
        product_name: selectedProducts,
        total_amount: total_amount,
        discount: discount,
        final_amount: final_amount
    };
}

function saveInvoiceLocally(billData) {
    localStorage.setItem(
        "shree_cloth_bill",
        JSON.stringify(billData)
    );
}

function handleGenerateInvoice() {
    const selectedProducts = buildSelectedProducts();

    if (selectedProducts.length === 0) {
        alert("Please add at least one product before generating an invoice.");
        return;
    }

    const billData = getBillData(selectedProducts);

    fetch("/api/bills", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(billData)
    })
    .then(response => response.json())
    .then(data => {
        billData.bill_id = data.id || data.bill_id || billData.bill_id;
        saveInvoiceLocally(billData);
        window.location.href = "invoice.html";
    })
    .catch(error => {
        console.error(error);
        alert("Failed to save bill");
    });
}

if (btnGenerate) {
    btnGenerate.addEventListener("click", handleGenerateInvoice);
}