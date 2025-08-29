import ProductInfoPanel from './product-info-modal-v4.js';

class ShoppingCartCard extends HTMLElement {
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
           /*=============== Shopping cart ===============*/
          :host { font-family: Roboto, "Helvetica Neue", Arial; display:block; }
          .card {
            border-radius:8px; padding:16px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            background:#fff; color:#222;
          }
          .title { font-size:18px; font-weight:600; margin-bottom:12px; }

          
          .items {
            display:flex; flex-direction:column; gap:15px;
            max-height:450px; overflow-y:auto; 
            padding-right:7px;
          }
            /*=============== Scroll bar ===============*/
          .items::-webkit-scrollbar {
            width: 2px; /* mỏng hơn */
            }

          .items::-webkit-scrollbar-track {
            background: transparent; /* nền trong suốt */
            }

          .items::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.03); /* màu đen mờ */
            border-radius: 2px;
            }

          .items::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.2); /* đậm hơn khi hover */
            }
            /*=============== Product grid ===============*/
          .item {
            display:flex; gap:15px; align-items:center;
            border-bottom:1px solid #ddd; padding-bottom:12px; cursor:pointer;
            transition: background 0.3s;
            border-radius:7px;
          }
          
          .item:hover { background: #f1f1f1; }

          /*=============== Text ===============*/
          .thumb { width:72px; height:72px; border-radius:6px; object-fit:cover; background:#fafafa; border:2px solid #eee; }
          .meta { flex:1; }
          .name { font-weight:600; margin-bottom:4px; font-size:16px; }
          .qty-price { display:flex; gap:20px; align-items:center; color:#333; font-size:14px; }
          .subtotal { font-weight:700; color:#111; }
          .right { text-align:right; min-width:110px; padding-right:6px;}
          .footer { display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px solid #eee; padding-top:12px; }
          .total { font-weight:700; font-size:16px; }
          .btn { padding:10px 16px; border-radius:6px; cursor:pointer; border: none; font-size:15px; }
          .btn-checkout { background:#28a745; color:white; }
          .btn-clear { background:#f3f3f3; color:#333; }

          /*=============== Modal ===============*/
          .modal {
            position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center;
            z-index:9999;
          }

          .modal-content {
            background:white; padding:20px; border-radius:8px; max-width:80%; max-height:80%;
          }

          .modal-content img { max-width:100%; max-height:100%; display:block; margin:auto; }

          /*=============== Empty cart ===============*/
          .empty {
            color:#777; padding:20px 0; text-align:center;
            display:flex; flex-direction:column; align-items:center; gap:12px;
          }

          .empty img { width:140px; max-width:100%; opacity:0.9;}
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
        itemsHTML = products.map(p => {
          const img = `/local/product_pic/${Number(p.id)}.jpg`;
          const name = p.name || `#${p.id}`;
          const qty = p.quantity || 0;
          const price = typeof p.price !== 'undefined' ? Number(p.price).toLocaleString() + '₫' : '-';
          const subtotal = typeof p.subtotal !== 'undefined' ? Number(p.subtotal).toLocaleString() + '₫' : '-';
          return `
          <div class="item" data-img="${img}">
            <img class="thumb" src="${img}" onerror="this.src='/local/placeholder.png'">
            <div class="meta">
              <div class="name">${name}</div>
              <div class="qty-price">
                <div>Giá: ${price}</div>
                <div>• Số lượng: ${qty}</div>
              </div>
            </div>
            <div class="right">
              <div class="subtotal">${subtotal}</div>
            </div>
          </div>
          `;
        }).join('');
      }
  
      const html = `
        ${style}
        <div class="card">
          <div class="title">Giỏ Hàng</div>
          <div class="items">
            ${itemsHTML}
          </div>
          <div class="footer">
            <div class="total">Tổng: <span>${Number(total).toLocaleString()}₫</span></div>
            <div>
              <button class="btn btn-checkout" id="checkout">Go to checkout</button>
            </div>
          </div>
        </div>
        <div id="modal" class="modal" style="display:none;">
          <div class="modal-content">
            <img id="modal-img" src="">
          </div>
        </div>
      `;
  
      this.shadowRoot.innerHTML = html;

      //Khởi tạo panel chứa thông tin sản phẩm
      const panel = new ProductInfoPanel(this.shadowRoot.querySelector('.card'),this.shadowRoot);
      
      // Nút checkout
      this.shadowRoot.getElementById('checkout')?.addEventListener('click', () => {
        this._callService('browser_open_url', { url: '/dashboard-test/checkout' });
      });
  
      // Click thông tin sản phẩm
      // this.shadowRoot.querySelectorAll('.item').forEach(item => {
      //   item.addEventListener('click', () => {
      //     const img = item.dataset.img;
      //     const modal = this.shadowRoot.getElementById('modal');
      //     this.shadowRoot.getElementById('modal-img').src = img;
      //     modal.style.display = 'flex';
      //   });
      // });

      // Click thông tin sản phẩm
      this.shadowRoot.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', () => {
          const img = item.dataset.img;
          const p = products.find(prod => `/local/product_pic/${Number(prod.id)}.jpg` === img);
          if (!p) return;
          panel.render(p);
        });
      });

      // Đóng modal khi click ra ngoài
      this.shadowRoot.getElementById('modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
          e.target.style.display = 'none';
        }
      });
    }
  
    _callService(service, data) {
      const [domain, svc] = service.split('.');
      if (!this._hass) return;
      this._hass.callService(domain, svc, data);
    }
  
    getCardSize() {
      return 3;
    }
  }
  
  customElements.define('shopping-cart-card', ShoppingCartCard);