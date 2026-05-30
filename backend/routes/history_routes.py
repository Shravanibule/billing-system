from flask import Blueprint, jsonify
from database.databse import get_connection

history_bp = Blueprint("history", __name__)


@history_bp.route("/api/bills", methods=["GET"])
def get_all_bills():

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                b.id AS id,
                b.bill_id AS bill_id,
                b.customer_name AS customer_name,
                b.mobile AS mobile,
                p.product_name AS product_name,
                bi.quantity AS quantity,
                bi.price AS price,
                b.payment_mode AS payment_mode,
                b.total_amount AS total_amount,
                b.discount AS discount,
                b.bill_date AS bill_date
            FROM bills b
            LEFT JOIN bill_items bi ON bi.bill_id = b.id
            LEFT JOIN products p ON p.id = bi.product_id
            ORDER BY b.id DESC
        """)

        rows = cursor.fetchall()

        bills = []

        for row in rows:

            bills.append({
                "id": row["id"],
                "bill_id": row["bill_id"],
                "customer_name": row["customer_name"],
                "mobile": row["mobile"],
                "product_name": row["product_name"],
                "quantity": row["quantity"],
                "price": row["price"],
                "payment_mode": row["payment_mode"],
                "total_amount": row["total_amount"],
                "discount": row["discount"],
                "bill_date": row["bill_date"]
            })

        conn.close()

        return jsonify(bills)

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500