const API_URL = "http://127.0.0.1:5000/api/bills";

const billContainer =
document.getElementById("billContainer");

const searchInput =
document.getElementById("searchInput");

let bills = [];

async function loadBills() {

    try {

        const response =
        await fetch(API_URL);

        bills =
        await response.json();

        displayBills(bills);

    }

    catch(error){

        console.log(error);

        billContainer.innerHTML =
        "<h3>Unable to load bills</h3>";
    }
}

function displayBills(data){

    billContainer.innerHTML = "";

    if(data.length === 0){

        billContainer.innerHTML =
        "<h3 style='padding:20px'>No Bills Found</h3>";

        return;
    }

    data.forEach(bill => {

        billContainer.innerHTML += `

        <div class="bill-card">

            <div class="left">

                <div class="customer-name">
                    ${bill.customer_name}
                </div>

                <div class="bill-id">
                    ${bill.bill_id}
                </div>

                <div class="product">
                    ${bill.product_name} x${bill.quantity}
                </div>

                <div class="date">
                    ${bill.bill_date}
                </div>

            </div>

            <div class="right">

                <div class="amount">
                    ₹${bill.total_amount}
                </div>

                <div class="payment ${bill.payment_mode.toLowerCase()}">
                    ${bill.payment_mode}
                </div>

            </div>

        </div>

        `;
    });
}

searchInput.addEventListener("keyup", () => {

    const value =
    searchInput.value.toLowerCase();

    const filteredBills =
    bills.filter(bill =>

        bill.customer_name
        .toLowerCase()
        .includes(value)

        ||

        bill.mobile
        .includes(value)

        ||

        bill.product_name
        .toLowerCase()
        .includes(value)

        ||

        bill.bill_id
        .toLowerCase()
        .includes(value)
    );

    displayBills(filteredBills);
});

document
.getElementById("allBtn")
.addEventListener("click", () => {

    displayBills(bills);
});

document
.getElementById("billBtn")
.addEventListener("click", () => {

    displayBills(bills);
});

loadBills();

