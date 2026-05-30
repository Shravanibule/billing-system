from database.databse import get_connection

def get_bill_history():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM bills
    ORDER BY bill_date DESC
    """)

    data = cursor.fetchall()

    conn.close()

    return [dict(row) for row in data]