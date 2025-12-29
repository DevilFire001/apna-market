const API = "https://apna-market-backend.onrender.com";

/* ---------------- CART STORAGE ---------------- */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ---------------- LOAD PRODUCTS ---------------- */
async function loadProducts() {
  const list = document.getElementById("productList");
  if (!list) return;

  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    list.innerHTML = "";

    products.forEach(p => {
      list.innerHTML += `
        <div class="product">
          <img src="${p.image || 'https://via.placeholder.com/150'}">
          <h4>${p.name}</h4>
          <p>₹${p.price}</p>
          <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">
            Add
          </button>
        </div>
      `;
    });
  } catch (err) {
    console.error("Product load failed", err);
  }
}

/* ---------------- ADD TO CART ---------------- */
function addToCart(id, name, price) {
  const cart = getCart();
  cart.push({ id, name, price });
  saveCart(cart);
  alert("Added to cart");
}

/* ---------------- LOAD CART ---------------- */
function loadCart() {
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("total");
  if (!box || !totalBox) return;

  const cart = getCart();
  box.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += Number(item.price);
    box.innerHTML += `
      <div class="cart-item">
        <h4>${item.name}</h4>
        <p>₹${item.price}</p>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  totalBox.innerText = total;
}

/* ---------------- REMOVE ITEM ---------------- */
function removeItem(i) {
  const cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  loadCart();
}

/* ---------------- CHECKOUT ---------------- */
function goToCheckout() {
  if (getCart().length === 0) {
    alert("Cart is empty");
    return;
  }
  window.location.href = "checkout.html";
}

/* ---------------- PLACE ORDER ---------------- */
async function placeOrder(e) {
  e.preventDefault();

  const cart = getCart();
  if (!cart.length) return alert("Cart empty");

  const order = {
    buyer: buyerName.value,
    phone: buyerPhone.value,
    address: buyerAddress.value,
    items: cart
  };

  const res = await fetch(`${API}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });

  const data = await res.json();
  if (data.success) {
    alert("Order placed");
    saveCart([]);
    location.href = "index.html";
  }
}

/* ---------------- AUTO LOAD SAFE ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productList")) loadProducts();
  if (document.getElementById("cartItems")) loadCart();
});

