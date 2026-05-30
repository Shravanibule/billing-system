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
        console.log("Captured Frontend Stock Data:", formData);

        // ──────────────────────────────────────────────────────────────
        // ─── INTEGRATE YOUR BACKEND API ROUTE HERE (FUTURE TASK) ───
        // ──────────────────────────────────────────────────────────────
        /*
        fetch('http://127.0.0.1:5000/api/add-stock', {  // Replace with your real backend server URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert(`${formData.product_name} successfully saved to database!`);
            stockForm.reset(); // Clear the form fields so you can add another product immediately
            document.getElementById('product_name').focus(); // Put typing cursor back on the first field
        })
        .catch(error => {
            console.error("API Error occurred:", error);
            alert("Failed to communicate with backend server!");
        });
        */
        // ──────────────────────────────────────────────────────────────

        // Clears the form for the next product instead of leaving the page
        stockForm.reset(); 
        
        // Automatically places cursor back in the "Product Name" input field
        document.getElementById('product_name').focus(); 
    });

    // 2. Handle Clear Button Click Action
    clearBtn.addEventListener('click', () => {
        stockForm.reset(); // Erases text inside all fields manually
    });
});