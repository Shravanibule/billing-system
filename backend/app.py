from flask import Flask
from flask_cors import CORS

from routes.dashboard_routes import dashboard_bp
from routes.stock_routes import stock_bp
from routes.billing_routes import billing_bp
from routes.history_routes import history_bp

app = Flask(__name__)

CORS(app)

# Register Blueprints
app.register_blueprint(dashboard_bp)
app.register_blueprint(stock_bp)
app.register_blueprint(billing_bp)
app.register_blueprint(history_bp)

if __name__ == "__main__":
    app.run(debug=True)