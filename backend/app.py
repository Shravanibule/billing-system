import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from database import init_db
from routes.dashboard_routes import dashboard_bp
from routes.stock_routes import stock_bp
from routes.billing_routes import billing_bp
from routes.history_routes import history_bp

# serve frontend static files from ../frontend (workspace root: billing-system/frontend)
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))

app = Flask(__name__, static_folder=frontend_path, static_url_path="")

CORS(app)

# Register Blueprints
app.register_blueprint(dashboard_bp)
app.register_blueprint(stock_bp)
app.register_blueprint(billing_bp)
app.register_blueprint(history_bp)


@app.route("/")
def home():
    # serve the frontend index
    return send_from_directory(os.path.join(frontend_path, "html"), "index.html")


# Explicitly serve main HTML pages so they resolve relative asset paths correctly
@app.route('/billing.html')
def billing_html():
    return send_from_directory(os.path.join(frontend_path, "html"), "billing.html")


@app.route('/stock.html')
def stock_html():
    return send_from_directory(os.path.join(frontend_path, "html"), "stock.html")


@app.route('/history.html')
def history_html():
    return send_from_directory(os.path.join(frontend_path, "html"), "history.html")


@app.route('/invoice.html')
def invoice_html():
    return send_from_directory(os.path.join(frontend_path, "html"), "invoice.html")


if __name__ == "__main__":
    init_db()
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )