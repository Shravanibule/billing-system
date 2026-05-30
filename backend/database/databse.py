import sqlite3

DATABASE = "database/cloth.db"


def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL UNIQUE,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bills(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id TEXT UNIQUE,
        customer_name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        discount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bill_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(bill_id) REFERENCES bills(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
    )
    """)

    cursor.execute("PRAGMA table_info(bills)")
    bill_columns = [row[1] for row in cursor.fetchall()]
    if "bill_id" not in bill_columns:
        cursor.execute("ALTER TABLE bills ADD COLUMN bill_id TEXT")
        cursor.execute("UPDATE bills SET bill_id = 'BILL-' || id WHERE bill_id IS NULL")

    cursor.execute("PRAGMA table_info(products)")
    product_columns = [row[1] for row in cursor.fetchall()]
    if "created_at" not in product_columns:
        cursor.execute(
            "ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        )

    conn.commit()
    conn.close()