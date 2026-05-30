from flask import Flask
from flask_cors import CORS

from database.databse import init_db
from routes.dashboard_routes import dashboard_bp
from routes.stock_routes import stock_bp
from routes.billing_routes import billing_bp
from routes.history_routes import history_bp

app = Flask(__name__)

# Ensure the SQLite database and tables exist before serving requests
init_db()

CORS(app)

# Register Blueprints
app.register_blueprint(dashboard_bp)
app.register_blueprint(stock_bp)
app.register_blueprint(billing_bp)
app.register_blueprint(history_bp)


@app.route("/")
def home():
    return {
        "message": "FabricBill Backend Running Successfully"
    }


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )