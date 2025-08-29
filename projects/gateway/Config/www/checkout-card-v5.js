class CheckoutCard extends HTMLElement {
  setConfig(config) {
    this.config = Object.assign({ entity: 'sensor.shopping_cart_payload' }, config);
    if (!this.config.entity) throw new Error('Please define an entity');
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    const stateObj = hass.states[this.config.entity];
    this.render(stateObj);
  }

  render(stateObj) {
    if (!this.shadowRoot) return;

    const products = (stateObj && stateObj.attributes && stateObj.attributes.products) || [];
    const total = (stateObj && stateObj.state) || 0;

    const style = `
    <style>
      :host {
        font-family: Arial, sans-serif;
        display: block;
        background: white;
        color: black;
        padding: 20px;
        box-sizing: border-box;
        max-width: 1000px;
        margin: auto;
      }
      .container {
        display: flex;
        gap: 20px;
        height: 620px;
      }
      /* Cart */
      .cart {
        flex: 1.6;
        min-width: 340px;
        display: flex;
        flex-direction: column;
      }
      .section-title {
        font-size: 24px; 
        font-weight: bold;
        margin-bottom: 14px;
        text-align: left; 
      }
      .cart-items {
        flex: 1.3;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
      }
      .cart-items::-webkit-scrollbar {
        width: 2px;
      }
      .cart-items::-webkit-scrollbar-track {
        background: transparent;
      }
      .cart-items::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 2px;
      }
      .cart-items::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.2);
      }
      /* Summary */
      .summary {
        flex: none;
        width: 320px; 
        border: 2px solid #ccc;
        padding: 18px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-size: 16px; /* to hơn mặc định */
      }
      /* Mục sản phẩm */
      .item {
        display: flex;
        align-items: flex-start;
        border-bottom: 1px solid #eee;
        padding: 12px 0;
      }
      .item img {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #ccc;
        flex-shrink: 0;
      }
      .info {
        flex: 1;
        margin-left: 12px;
      }
      .name {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 8px;
      }
      .price-qty {
        font-size: 15px;
        color: #444;
        line-height: 1.5;
      }
      .price {
        font-weight: bold;
        min-width: 90px;
        text-align: right;
        font-size: 16px;
      }
      /* Tiêu đề Summary */
      .payment-header {
        text-align: center;
        font-size: 22px;
        font-weight: bold;
        padding-bottom: 6px;
        border-bottom: 2px solid #ccc;
      }
      /* QR */
      .qr-section {
        text-align: center;
      }
      .qr-title {
        font-size: 24px;
        font-weight: 600;
      }
      .qr-subtitle {
        font-size: 16px;
        color: #555;
        margin-bottom: 10px;
      }
      .qr img {
        max-width: 100%;
        width: 180px;
        border: 3px solid #000;
        border-radius: 8px;
      }
      /* Coupon code */
      .coupon-label {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 3px;
        display: block;
        text-align: center;
      }
      .discount-input {
        margin-bottom: 14px;
        display: flex;
        gap: 10px;
      }
      .discount-input input {
        flex: 1;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 6px;
        background: rgb(193, 193, 193);
        color: black;
      }
      .discount-input button {
        padding: 10px 14px;
        font-size: 16px;
        background: #28a745;
        border: none;
        color: white;
        border-radius: 6px;
        cursor: pointer;
      }
      .discount-input button:hover {
        background: #218838;
      }
      .divider {
        border-top: 2px solid #ccc;
        margin: 6px 0;
      }
      /* Tính tiền */
      .price-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .price-row {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 600
      }
      .price-row.total {
        font-size: 16px;
        font-weight: 600; /* nổi bật hơn */
      }
      .price-section .divider {
        border-top: 2px solid #ccc;
        margin: 6px 0;
      }
      /* Back button */
      .back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 10px 14px;
        background: #ccc;
        color: black;
        text-decoration: none;
        border-radius: 7px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .back:hover {
        background: #bbb;
      }
    </style>
    `;
    
    let itemsHTML = '';
    if (products.length === 0) {
      itemsHTML = `<p>Giỏ hàng trống</p>`;
    } else {
      itemsHTML = products.map(p => {
        const img = `/local/product_pic/${Number(p.id)}.jpg`;
        const price = typeof p.price !== 'undefined' ? Number(p.price).toLocaleString() + '₫' : '-';
        return `
          <div class="item">
            <img src="${img}" onerror="this.src='/local/placeholder.png'">
            <div class="info">
              <div class="name">${p.name}</div>
              <div class="price-qty">Giá: ${price}</div>
              <div class="price-qty">Số lượng: ${p.quantity}</div>
            </div>
            <div class="price">${Number(p.subtotal).toLocaleString()}₫</div>
          </div>
        `;
      }).join('');
    }
    
    const html = `
      ${style}
      <div class="container">
        <div class="cart">
          <div class="section-title">Shopping Cart</div>
          <div class="cart-items">${itemsHTML}</div>
          <a href="/dashboad-test/shopping-list" class="back">← Quay lại giỏ hàng</a>
        </div>

        <div class="summary">
          <div class="payment-header">Summary</div>
          <div class="qr-section">
            <div class="qr">
              <img src="/local/product_pic/qr.jpg" alt="QR Code">
            </div>
            <div class="qr-subtitle">Scan here to finish your payment</div>
          </div>
          <div class="divider"></div>
          <label class="coupon-label">Coupon code</label>
          <div class="discount-input">
            <input type="text" id="discount-code" placeholder="Enter discount code">
            <button id="apply-discount">Apply</button>
          </div>

          <div class="price-section">
            <div class="price-row">
              <span>Products:</span>
              <span id="products-price">${Number(total).toLocaleString()}₫</span>
            </div>
            <div class="price-row">
              <span>Discount:</span>
              <span id="discount-price">0₫</span>
            </div>
            <div class="divider"></div>
            <div class="price-row total">
              <span>Total amount (Inc VAT):</span>
              <span id="total-price">${Number(total).toLocaleString()}₫</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.shadowRoot.innerHTML = html;

    // Event: apply discount
    this.shadowRoot.getElementById('apply-discount')?.addEventListener('click', () => {
      const code = this.shadowRoot.getElementById('discount-code').value.trim();
      const productPrice = Number(total);
      let discount = 0;
      if (code.toLowerCase() === 'thonhoalanh36') {
        discount = productPrice * 0.1;
      }
      const finalPrice = productPrice - discount;
      this.shadowRoot.getElementById('discount-price').textContent = discount.toLocaleString() + '₫';
      this.shadowRoot.getElementById('total-price').textContent = finalPrice.toLocaleString() + '₫';
    });
  }
}

customElements.define('checkout-card', CheckoutCard);