from database import get_connection

def add_product(name, quantity, price):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO products(product_name,quantity,price)
    VALUES(?,?,?)
    """,(name,quantity,price))

    conn.commit()
    conn.close()


def get_all_products():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM products
    ORDER BY product_name
    """)

    data = cursor.fetchall()

    conn.close()

    return [dict(row) for row in data]


def update_stock(product_id, quantity):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE products
    SET quantity = quantity + ?
    WHERE id = ?
    """,(quantity,product_id))

    conn.commit()
    conn.close()


def reduce_stock(product_id, quantity):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE products
    SET quantity = quantity - ?
    WHERE id = ?
    """,(quantity,product_id))

    conn.commit()
    conn.close()