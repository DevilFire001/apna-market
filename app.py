from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import ast

app = Flask(__name__)
CORS(app)  # Allow frontend to call API

# ---------- DATABASE ----------
def db():
    return sqlite3.connect("database.db")


def init_db():
    con = db()
    cur = con.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT UNIQUE,
        role TEXT,
        password TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER,
        image TEXT,
        shop_id INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer TEXT,
        phone TEXT,
        address TEXT,
        items TEXT,
        status TEXT
    )
    """)

    con.commit()
    con.close()

init_db()

# ---------- ROUTES ----------

@app.route("/")
def home():
    return "APNA MARKET Backend Running"

# Signup
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    con = db()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO users (name, phone, role, password) VALUES (?,?,?,?)",
        (data["name"], data["phone"], data["role"], data["password"])
    )
    con.commit()
    con.close()
    return jsonify({"success": True})

# Login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    con = db()
    cur = con.cursor()
    cur.execute(
        "SELECT id, role FROM users WHERE phone=? AND password=?",
        (data["phone"], data["password"])
    )
    user = cur.fetchone()
    con.close()
    if user:
        return jsonify({"success": True, "id": user[0], "role": user[1]})
    else:
        return jsonify({"success": False})

# Add Product
@app.route("/add-product", methods=["POST"])
def add_product():
    data = request.json
    con = db()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO products (name, price, image, shop_id) VALUES (?,?,?,?)",
        (data["name"], data["price"], data.get("image",""), data.get("shop_id",1))
    )
    con.commit()
    con.close()
    return jsonify({"success": True})

# Get all products
@app.route("/products")
def products():
    con = db()
    cur = con.cursor()
    cur.execute("SELECT id, name, price, image FROM products")
    rows = cur.fetchall()
    con.close()
    return jsonify([{"id": r[0], "name": r[1], "price": r[2], "image": r[3]} for r in rows])

# Place order
@app.route("/order", methods=["POST"])
def order():
    data = request.json
    con = db()
    cur = con.cursor()
    cur.execute(
        "INSERT INTO orders (buyer, phone, address, items, status) VALUES (?,?,?,?,?)",
        (data["buyer"], data["phone"], data["address"], str(data["items"]), "Pending")
    )
    con.commit()
    con.close()
    return jsonify({"success": True, "message": "Order placed"})

# Get all orders
@app.route("/orders")
def orders():
    con = db()
    cur = con.cursor()
    cur.execute("SELECT * FROM orders")
    rows = cur.fetchall()
    con.close()
    result = []
    for r in rows:
        # Convert string back to list
        items = ast.literal_eval(r[4])
        result.append({
            "id": r[0],
            "buyer": r[1],
            "phone": r[2],
            "address": r[3],
            "items": items,
            "status": r[5]
        })
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
