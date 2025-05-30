document.addEventListener('DOMContentLoaded', function () {
  const sameAsBilling = document.getElementById('same-as-billing');
  const deliveryFormContainer = document.getElementById('delivery-form-container');
  const billingForm = document.getElementById('billing-form');
  const summarySection = document.getElementById('summary-section');
  const paymentOptionsSection = document.getElementById('payment-options-section');

  // Show/hide delivery form
  sameAsBilling.addEventListener('change', function () {
    deliveryFormContainer.style.display = this.checked ? 'none' : 'block';
    Array.from(deliveryFormContainer.querySelectorAll('input')).forEach(input => {
      input.required = !this.checked;
    });
  });

  // On billing form submit, show summary and payment options
  billingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const billing = {
      name: document.getElementById('billing-name').value,
      email: document.getElementById('billing-email').value,
      address: document.getElementById('billing-address').value,
      city: document.getElementById('billing-city').value,
      zip: document.getElementById('billing-zip').value,
      country: document.getElementById('billing-country').value
    };

    let delivery;
    if (sameAsBilling.checked) {
      delivery = { ...billing };
      delete delivery.email;
    } else {
      delivery = {
        name: document.getElementById('delivery-name').value,
        address: document.getElementById('delivery-address').value,
        city: document.getElementById('delivery-city').value,
        zip: document.getElementById('delivery-zip').value,
        country: document.getElementById('delivery-country').value
      };
    }

    let totalCost = localStorage.getItem('cartTotal') || '0.00';
    totalCost = parseFloat(totalCost).toFixed(2);

    summarySection.innerHTML = `
      <h2>Order Summary</h2>
      <div class="summary-item"><strong>Billing Information</strong><br>
        ${billing.name}<br>
        ${billing.email}<br>
        ${billing.address}, ${billing.city}, ${billing.zip}, ${billing.country}
      </div>
      <div class="summary-item"><strong>Delivery Information</strong><br>
        ${delivery.name}<br>
        ${delivery.address}, ${delivery.city}, ${delivery.zip}, ${delivery.country}
      </div>
      <div class="summary-item"><strong>Total Cost:</strong> Rs ${totalCost}</div>
    `;

    billingForm.style.display = 'none';
    summarySection.style.display = 'block';
    paymentOptionsSection.style.display = 'block';
  });

  // Payment option selection
  paymentOptionsSection.addEventListener('click', function (e) {
    const paymentOption = e.target.closest('.payment-option');
    if (paymentOption) {
      const paymentMethod = paymentOption.dataset.paymentMethod;
      // Store payment method in localStorage
      localStorage.setItem('paymentMethod', paymentMethod);
      // Redirect to payment page
      window.location.href = 'payment.html';
    }
  });
});