from database import get_connection

def create_bill(
    customer_name,
    mobile,
    payment_mode,
    discount,
    total_amount
):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO bills(
        customer_name,
        mobile,
        payment_mode,
        discount,
        total_amount
    )
    VALUES(?,?,?,?,?)
    """,
    (
        customer_name,
        mobile,
        payment_mode,
        discount,
        total_amount
    ))

    conn.commit()

    bill_id = cursor.lastrowid

    conn.close()

    return bill_id


def add_bill_item(
    bill_id,
    product_id,
    quantity,
    price
):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO bill_items(
        bill_id,
        product_id,
        quantity,
        price
    )
    VALUES(?,?,?,?)
    """,
    (
        bill_id,
        product_id,
        quantity,
        price
    ))

    conn.commit()
    conn.close()