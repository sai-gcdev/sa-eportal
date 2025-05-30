document.addEventListener('DOMContentLoaded', function () {
  const paymentForm = document.getElementById('payment-form');
  const paymentFields = document.getElementById('payment-fields');
  const paymentFormTitle = document.getElementById('payment-form-title');
  const loadingIndicator = document.getElementById('loading-indicator');

  // Get payment method and total cost from localStorage
  const paymentMethod = localStorage.getItem('paymentMethod');
  const totalCost = localStorage.getItem('cartTotal');

  // Dynamically generate payment form based on payment method
  if (paymentMethod === 'credit-card') {
    paymentFormTitle.textContent = 'Enter Credit Card Details';
    paymentFields.innerHTML = `
      <label for="card-number">Card Number</label>
      <input type="number" id="card-number" placeholder="XXXX-XXXX-XXXX-XXXX" required />
      <label for="expiry-date">Expiry Date</label>
      <input type="text" id="expiry-date" placeholder="MM/YY" required />
      <label for="cvv">CVV</label>
      <input type="number" id="cvv" placeholder="123" required />
    `;
  } else if (paymentMethod === 'upi') {
    paymentFormTitle.textContent = 'Enter UPI ID';
    paymentFields.innerHTML = `
      <label for="upi-id">UPI ID</label>
      <input type="text" id="upi-id" placeholder="yourname@bank" required />
    `;
  }

  // Payment form submission
  paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    loadingIndicator.style.display = 'block';
    paymentForm.style.display = 'none';

    // Simulate payment processing
    setTimeout(function () {
      loadingIndicator.style.display = 'none';
      // Redirect to order summary page with total cost
      window.location.href = `order-summary.html?total=${totalCost}`;
    }, 3000);
  });
});