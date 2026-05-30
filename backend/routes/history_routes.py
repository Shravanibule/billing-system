from flask import Blueprint, jsonify
from database.databse import get_connection
import sqlite3

history_bp = Blueprint("history", __name__)

DATABASE = "database/clothhouse.db"


@history_bp.route("/api/bills", methods=["GET"])
def get_all_bills():

    try:

        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row

        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                id,
                bill_id,
                customer_name,
                mobile,
                product_name,
                quantity,
                price,
                payment_mode,
                total_amount,
                discount,
                bill_date
            FROM bills
            ORDER BY id DESC
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