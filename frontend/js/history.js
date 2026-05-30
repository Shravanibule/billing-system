const API_URL = "https://billing-system-a5tf.onrender.com/api/bills";
const billContainer = document.getElementById("billContainer");
const searchInput = document.getElementById("searchInput");
let bills = [];
let groupedBills = [];

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function groupBillsByBillId(rows) {
  const map = new Map();

  rows.forEach(row => {
    const key = row.bill_id || `bill-${row.id}`;
    if (!map.has(key)) {
      map.set(key, {
        id: row.id,
        bill_id: row.bill_id || `BILL-${row.id}`,
        customer_name: row.customer_name || "Unknown customer",
        mobile: row.mobile || "",
        payment_mode: row.payment_mode || "Unknown",
        total_amount: row.total_amount || 0,
        discount: row.discount || 0,
        bill_date: row.bill_date || "",
        products: []
      });
    }

    const bill = map.get(key);
    const productName = row.product_name || "Item";
    const quantity = row.quantity || 0;
    const price = row.price || 0;

    if (productName || quantity || price) {
      bill.products.push({
        product_name: productName,
        quantity,
        price
      });
    }
  });

  return Array.from(map.values());
}

async function loadBills() {
  try {
    const response = await fetch(API_URL);
    bills = await response.json();
    if (!Array.isArray(bills)) {
      throw new Error("Invalid bill data from backend.");
    }
    groupedBills = groupBillsByBillId(bills);
    displayBills(groupedBills);
  } catch (error) {
    console.error(error);
    billContainer.innerHTML = "<h3>Unable to load bills</h3>";
  }
}

function renderProductLines(products) {
  if (!products || products.length === 0) {
    return `<div class="product">No products recorded</div>`;
  }

  return products
    .map(
      item => `
        <div class="product">
          ${escapeHtml(item.product_name)} x${item.quantity} @ ₹${item.price}
        </div>`
    )
    .join("");
}

function displayBills(data) {
  billContainer.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    billContainer.innerHTML = "<h3 style='padding:20px'>No Bills Found</h3>";
    return;
  }

  billContainer.innerHTML = data
    .map(
      bill => `
        <div class="bill-card">
          <div class="left">
            <div class="customer-name">${escapeHtml(bill.customer_name)}</div>
            <div class="bill-id">${escapeHtml(bill.bill_id)}</div>
            ${renderProductLines(bill.products)}
            <div class="date">${escapeHtml(bill.bill_date)}</div>
          </div>
          <div class="right">
            <div class="amount">₹${bill.total_amount}</div>
            <div class="payment ${escapeHtml(bill.payment_mode.toLowerCase())}">
              ${escapeHtml(bill.payment_mode)}
            </div>
          </div>
        </div>`
    )
    .join("");
}

function filterBills(value) {
  const searchText = value.toLowerCase();

  return groupedBills.filter(bill => {
    const textMatch =
      bill.customer_name.toLowerCase().includes(searchText) ||
      bill.mobile.toLowerCase().includes(searchText) ||
      bill.bill_id.toLowerCase().includes(searchText);

    const productMatch = bill.products.some(product =>
      product.product_name.toLowerCase().includes(searchText)
    );

    return textMatch || productMatch;
  });
}

if (searchInput) {
  searchInput.addEventListener("keyup", () => {
    const filteredBills = filterBills(searchInput.value);
    displayBills(filteredBills);
  });
}

loadBills();