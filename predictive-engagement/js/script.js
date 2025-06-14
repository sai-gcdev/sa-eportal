const productList = document.getElementById('product-list');
const categoryFilter = document.getElementById('category');
const priceFrom = document.getElementById('price-from');
const priceTo = document.getElementById('price-to');
const filterBtn = document.getElementById('filter-btn');
const modal = document.getElementById('product-modal');
const modalName = document.getElementById('modal-name');
const modalCategory = document.getElementById('modal-category');
const modalPrice = document.getElementById('modal-price');
const modalImage = document.getElementById('modal-image');
const wishlistBtn = document.getElementById('wishlist-btn');
const addCartBtn = document.getElementById('add-cart-btn');

let currentProduct = null;

function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
}
function setWishlist(arr) {
  localStorage.setItem('wishlist', JSON.stringify(arr));
}
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function setCart(arr) {
  localStorage.setItem('cart', JSON.stringify(arr));
}

function renderProducts(filterCategory, from, to) {
  productList.innerHTML = '';
  let filtered = products;
  if (filterCategory && filterCategory !== 'All') {
    filtered = filtered.filter(p => p.category === filterCategory);
  }
  if (from !== '' && !isNaN(from)) {
    filtered = filtered.filter(p => p.price >= Number(from));
  }
  if (to !== '' && !isNaN(to)) {
    filtered = filtered.filter(p => p.price <= Number(to));
  }
  if (filtered.length === 0) {
    productList.innerHTML = '<p>No products found.</p>';
    return;
  }
  filtered.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
    `;
    div.onclick = () => openModal(p);
    productList.appendChild(div);
  });
}

function openModal(product) {
  currentProduct = product;
  modalName.textContent = product.name;
  modalCategory.textContent = product.category;
  modalPrice.textContent = `₹${product.price}`;
  modalImage.src = product.image;

  // Wishlist heart
  const wishlist = getWishlist();
  const inWishlist = wishlist.some(p => p.name === product.name);
  wishlistBtn.innerHTML = inWishlist ? '&#10084;' : '&#9825;';
  wishlistBtn.className = 'heart-btn ' + (inWishlist ? 'red' : 'white');
  wishlistBtn.disabled = false;

  // Add to cart button (only disabled if already in cart)
  const cart = getCart();
  const inCart = cart.some(p => p.name === product.name);
  addCartBtn.disabled = inCart;
  addCartBtn.textContent = inCart ? 'Added to Cart' : 'Add to Cart';

  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
  currentProduct = null;
}

wishlistBtn.onclick = function(e) {
  e.stopPropagation();
  if (!currentProduct) return;
  let wishlist = getWishlist();
  const idx = wishlist.findIndex(p => p.name === currentProduct.name);
  if (idx === -1) {
    wishlist.push(currentProduct);
  } else {
    wishlist.splice(idx, 1);
  }
  setWishlist(wishlist);
  openModal(currentProduct);
};

addCartBtn.onclick = function(e) {
  e.stopPropagation();
  if (!currentProduct) return;
  let cart = getCart();
  if (!cart.some(p => p.name === currentProduct.name)) {
    cart.push({ ...currentProduct, quantity: 1});
    setCart(cart);
    openModal(currentProduct);
    console.log("inside add cart button on click");
    localStorage.removeItem('cartStartTimeFor' + currentProduct.name);
    // Set time for cart timeout watcher
    console.log("inside set time");
    localStorage.setItem('cartStartTimeFor' + currentProduct.name, Date.now());
    startCartTimeoutWatcher(currentProduct);

    // Send Genesys event for cart update (add)
    sendCartUpdateEvent();
  }
};

function removeFromCart(productName) {
  let cart = getCart();
  const idx = cart.findIndex(p => p.name === productName);
  if (idx !== -1) {
    cart.splice(idx, 1);
    setCart(cart);
    // Send Genesys event for cart update (remove)
    sendCartUpdateEvent();
  }
}

categoryFilter.addEventListener('change', () => {
  renderProducts(
    categoryFilter.value,
    priceFrom.value.trim(),
    priceTo.value.trim()
  );
});

filterBtn.addEventListener('click', () => {
  renderProducts(
    categoryFilter.value,
    priceFrom.value.trim(),
    priceTo.value.trim()
  );
});

[priceFrom, priceTo].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      renderProducts(
        categoryFilter.value,
        priceFrom.value.trim(),
        priceTo.value.trim()
      );
    }
  });
});

window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
};

function startCartTimeoutWatcher(currentProduct) {
  const interval = setInterval(() => {
    const startTime = parseInt(localStorage.getItem('cartStartTimeFor' + currentProduct.name), 10);
    const cart = getCart();
    
    if (!startTime || cart.length === 0) {
      clearInterval(interval);
      return;
    }

    const now = Date.now();
    const elapsed = now - startTime;
    console.log("Inside watcher");
    if (elapsed >= 1 * 30 * 1000) { 
      console.log("will call genesys function for " + currentProduct.name);
      sendGenesysEvent(currentProduct.name);
      localStorage.removeItem('cartStartTimeFor' + currentProduct.name);
      clearInterval(interval);
    }
  }, 5000); // Check every 5 seconds
}

function sendGenesysEvent(productName) {
  console.log("Sending event to Genesys: Cart idle for 30 seconds");
  console.log("inside send genesys event " + productName);
  if (typeof Genesys === "function") {
    Genesys("command", "Journey.record", {
      eventName: "CartTimeout",
      customAttributes: {
        product: productName
      },
      traitsMapper: []
    });
    console.log("event sent");
  } else {
    console.warn("Genesys function not available!");
  }
}

// Send cart update event to Genesys with all product details
function sendCartUpdateEvent() {
  try {
    const cart = getCart();
    console.log("[CartUpdate] Cart contents:", cart);
    if (typeof Genesys === "function") {
      Genesys("command", "Journey.record", {
        eventName: "CartUpdated",
        customAttributes: {
          CartProducts: JSON.stringify(cart) // Send as string, not array!
        },
        traitsMapper: []
      });
      console.log("[CartUpdate] CartUpdated event sent to Genesys:", cart);
    } else {
      console.warn("[CartUpdate] Genesys function not available!");
    }
  } catch (e) {
    console.warn("[CartUpdate] Failed to send CartUpdated event:", e);
  }
}

// Initial render
renderProducts('All', '', '');