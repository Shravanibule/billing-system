let lastData = "";

// Fixed capitalization to match the HTML onclick attribute
function goTo(page) {
  window.location.href = page;
}

async function loadStock() {
  try {
    const res = await fetch("https://billing-system-a5tf.onrender.com/api/dashboard")
    const data = await res.json();

    const newDataString = JSON.stringify(data);
    if (newDataString === lastData) return;
    lastData = newDataString;

    const table = document.getElementById("stockTable");
    
    // Build rows in memory first to prevent excessive DOM reflows
    let tableHTML = "";

    data.recent_products.forEach(item => {
      let status = "";
      let className = "";

      if (item.quantity > 100) {
        status = "Good";
        className = "good";
      } else if (item.quantity >= 30) {
        status = "Medium";
        className = "medium";
      } else {
        status = "Low";
        className = "low";
      }

      tableHTML += `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td><span class="${className}">${status}</span></td>
        </tr>
      `;
    });

    // Inject all rows at once
    table.innerHTML = tableHTML;

  } catch (err) {
    console.error("Error loading stock:", err);
  }
}

// Initial load and periodic refresh
loadStock();
setInterval(loadStock, 5000);