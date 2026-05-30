from flask import Blueprint, jsonify
from database.databse import get_connection

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/api/dashboard", methods=["GET"])
def dashboard_summary():

    try:

        conn = get_connection()
        cursor = conn.cursor()

        # Total products
        cursor.execute("""
            SELECT COUNT(*) AS total_products
            FROM products
        """)
        total_products = cursor.fetchone()["total_products"]

        # Total stock quantity
        cursor.execute("""
            SELECT COALESCE(SUM(quantity), 0) AS total_stock
            FROM products
        """)
        total_stock = cursor.fetchone()["total_stock"]

        # Total stock value
        cursor.execute("""
            SELECT COALESCE(SUM(quantity * price), 0) AS stock_value
            FROM products
        """)
        stock_value = cursor.fetchone()["stock_value"]

        # Total bills
        cursor.execute("""
            SELECT COUNT(*) AS total_bills
            FROM bills
        """)
        total_bills = cursor.fetchone()["total_bills"]

        # Total sales
        cursor.execute("""
            SELECT COALESCE(SUM(total_amount), 0) AS total_sales
            FROM bills
        """)
        total_sales = cursor.fetchone()["total_sales"]

        conn.close()

        return jsonify({
            "success": True,
            "total_products": total_products,
            "total_stock": total_stock,
            "stock_value": stock_value,
            "total_bills": total_bills,
            "total_sales": total_sales
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500