import { db } from "../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table") || "Unknown";
document.getElementById("table-info").innerText = `Table: ${tableNumber}`;

const menuDiv = document.getElementById("menu");
const cartItemsEl = document.getElementById("cart-items");
const totalEl = document.getElementById("total");

let cart = [];

async function loadMenu() {
  const querySnapshot = await getDocs(collection(db, "menu"));
  querySnapshot.forEach(doc => {
    const item = doc.data();
    if (!item.available) return;

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.image}" />
      <h4>${item.name}</h4>
      <p>₹${item.price}</p>
      <button>Add</button>
    `;
    div.querySelector("button").onclick = () => addToCart(item);
    menuDiv.appendChild(div);
  });
}

function addToCart(item) {
  const existing = cart.find(i => i.name === item.name);
  existing ? existing.qty++ : cart.push({ ...item, qty: 1 });
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach(i => {
    total += i.price * i.qty;
    const li = document.createElement("li");
    li.textContent = `${i.name} x${i.qty}`;
    cartItemsEl.appendChild(li);
  });
  totalEl.innerText = total;
}

document.getElementById("placeOrder").onclick = async () => {
  if (cart.length === 0) return alert("Cart empty");

  await addDoc(collection(db, "orders"), {
    table: tableNumber,
    items: cart,
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    status: "Received",
    time: serverTimestamp()
  });

  alert("Order placed!");
  cart = [];
  renderCart();
};

loadMenu();
