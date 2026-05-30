from flask import Blueprint, request, jsonify
from database.databse import get_connection
import sqlite3

stock_bp = Blueprint("stock", __name__)

DATABASE = "database/clothhouse.db"


@stock_bp.route("/api/add-stock", methods=["POST"])
def add_stock():

    try:

        data = request.get_json()

        product_name = data.get("product_name")
        quantity = data.get("quantity")
        price = data.get("price")

        if not product_name:
            return jsonify({
                "success": False,
                "message": "Product name is required"
            }), 400

        conn = sqlite3.connect(DATABASE)

        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO stock
            (
                product_name,
                quantity,
                price
            )
            VALUES (?, ?, ?)
        """, (
            product_name,
            quantity,
            price
        ))

        conn.commit()

        conn.close()

        return jsonify({
            "success": True,
            "message": f"{product_name} added successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500