// Chef Order Management — Production Version

// ==============================
// 1) DOM REFERENCES (connect JS to HTML)
// ==============================
const orderForm = document.querySelector("#orderForm");
const ingredientInput = document.querySelector("#ingredient");
const orderStatusMessage = document.querySelector("#orderStatusMessage");
const closeStatusMessage = document.querySelector("#closeStatusMessage");
const ordersList = document.querySelector("#ordersList");
const completeOrderForm = document.querySelector("#completeOrderForm");
const orderNumberInput = document.querySelector("#orderNumber");

// ==============================
// 2) HELPER: Format the user's input for the API
// ==============================
function formatIngredient(rawIngredient) {
  return rawIngredient.trim().toLowerCase().replace(/\s+/g, "_");
}

// ==============================
// 3) HELPER: Fetch meal data from TheMealDB API (async/await)
// ==============================
async function fetchMealsByIngredient(ingredient) {
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
    ingredient
  )}`;
  const response = await fetch(url);
  return response.json();
}

// ==============================
// 4) STATE + STORAGE (sessionStorage) to keep Active Kitchen Tickets after a page refresh
// ==============================
let orders = JSON.parse(sessionStorage.getItem("orders")) || [];

// Recover last ticket number (or derive from stored orders if missing)
let lastOrderNumber =
  Number(sessionStorage.getItem("lastOrderNumber")) ||
  orders.reduce((max, o) => Math.max(max, o.orderNumber || 0), 0);

// ==============================
// 5) UI HELPERS: show and clear messages
// ==============================
function setMessage(el, type, text) {
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`;
}

function clearMessages() {
  if (orderStatusMessage) orderStatusMessage.innerHTML = "";
  if (closeStatusMessage) closeStatusMessage.innerHTML = "";
}

// ==============================
// 6) HEADER UI: time + stats
// ==============================
function updateHeader() {
  const now = new Date();
  const formattedTime = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const activeCount = orders.filter((o) => !o.completed).length;
  const closedCount = orders.filter((o) => o.completed).length;
  const statsText = `${activeCount} active • ${closedCount} closed`;

  const ids = {
    currentTimeCard: formattedTime,
    ticketStatsCard: statsText
  };

  Object.entries(ids).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

updateHeader();

// ==============================
// 7) RENDER: display open tickets
// ==============================
function renderIncompleteOrders() {
  if (!ordersList) return;

  const incomplete = orders
    .filter((o) => !o.completed)
    .sort((a, b) => a.createdAt - b.createdAt);

  ordersList.innerHTML = "";
  ordersList.classList.add("list-group");

  if (incomplete.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted";
    li.textContent = "No open kitchen tickets.";
    ordersList.appendChild(li);
    return;
  }

  incomplete.forEach((order) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex gap-3 align-items-center";

    if (order.imageUrl) {
      const img = document.createElement("img");
      img.src = order.imageUrl;
      img.alt = order.description;
      img.className = "rounded";
      img.width = 56;
      img.height = 56;
      li.appendChild(img);
    }

    const infoDiv = document.createElement("div");
    infoDiv.className = "flex-grow-1";

    const titleDiv = document.createElement("div");
    titleDiv.className = "fw-semibold";
    titleDiv.textContent = `Ticket #${order.orderNumber}: ${order.description}`;

    const placedTime = new Date(order.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const waitMins = Math.floor((Date.now() - order.createdAt) / 60000);

    let statusColor = "bg-success";
    if (waitMins > 15) statusColor = "bg-danger";
    else if (waitMins > 10) statusColor = "bg-warning";

    const statusDot = document.createElement("span");
    statusDot.className = `rounded-circle ${statusColor}`;
    statusDot.style.width = "10px";
    statusDot.style.height = "10px";
    statusDot.style.display = "inline-block";
    statusDot.style.marginRight = "8px";
    titleDiv.prepend(statusDot);

    if (waitMins > 15) li.classList.add("ticket-priority");

    infoDiv.appendChild(titleDiv);

    const subtextDiv = document.createElement("div");
    subtextDiv.className = "text-muted small";
    subtextDiv.textContent = `placed ${placedTime} • waiting ${waitMins}m`;
    infoDiv.appendChild(subtextDiv);

    li.appendChild(infoDiv);
    ordersList.appendChild(li);
  });
}

// ==============================
// 8) EVENT: Create ticket (submit ingredient form)
// ==============================
if (orderForm) {
  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ingredientInput || !ingredientInput.value.trim()) return;

    clearMessages();

    const formattedIngredient = formatIngredient(ingredientInput.value);
    let data;

    try {
      data = await fetchMealsByIngredient(formattedIngredient);
    } catch {
      setMessage(orderStatusMessage, "danger", "Network error. Please try again.");
      return;
    }

    if (!data.meals) {
      setMessage(
        orderStatusMessage,
        "warning",
        `No meals found with ingredient "${ingredientInput.value}". Please try another ingredient.`
      );
      return;
    }

    const randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];

    const order = {
      description: randomMeal.strMeal,
      completed: false,
      orderNumber: lastOrderNumber + 1,
      createdAt: Date.now(),
      imageUrl: randomMeal.strMealThumb || "",
    };

    orders.push(order);
    lastOrderNumber++;

    sessionStorage.setItem("lastOrderNumber", String(lastOrderNumber));
    sessionStorage.setItem("orders", JSON.stringify(orders));

    setMessage(
      orderStatusMessage,
      "success",
      `Ticket #${order.orderNumber} created: ${order.description}`
    );

    renderIncompleteOrders();
    updateHeader();

    ingredientInput.value = "";
    ingredientInput.focus();
  });
}

// ==============================
// 9) EVENT: Close ticket (submit ticket number form)
// ==============================
if (completeOrderForm) {
  completeOrderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessages();

    if (!orderNumberInput) return;

    const num = Number(orderNumberInput.value);

    if (!Number.isInteger(num) || num < 0) {
      setMessage(closeStatusMessage, "danger", "Please enter a valid ticket number.");
      return;
    }

    if (num === 0) {
      setMessage(closeStatusMessage, "info", "No ticket closed.");
      return;
    }

    const order = orders.find((o) => o.orderNumber === num);

    if (!order) {
      setMessage(
        closeStatusMessage,
        "danger",
        `Ticket #${num} not found. Please enter a valid ticket number.`
      );
      return;
    }

    if (order.completed) {
      setMessage(closeStatusMessage, "warning", `Ticket #${num} is already closed.`);
      return;
    }

    order.completed = true;
    sessionStorage.setItem("orders", JSON.stringify(orders));

    renderIncompleteOrders();
    updateHeader();

    setMessage(closeStatusMessage, "success", `Ticket #${num} closed.`);

    orderNumberInput.value = "";
    orderNumberInput.focus();
  });
}

// ==============================
// 10) INITIAL LOAD + REFRESH LOOP
// ==============================
renderIncompleteOrders();
updateHeader();

// Re-run the render and header update every 30 seconds
// This keeps the waiting time and ticket counts up to date without refreshing the page
setInterval(() => {
  renderIncompleteOrders();
  updateHeader();
}, 30000);