let lastData = "";

async function loadStock() {
  try {
    const res = await fetch("http://localhost:5000/api/products");
    const data = await res.json();

    const newDataString = JSON.stringify(data);
    if (newDataString === lastData) return;
    lastData = newDataString;

    const table = document.getElementById("stockTable");
    table.innerHTML = "";

    data.forEach(item => {
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

      table.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td><span class="${className}">${status}</span></td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error loading stock:", err);
  }
}

loadStock();
setInterval(loadStock, 5000);