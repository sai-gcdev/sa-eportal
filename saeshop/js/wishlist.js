const wishlistList = document.getElementById('wishlist-list');
const emptyMsg = document.getElementById('empty-msg');
const clearBtn = document.getElementById('clear-wishlist-btn');

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

function renderWishlist() {
  const wishlist = getWishlist();
  const cart = getCart();
  wishlistList.innerHTML = '';
  if (wishlist.length === 0) {
    emptyMsg.style.display = '';
    return;
  }
  emptyMsg.style.display = 'none';
  wishlist.forEach((p, idx) => {
    const inCart = cart.some(c => c.name === p.name);
    const div = document.createElement('div');
    div.className = 'wishlist-item';
    div.innerHTML = `
      <button class="remove-btn" title="Remove">&#10006;</button>
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p><strong>Category:</strong> ${p.category}</p>
      <p><strong>Price:</strong> ₹${p.price}</p>
      <button class="add-cart-btn"${inCart ? ' disabled' : ''}>${inCart ? 'Added to Cart' : 'Add to Cart'}</button>
    `;
    div.querySelector('.remove-btn').onclick = () => {
      let arr = getWishlist();
      arr.splice(idx, 1);
      setWishlist(arr);
      renderWishlist();
    };
    div.querySelector('.add-cart-btn').onclick = () => {
      if (inCart) return;
      let cartArr = getCart();
      cartArr.push({ ...p, quantity: 1 });
      setCart(cartArr);
      renderWishlist();
    };
    wishlistList.appendChild(div);
  });
}

clearBtn.onclick = function() {
  setWishlist([]);
  renderWishlist();
};

renderWishlist();