/**
 * invoice.js
 * Shree Cloth House
 */

// ============================================================
// LOAD BILL DATA
// ============================================================

(function loadInvoice() {

    const raw =
        localStorage.getItem(
            "shree_cloth_bill"
        );

    if (!raw) {

        alert(
            "No invoice data found. Please create a bill first."
        );

        window.location.href =
            "billing.html";

        return;
    }

    const bill =
        JSON.parse(raw);

    populateInvoice(bill);

})();


// ============================================================
// POPULATE INVOICE
// ============================================================

function populateInvoice(bill) {

    // =====================================================
    // BILL DETAILS
    // =====================================================

    setText(
        "inv-bill-no",
        bill.bill_id || "—"
    );

    setText(
        "inv-date",
        bill.bill_date || "—"
    );

    setText(
        "inv-customer",
        bill.customer_name || "—"
    );

    setText(
        "inv-mobile",
        bill.mobile || "—"
    );

    setText(
        "inv-payment",
        bill.payment_mode || "—"
    );

    // =====================================================
    // PRODUCTS TABLE
    // =====================================================

    const tbody =
        document.getElementById(
            "table-body"
        );

    const products =
        bill.product_name || bill.products || [];

    let subtotal = 0;

    tbody.innerHTML = "";

    if (products.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4"
                    style="
                    text-align:center;
                    padding:15px;
                    color:#999;">
                    No Products Found
                </td>
            </tr>
        `;

    } else {

        products.forEach(item => {

            const amount =
                item.price *
                item.quantity;

            subtotal += amount;

            const tr =
                document.createElement(
                    "tr"
                );

            tr.innerHTML = `
                <td class="td-item">
                    ${escapeHtml(
                        item.product_name
                    )}
                </td>

                <td class="td-qty">
                    ${item.quantity}
                </td>

                <td class="td-rate">
                    ₹${item.price}
                </td>

                <td class="td-amount">
                    ₹${amount}
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    const discountPct =
        parseFloat(
            bill.discount
        ) || 0;

    const discountAmt =
        Math.round(
            (subtotal *
                discountPct) / 100
        );

    const totalAmt =
        subtotal -
        discountAmt;

    setText(
        "inv-subtotal",
        `₹${subtotal}`
    );

    setText(
        "inv-discount-label",
        `Discount (${discountPct}%)`
    );

    setText(
        "inv-discount-amt",
        discountAmt > 0
            ? `−₹${discountAmt}`
            : "₹0"
    );

    setText(
        "inv-total",
        `₹${totalAmt}`
    );

    const discountRow =
        document.querySelector(
            ".discount-row"
        );

    if (
        discountRow &&
        discountPct === 0
    ) {
        discountRow.style.display =
            "none";
    }
}


// ============================================================
// HELPERS
// ============================================================

function setText(id, value) {

    const el =
        document.getElementById(id);

    if (el) {

        el.textContent = value;
    }
}

function escapeHtml(str) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = str;

    return div.innerHTML;
}


// ============================================================
// BUTTON EVENTS
// ============================================================

const btnDone =
    document.getElementById(
        "btn-done"
    );

if (btnDone) {

    btnDone.addEventListener(
        "click",
        () => {

            window.location.href =
                "billing.html";
        }
    );
}

const btnPrint =
    document.getElementById(
        "btn-print"
    );

if (btnPrint) {

    btnPrint.addEventListener(
        "click",
        () => {

            window.print();
        }
    );
}