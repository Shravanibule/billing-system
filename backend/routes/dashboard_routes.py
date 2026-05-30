from flask import Blueprint, jsonify
from database.databse import get_connection

dashboard_bp = Blueprint("dashboard",__name__)


@dashboard_bp.route("/api/products", methods=["GET"])
def get_all_products():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, product_name, quantity, price
            FROM products
            ORDER BY product_name
        """)
        products = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(products)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@dashboard_bp.route("/api/dashboard", methods=["GET"])
def dashboard_summary():

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # Total Products
        cursor.execute("""
            SELECT COUNT(*) AS total_products
            FROM products
        """)
        total_products = cursor.fetchone()["total_products"]

        # Total Stock Quantity
        cursor.execute("""
            SELECT COALESCE(SUM(quantity), 0)
            AS total_stock
            FROM products
        """)
        total_stock = cursor.fetchone()["total_stock"]

        # Total Stock Value
        cursor.execute("""
            SELECT COALESCE(SUM(quantity * price), 0)
            AS stock_value
            FROM products
        """)
        stock_value = cursor.fetchone()["stock_value"]

        # Recent Products
        cursor.execute("""
            SELECT
                product_name,
                quantity,
                price,
                created_at
            FROM products
            ORDER BY created_at DESC
            LIMIT 5
        """)

        recent_products = [
            dict(row)
            for row in cursor.fetchall()
        ]

        conn.close()

        return jsonify({
            "success": True,
            "total_products": total_products,
            "total_stock": total_stock,
            "stock_value": stock_value,
            "recent_products": recent_products
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500