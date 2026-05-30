from flask import Blueprint, request, jsonify
from models.product_model import add_product, get_all_products

stock_bp = Blueprint("stock", __name__)


@stock_bp.route("/api/add-stock", methods=["POST"])
def add_stock():
    try:
        data = request.get_json()

        product_name = data.get("product_name")
        quantity = data.get("quantity")
        price = data.get("price")

        if not product_name:
            return jsonify({"success": False, "message": "Product name is required"}), 400

        # Use the product model to insert into the products table
        add_product(product_name, quantity or 0, price or 0.0)

        return jsonify({"success": True, "message": f"{product_name} added successfully"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@stock_bp.route("/api/products", methods=["GET"])
def list_products():
    try:
        products = get_all_products()
        return jsonify(products)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500