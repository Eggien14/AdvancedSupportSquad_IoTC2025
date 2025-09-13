// shopping-cart-card-v2.js
import ApiConfig from '/local/api-config.js';
class ShoppingCartCard extends HTMLElement {
  setConfig(config) {
    this.config = Object.assign({ cart_id: null }, config);
    if (!this.config.cart_id) throw new Error("Please define cart_id");
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._ws) this._connectWS();
    this.render();
  }

  _connectWS() {
    // const apiBase = this._hass.states["input_text.api_base"]?.state;
    const apiBase = ApiConfig.getApiBaseAuto();
    if (!apiBase) {
      console.warn("Missing input_text.api_base");
      return;
    }
    const proto = apiBase.startsWith("https") ? "wss" : "ws";
    const wsUrl = apiBase.replace(/^http/, proto) + `/ws/cart_inventory/${this.config.cart_id}`;

    this._ws = new WebSocket(wsUrl);
    this._ws.onopen = () => console.log("WS connected:", wsUrl);
    this._ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        this._cartData = payload;
        this.render();
      } catch (e) {
        console.warn("WS parse error", e);
      }
    };
    this._ws.onclose = () => {
      console.log("WS closed, retrying...");
      this._ws = null;
      setTimeout(() => this._connectWS(), 2000);
    };
  }

  render() {
    if (!this.shadowRoot) return;
    const products = this._cartData?.items || [];
    const total = this._cartData?.total || 0;

    const style = `
      <style>
        :host { font-family: Roboto, "Helvetica Neue", Arial; display:block; font-size:16px; transform: scale(0.95); transform-origin: top left}
        .card {
          border-radius:10px; padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.15);
          background:#fff; color:#222; 
          max-width: 850px; margin:auto;
          display:flex; flex-direction:column;
        }
        .title { font-size:20px; font-weight:700; margin-bottom:16px; }

        .header-row {
          display:grid;
          grid-template-columns: minmax(220px, 2fr) 120px 120px 100px;
          font-weight:700; 
          font-size:17px;   /* to hơn một chút */
          padding:8px 4px; border-bottom:2px solid #ccc;
          color:#222;       /* đậm hơn */
          text-align:center;
        }
        .header-row div:first-child { text-align:left; }
        .header-row div:last-child { text-align:right; }

        .items { flex:1; display:flex; flex-direction:column; gap:8px; min-height:600px; max-height:600px; overflow-y:auto; }
        .items::-webkit-scrollbar { width:6px; }
        .items::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:4px; }

        .item {
          display:grid;
          grid-template-columns: minmax(220px, 2fr) 120px 120px 100px;
          align-items:center;
          border-bottom:1px solid #ddd;
          padding:12px 4px;
          text-align:center;
        }
        .item > div:first-child { justify-content:flex-start; text-align:left; }

        .thumb { width:70px; height:70px; border-radius:6px; object-fit:cover; border:1px solid #ccc; background:#fafafa; }
        .meta { display:flex; flex-direction:column; gap:4px; text-align:left; }
        .name { font-weight:800; font-size:18px; word-break:break-word; } /* to & đậm hơn */
        .price-under { font-size:15px; color:#555; }
        .price-under::before { content:"Price: "; font-weight:600; color:#333; } /* thêm chữ Price */

        .subtotal { font-size:16px; font-weight:700; color:#666; text-align:center; }

        .quantity { display:flex; justify-content:center; }

        .qty-control { display:flex; align-items:center; gap:6px; }
        .qty-control button {
          width:32px; height:32px; font-size:16px; font-weight:bold;
          border:2px solid #ccc; border-radius:6px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
        }
        .qty-control .btn-dec { background:#fff; color:#c00; border-color:#c00; }
        .qty-control .btn-inc { background:#fff; color:#080; border-color:#080; }
        .qty-control .qty-val { min-width:32px; height:32px; line-height:32px; text-align:center; font-size:16px; font-weight:700; }

        .weight-input {
          width:70px; height:32px; font-size:16px; font-weight:700;
          border:2px solid #ccc; border-radius:6px; background:#f2f2f2; color:#000; text-align:center;
        }

        /* Action buttons */
        .actions { display:flex; flex-direction:column; gap:6px; align-items:flex-end; }
        .btn-del { 
        background:#c00; 
        color:#fff; 
        border:2px solid #c00; 
        width:46px; 
        height:40px; 
        font-size:24px; 
        border-radius:8px; 
        cursor:pointer; 
        display:flex; align-items:center; justify-content:center; 
        }

        .footer {
          display:flex; justify-content:space-between; align-items:center;
          margin-top:16px; border-top:2px solid #ddd; padding-top:14px;
          flex-direction: row-reverse; /* đảo vị trí */
        }
        .total { font-weight:600; font-size:20px; }
        .btn { padding:10px 18px; border-radius:8px; cursor:pointer; border:none; font-size:16px; }
        .btn-checkout { background:#28a745; color:white; }

        @media (max-width: 900px) {
          .header-row, .item {
            grid-template-columns: minmax(150px, 2fr) 80px 80px 70px;
          }
          .thumb { width: 55px; height: 55px; }   /* thu nhỏ ảnh */
          .name { font-size: 16px; }              /* chữ nhỏ lại */
          .btn-del { width: 38px; height: 36px; font-size: 20px; } /* nút gọn hơn */
        }
      </style>
    `;

    let itemsHTML = '';
    if (products.length === 0) {
      itemsHTML = `
        <div class="empty">
          <img src="/local/empty-cart.jpg" alt="Empty Cart">
          <div>Empty cart! Go get something </div>
        </div>`;
    } else {
      itemsHTML = `
        <div class="header-row">
          <div>Item</div>
          <div>Quantity</div>
          <div>Total</div>
          <div>Action</div>
        </div>
      ${products.map(p => {
        const img = `/local/product_pic/${Number(p.product_id)}.jpg`;
        const name = p.name || `#${p.product_id}`;
        const qty = p.quantity || 0;
        const price = p.price ? Number(p.price).toLocaleString() + '₫' : '-';
        const subtotal = p.subtotal ? Number(p.subtotal).toLocaleString() + '₫' : '-';
    
        let qtyControl = '';
        if (parseFloat(p.weight_kg) === 0) {
          qtyControl = `
            <div class="qty-control" data-id="${p.product_id}">
              <button class="btn-dec">-</button>
              <span class="qty-val">${qty}</span>
              <button class="btn-inc">+</button>
            </div>`;
        } else {
          qtyControl = `<input class="weight-input" type="number" step="0.01" min="0" value="${qty}" data-id="${p.product_id}">`;
        }
    
        return `
          <div class="item" data-id="${p.product_id}">
            <div class="item-info" style="display:flex;align-items:center;gap:10px;cursor:pointer;">
              <img class="thumb" src="${img}" onerror="this.src='/local/product_pic/placeholder.png'">
              <div class="meta">
                <div class="name">${name}</div>
                <div class="price-under">${price}</div>
              </div>
            </div>
            <div class="quantity">${qtyControl}</div>
            <div class="subtotal">${subtotal}</div>
            <div class="actions">
              <button class="btn-del">🗑</button>
            </div>
          </div>`;
      }).join('')}
    `;
    }

    const html = `
      ${style}
      <div class="card">
        <div class="title">Shopping List</div>
        <div class="items">${itemsHTML}</div>
        <div class="footer">
          <div class="total">Total: <span>${Number(total).toLocaleString()}₫</span></div>
          <div><button class="btn btn-checkout" id="checkout">Go to map</button></div>
        </div>
      </div>
    `;
    this.shadowRoot.innerHTML = html;

    // +/- listeners
    this.shadowRoot.querySelectorAll(".qty-control").forEach(ctrl => {
      const id = Number(ctrl.dataset.id);
      ctrl.querySelector(".btn-dec").addEventListener("click", () => {
        const valEl = ctrl.querySelector(".qty-val");
        let val = parseInt(valEl.textContent) - 1;
        if (val < 0) val = 0;
        this._updateQuantity(id, val);
      });
      ctrl.querySelector(".btn-inc").addEventListener("click", () => {
        const valEl = ctrl.querySelector(".qty-val");
        let val = parseInt(valEl.textContent) + 1;
        this._updateQuantity(id, val);
      });
    });

    // weight input
    this.shadowRoot.querySelectorAll(".weight-input").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const id = Number(e.target.dataset.id);
        const val = parseFloat(e.target.value) || 0;
        this._updateQuantity(id, val);
      });
    });

    this.shadowRoot.querySelectorAll(".item-info").forEach(div => {
      div.addEventListener("click", (e) => {
        const id = Number(div.closest(".item").dataset.id);
        window.dispatchEvent(new CustomEvent("product-info:show", {
          detail: { productId: id, cartId: this.config.cart_id }
        }));
      });
    });
    // delete double confim
    this.shadowRoot.querySelectorAll(".btn-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.target.closest(".item").dataset.id);
        if (confirm("Do you want to remove this product from current shopping list?")) {
          this._removeItem(id);
        }
      });
    });

  }

  async _updateQuantity(productId, quantity) {
    // const apiBase = this._hass.states["input_text.api_base"]?.state;
    const apiBase = ApiConfig.getApiBaseAuto();
    if (!apiBase) return;
    const url = `${apiBase}/cart_inventory/${this.config.cart_id}/items`;

    const payload = {
      mode: "merge",
      items: [{ product_id: productId, quantity }]
    };

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Update failed", e);
    }
  }

  async _removeItem(productId) {
    // const apiBase = this._hass.states["input_text.api_base"]?.state;
    const apiBase = ApiConfig.getApiBaseAuto();
    if (!apiBase) return;
    const url = `${apiBase}/cart_inventory/${this.config.cart_id}/items`;

    const payload = {
      mode: "merge",
      items: [{ product_id: productId, quantity: 0 }]
    };

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Delete failed", e);
    }
  }
}
customElements.define('shopping-cart-card', ShoppingCartCard);