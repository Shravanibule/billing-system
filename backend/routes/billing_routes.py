from flask import Blueprint, jsonify, request
from database.databse import get_connection
import uuid

billing_bp = Blueprint("billing", __name__)


@billing_bp.route("/api/bills", methods=["POST"])
def create_bill():
    try:
        data = request.get_json()

        customer_name = data.get("customer_name")
        mobile = data.get("mobile")
        payment_mode = data.get("payment_mode")
        discount = data.get("discount", 0)
        total_amount = data.get("total_amount")
        bill_date = data.get("bill_date")
        products = data.get("products", [])

        if not customer_name or not mobile or total_amount is None or not products:
            return jsonify({
                "success": False,
                "message": "Missing bill data"
            }), 400

        conn = get_connection()
        cursor = conn.cursor()

        bill_id = f"BILL-{uuid.uuid4().hex[:8].upper()}"

        # Validate stock availability before creating the bill.
        for item in products:
            product_id = item.get("id")
            quantity = int(item.get("quantity", 0))

            cursor.execute(
                "SELECT quantity FROM products WHERE id = ?",
                (product_id,)
            )
            product_row = cursor.fetchone()
            if not product_row:
                conn.close()
                return jsonify({
                    "success": False,
                    "message": f"Product not found: {product_id}"
                }), 400

            if product_row["quantity"] < quantity:
                conn.close()
                return jsonify({
                    "success": False,
                    "message": f"Insufficient stock for product ID {product_id}."
                }), 400

        cursor.execute("""
            INSERT INTO bills(
                bill_id,
                customer_name,
                mobile,
                payment_mode,
                discount,
                total_amount,
                bill_date
            )
            VALUES(?,?,?,?,?,?,?)
        """, (
            bill_id,
            customer_name,
            mobile,
            payment_mode,
            discount,
            total_amount,
            bill_date
        ))

        saved_bill_id = cursor.lastrowid

        for item in products:
            product_id = item.get("id")
            quantity = int(item.get("quantity", 0))

            cursor.execute("""
                INSERT INTO bill_items(
                    bill_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES(?,?,?,?)
            """, (
                saved_bill_id,
                product_id,
                quantity,
                item.get("price")
            ))

            cursor.execute(
                "UPDATE products SET quantity = quantity - ? WHERE id = ?",
                (quantity, product_id)
            )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "bill_id": bill_id,
            "message": "Bill created successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@billing_bp.route("/api/billing", methods=["GET"])
def billing_summary():

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