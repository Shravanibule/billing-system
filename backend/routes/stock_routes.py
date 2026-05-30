from flask import Blueprint, request, jsonify
from database.databse import get_connection

stock_bp = Blueprint("stock", __name__)


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

        if quantity is None or price is None:
            return jsonify({
                "success": False,
                "message": "Quantity and price are required"
            }), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, quantity
            FROM products
            WHERE product_name = ?
        """, (product_name,))
        existing = cursor.fetchone()

        if existing:
            updated_quantity = existing["quantity"] + quantity
            cursor.execute("""
                UPDATE products
                SET quantity = ?, price = ?
                WHERE id = ?
            """, (
                updated_quantity,
                price,
                existing["id"]
            ))
            message = f"{product_name} updated successfully"
        else:
            cursor.execute("""
                INSERT INTO products
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
            message = f"{product_name} added successfully"

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": message
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500