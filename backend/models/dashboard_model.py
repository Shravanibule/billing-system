from database.databse import get_connection

def get_dashboard_data():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT COUNT(*) as categories
    FROM products
    """)
    categories = cursor.fetchone()["categories"]

    cursor.execute("""
    SELECT SUM(quantity) as total_units
    FROM products
    """)
    total_units = cursor.fetchone()["total_units"] or 0

    cursor.execute("""
    SELECT SUM(quantity*price) as stock_value
    FROM products
    """)
    stock_value = cursor.fetchone()["stock_value"] or 0

    cursor.execute("""
    SELECT COUNT(*) as low_stock
    FROM products
    WHERE quantity < 20
    """)
    low_stock = cursor.fetchone()["low_stock"]

    cursor.execute("""
    SELECT
        product_name,
        quantity,
        price
    FROM products
    ORDER BY product_name
    """)
    products = cursor.fetchall()

    conn.close()

    return {
        "categories": categories,
        "total_units": total_units,
        "stock_value": stock_value,
        "low_stock": low_stock,
        "products":[dict(row) for row in products]
    }