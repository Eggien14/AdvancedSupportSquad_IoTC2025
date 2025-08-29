class ProductInfoPanel {
  constructor(container, shadowRoot) {
    this.container = container;
    this.shadowRoot = shadowRoot;
    this.panelEl = null;
    this.ensureStyle();
  }

  ensureStyle() {
    if (this.shadowRoot.querySelector('style[data-panel-style]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-panel-style', '');
    style.textContent = `
      .product-info-panel {
        position: absolute;
        top: 0;
        right: -400px; 
        background: white;
        border: 2px solid #ccc;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
        transition: right 0.3s ease-in-out;
        width: 450px; 
      }

      .product-info-panel.show {
        right: -440px; 
      }

      /* Cách panel 1 đoạn so với giỏ hàng */
      .product-info-panel.desktop {
        right: -475px;
      }

      /* Mobile: panel full màn hình khi trượt ra */
      @media (max-width: 768px) {
        .product-info-panel {
          position: fixed;
          right: -100%;
          top: 0;
          width: 100%;
          height: 100%;
          border-radius: 0;
          margin-left: 0;
        }
        .product-info-panel.show {
          right: 0;
        }
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .panel-header h2 {
        font-size: 24px;
        font-weight: bold;
        margin: 0;
      }
      .close-btn {
        cursor: pointer;
        font-size: 20px;
      }
      .product-img {
        width: 250px; 
        align-self: center;
        border-radius: 5px;
        border: 2px solid #ddd;
      }
      .barcode {
        display: block;
        margin: 8px auto;
        width: 200px;
        max-height: 70px;
        object-fit: fill;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
      }
      .info-table th {
        text-align: left;
        padding: 6px;
        font-weight: bold;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
        width: 40%;
      }
      .info-table td {
        padding: 6px;
        border-bottom: 1px solid #ddd;
      }
      .desc {
        margin-top: 8px;
        font-size: 14px;
        line-height: 1.4;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  render(product) {
    if (!this.panelEl) {
      this.panelEl = document.createElement('div');
      this.panelEl.classList.add('product-info-panel', 'desktop');
      this.container.appendChild(this.panelEl);
    }

    const imgSrc = `/local/product_pic/${Number(product.id)}.jpg`;
    const barcodeSrc = `/local/product_pic/barcode.jpg`;
    const price = product.price ? Number(product.price).toLocaleString() + '₫' : '-';

    const tableRows = [];
    tableRows.push(`<tr><th>Brand</th><td>${product.brand || '-'}</td></tr>`);
    tableRows.push(`<tr><th>Origin</th><td>${product.origin || '-'}</td></tr>`);
    tableRows.push(`<tr><th>Price</th><td>${price}</td></tr>`);
    for (let i = 1; i <= 4; i++) {
      const key = `des_${i}`;
      if (product[key]) {
        const parts = product[key].split(',');
        tableRows.push(`<tr><th>${parts[0] || ''}</th><td>${parts[1] || ''}</td></tr>`);
      }
    }

    this.panelEl.innerHTML = `
      <div class="panel-header">
        <h2>${product.name || ''}</h2>
        <span class="close-btn">&times;</span>
      </div>
      <img class="product-img" src="${imgSrc}" onerror="this.src='/local/placeholder.png'">
      <img class="barcode" src="${barcodeSrc}" alt="Barcode" onerror="this.src='/local/placeholder-barcode.png'">
      <table class="info-table">${tableRows.join('')}</table>
      <div class="desc">${product.des_5 || ''}</div>
    `;

    // Bắt sự kiện đóng
    this.panelEl.querySelector('.close-btn').addEventListener('click', () => {
      this.panelEl.classList.remove('show');
    });

    // Show panel
    requestAnimationFrame(() => {
      this.panelEl.classList.add('show');
    });
  }
}

export default ProductInfoPanel;
