document.addEventListener("DOMContentLoaded", () => {
    const stockForm = document.getElementById('stockForm');
    const clearBtn = document.getElementById('clearBtn');

    // 1. Handle Form Submission Event
    stockForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevents the browser from instantly reloading the page

        // Capture data from user input fields using your team's exact variable names
        const productName = document.getElementById('product_name').value.trim();
        const quantityAmount = parseInt(document.getElementById('quantity').value);
        const priceAmount = parseFloat(document.getElementById('price').value);

        // Structure data into an object format matching your team's backend keys
        const formData = {
            product_name: productName,
            quantity: quantityAmount,
            price: priceAmount
        };

        // For testing/debugging purposes on frontend layout stage
        console.log("Sending Frontend Stock Data to Backend:", formData);

        // ──────────────────────────────────────────────────────────────
        // 🔥 YOUR BACKEND API ROUTE IS NOW ACTIVE
        // ──────────────────────────────────────────────────────────────
        fetch('https://billing-system-a5tf.onrender.com/api/add-stock', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Shows the custom message sent back by your APP.PY server
            alert(data.message);

            // Clears the form fields so you can add another product immediately
            stockForm.reset(); 

            // Automatically puts typing cursor back on the first field
            document.getElementById('product_name').focus(); 
        })
        .catch(error => {
            console.error("API Error occurred:", error);
            alert("Failed to communicate with backend server!");
        });
        // ──────────────────────────────────────────────────────────────
    });

    // 2. Handle Clear Button Click Action
    clearBtn.addEventListener('click', () => {
        stockForm.reset(); // Erases text inside all fields manually
    });
});