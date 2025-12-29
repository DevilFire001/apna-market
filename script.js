const API = "http://172.22.128.110:5000"; // Replace with your backend IP

// ---------------- CART STORAGE ----------------
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ---------------- LOAD PRODUCTS ----------------
async function loadProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    const list = document.getElementById("productList");
    if (!list) return;
    list.innerHTML = "";

    products.forEach(p => {
      const nameEscaped = (p.name || "").replace(/'/g, "\\'");
      list.innerHTML += `
        <div class="product">
          <img src="${p.image || 'https://via.placeholder.com/150'}">
          <h4>${p.name}</h4>
          <p>₹${p.price}</p>
          <button onclick="addToCart(${p.id}, '${nameEscaped}', ${p.price})">Add</button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Products load failed", err);
  }
}

// ---------------- ADD TO CART ----------------
function addToCart(id, name, price) {
  const cart = getCart();
  cart.push({ id, name, price });
  saveCart(cart);
  alert("Added to cart");
  loadCart();
}

// ---------------- LOAD CART ----------------
function loadCart() {
  const cart = getCart();
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("total");
  if (!box || !totalBox) return;

  let total = 0;
  box.innerHTML = "";

  cart.forEach((item, i) => {
    total += Number(item.price) || 0;
    box.innerHTML += `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>₹${item.price}</p>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  totalBox.innerText = total.toFixed(2);
}

// ---------------- REMOVE ITEM ----------------
function removeItem(i) {
  const cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  loadCart();
}

// ---------------- GO TO CHECKOUT ----------------
function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }
  window.location.href = "checkout.html";
}

// ---------------- PLACE ORDER ----------------
async function placeOrder(e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const name = document.getElementById("buyerName")?.value.trim();
  const phone = document.getElementById("buyerPhone")?.value.trim();
  const address = document.getElementById("buyerAddress")?.value.trim();

  if (!name || !phone || !address) {
    alert("Fill all fields");
    return;
  }

  const order = { buyer: name, phone, address, items: cart };

  try {
    const res = await fetch(`${API}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const data = await res.json();
    if (data.success) {
      alert("Order placed successfully (COD)");
      saveCart([]);
      window.location.href = "index.html";
    } else {
      alert("Failed to place order");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to place order");
  }
}

// ---------------- LOAD ORDERS (SHOPKEEPER) ----------------
async function loadOrders() {
  const list = document.getElementById("orderList");
  if (!list) return;

  try {
    const res = await fetch(`${API}/orders`);
    const orders = await res.json();

    list.innerHTML = "";

    orders.forEach(o => {
      let itemsHTML = "<p>No items</p>";
      try {
        const items = JSON.parse(o[4] || "[]");
        if (items.length) {
          itemsHTML = items.map(i => `<p>• ${i.name} - ₹${i.price}</p>`).join("");
        }
      } catch {}

      list.innerHTML += `
        <div class="cart-item">
          <h4>Order #${o[0]}</h4>
          <p><b>Name:</b> ${o[1]}</p>
          <p><b>Phone:</b> ${o[2]}</p>
          <p><b>Address:</b> ${o[3]}</p>
          ${itemsHTML}
          <p><b>Status:</b> ${o[5]}</p>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load orders");
  }
}

// ---------------- AUTO LOAD ----------------
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCart();
  if (document.getElementById("orderList")) loadOrders();
});

