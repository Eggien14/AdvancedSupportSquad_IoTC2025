/* product-info-card.js — Thuần HTMLElement, nguồn WS / hoặc REST theo product_id */
import ApiConfig from '/local/api-config.js';


class ProductInfoCard extends HTMLElement {
    setConfig(config) {
      this.config = Object.assign({
        cart_id: null,
        cart_id_entity: null,
        api_base: null,
        // api_base_entity: "input_text.api_base",
        // port: 8136,
        // scheme: "http",
        aspect_ratio: "56%"
      }, config);
  
      if (!this.config.cart_id && !this.config.cart_id_entity) {
        throw new Error("product-info-card: please set cart_id or cart_id_entity");
      }
  
      this._hass = null;
      this._ws = null;
      this._wsUrl = null;
  
      this._product = null;
      this._lastSig = null;
      this._mode = "live"; // "live" | "manual"
      this._manualProductId = null;
  
      this._reconnectDelay = 500;
      this._reconnectHandle = null;
  
      this._onShowEvent = (ev) => this._handleShowEvent(ev);
  
      this.attachShadow({ mode: "open" });
    }
  
    connectedCallback() {
      window.addEventListener("product-info:show", this._onShowEvent);
    }
    disconnectedCallback() {
      window.removeEventListener("product-info:show", this._onShowEvent);
      this._disconnectWs();
    }
  
    set hass(hass) {
      this._hass = hass;
      const newWs = this._buildWsUrl();
      if (!this._ws || this._wsUrl !== newWs) {
        this._wsUrl = newWs;
        this._disconnectWs();
        if (this._wsUrl) this._connectWs();
      }
      this.render();
    }
  
    _resolveCartId() {
      if (this.config.cart_id_entity && this._hass) {
        const ent = this._hass.states?.[this.config.cart_id_entity];
        if (ent) return ent.state;
      }
      return this.config.cart_id;
    }
    _resolveApiBase() {
      // if (this.config.api_base) return this.config.api_base;
      // if (!this._hass) return null;
      // const ent = this._hass.states?.[this.config.api_base_entity];
      // return ent ? (ent.state || "").trim() : null;
      return ApiConfig.getApiBaseAuto();
    }
    _buildHttpBase() {
      // let apiBase = this._resolveApiBase();
      // let proto = this.config.scheme || "http";
      // let host = apiBase;
      // let port = this.config.port;
      // try {
      //   if (apiBase && (apiBase.startsWith("http://") || apiBase.startsWith("https://"))) {
      //     const u = new URL(apiBase);
      //     proto = u.protocol.replace(":", "");
      //     host = u.hostname;
      //     if (u.port) port = u.port;
      //     return `${proto}://${host}${port ? `:${port}` : ""}`;
      //   }
      // } catch(e) {}
      // if (!apiBase) return null;
      // return `${proto}://${host}${port ? `:${port}` : ""}`;
      return ApiConfig.getApiBaseAuto();
    }
    _buildWsUrl() {
      const base = this._resolveApiBase();
      const cartId = this._resolveCartId();
      if (!base || !cartId) return null;
      const wsProto = base.startsWith("https") ? "wss" : "ws";
      const url = new URL(base);
      return `${wsProto}://${url.host}/ws/product-detect/${encodeURIComponent(cartId)}`;
    }
  
    _connectWs() {
      if (!this._wsUrl) return;
      try { this._ws = new WebSocket(this._wsUrl); }
      catch (e) {
        this._scheduleReconnect();
        return;
      }
      this._ws.onopen = () => { this._reconnectDelay = 500; };
      this._ws.onmessage = (ev) => this._handleWsMessage(ev);
      this._ws.onclose = () => {
        this._ws = null;
        this._scheduleReconnect();
      };
    }
    _disconnectWs() {
      if (this._ws) { try { this._ws.close(); } catch(e) {} this._ws = null; }
      if (this._reconnectHandle) { clearTimeout(this._reconnectHandle); this._reconnectHandle = null; }
    }
    _scheduleReconnect() {
      if (this._reconnectHandle) return;
      const delay = Math.min(10000, this._reconnectDelay);
      this._reconnectHandle = setTimeout(() => {
        this._reconnectHandle = null;
        if (this._mode === "live") this._connectWs();
        this._reconnectDelay = Math.min(10000, this._reconnectDelay * 1.8);
      }, delay);
    }
  
    _handleWsMessage(ev) {
      try {
        const payload = JSON.parse(ev.data);
        if (!payload || !Array.isArray(payload.items)) return;
    
        if (payload.items.length > 0) {
          const first = payload.items[0];
          const id = first.product_id ?? null;
          if (!id) return;
          const sig = `${id}#${payload.updated_at || ""}#${first.quantity ?? ""}`;
          if (sig === this._lastSig) return;
          this._lastSig = sig;
    
          // Khi có sản phẩm detect thì chuyển sang live mode luôn
          this._mode = "live";
          this._manualProductId = null;
          this._product = this._normalizeProduct(first);
          this.render();
        } else {
          // items rỗng => giữ nguyên sản phẩm hiện tại, KHÔNG reset this._product
          // => không làm gì
        }
      } catch(e) {
        console.error("WS parse error", e);
      }
    }
  
    async _handleShowEvent(ev) {
      const { productId, cartId } = ev.detail || {};
      const myCart = this._resolveCartId();
      if (!productId || String(cartId) !== String(myCart)) return;
      this._mode = "manual";
      this._manualProductId = productId;
      await this._fetchAndShowProduct(productId);
    }
  
    async _fetchAndShowProduct(productId) {
      const base = this._buildHttpBase();
      if (!base) return;
      const url = `${base}/products/${encodeURIComponent(productId)}`;
      try {
        const resp = await fetch(url);
        const p = await resp.json();
        this._product = this._normalizeProduct(p);
        this.render();
      } catch { this._product = null; this.render(`<div class="no-product">Failed to load product #${productId}</div>`); }
    }
  
    _normalizeProduct(p) {
      return {
        id: p.product_id ?? null,
        name: p.name ?? "",
        manufacturer: p.manufacturer ?? "",
        expiry_or_mfg_date: p.expiry_or_mfg_date ?? "",
        origin: p.origin ?? "",
        info1: p.info1 ?? "",
        info2: p.info2 ?? "",
        detail1: p.detail1 ?? "",
        detail2: p.detail2 ?? ""
      };
    }
  
    _splitKeyVal(str) {
      if (!str) return null;
      const idx = str.indexOf("-");
      if (idx === -1) return { k: str.trim(), v: "" };
      return { k: str.slice(0, idx).trim(), v: str.slice(idx + 1).trim() };
    }
  
    _toggleMode() {
      if (this._mode === "live") this._mode = "manual";
      else { this._mode = "live"; this._manualProductId = null; const newWs = this._buildWsUrl(); if (!this._ws || this._wsUrl !== newWs) { this._wsUrl = newWs; this._disconnectWs(); if (this._wsUrl) this._connectWs(); } }
      this.render();
    }
  
    render(extraInner = "") {
      if (!this.shadowRoot) return;
      const p = this._product;
      const modeLabel = this._mode === "live" ? "LIVE" : "MANUAL";
  
      const style = `
        <style>
          .card {
            border-radius:10px;
            background:#fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.1);
            display:flex;
            flex-direction:column;
            color:#000; /* Toàn bộ text màu đen */
          }
          .header {
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:8px 12px;
            border-bottom:1px solid #ddd;
          }
          .title {
            font-size:20px;
            font-weight:700;
            color:#000;
          }
          .mode-btn {
            border:none;
            border-radius:12px;
            padding:6px 14px;
            font-size:14px;
            font-weight:700;
            color:#fff;
            cursor:pointer;
          }
          .mode-live { background:#28a745; }
          .mode-manual { background:#007bff; }
  
          .inner {
            display:flex;
            gap:12px;
            padding:12px;
            align-items:stretch; /* ép 2 bên cao bằng nhau */
          }
          .left {
            width:32%;
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:12px;
          }
          .product-img {
            width:90%;
            aspect-ratio:1/1;
            object-fit:cover;
            border:2px solid #000; /* border rõ hơn */
            border-radius:6px;
          }
          .btn-add {
            background:#28a745;
            color:#fff;
            border:none;
            border-radius:8px;
            font-size:16px;
            font-weight:700;
            cursor:pointer;
            padding:10px 0;
            width:80%;  /* gần bằng 4/5 chiều ngang ảnh */
          }
          .btn-add:hover {
            background:#218838;
          }
  
          .right {
            flex:1;
          }
          .info-table {
            width:100%;
            border-collapse:collapse;
            font-size:12px;
          }
          .info-table tr {
            border-bottom:1px solid #bbb;
          }
          .info-table th {
            width:35%;
            text-align:left;
            background:#d9d9d9; /* xám đậm hơn */
            padding:6px 8px;
            font-weight:700;   /* bold */
            color:#000;
          }
          .info-table td {
            padding:6px 8px;
            color:#000;
          }
        </style>
      `;
  
      if (!p) {
        this.shadowRoot.innerHTML = style + `
        <div class="card">
          <div class="header">
            <div class="title">Product</div>
            <button id="modeBtn" class="mode-btn ${this._mode==='live'?'mode-live':'mode-manual'}">${modeLabel}</button>
          </div>
          <div class="inner">${extraInner || `<div class="no-product">No product detected</div>`}</div>
        </div>`;
        this.shadowRoot.getElementById("modeBtn")?.addEventListener("click",()=>this._toggleMode());
        return;
      }
  
      const rows = [];
      rows.push(`<tr><th>Manufacturer</th><td>${p.manufacturer||"-"}</td></tr>`);
      rows.push(`<tr><th>Expiry/MFG</th><td>${p.expiry_or_mfg_date||"-"}</td></tr>`);
      rows.push(`<tr><th>Origin</th><td>${p.origin||"-"}</td></tr>`);
      [p.info1,p.info2,p.detail1,p.detail2].forEach(val=>{
        const kv=this._splitKeyVal(val); if(kv) rows.push(`<tr><th>${kv.k}</th><td>${kv.v}</td></tr>`);
      });
  
      const imgSrc = `/local/product_pic/${Number(p.id)}.jpg`;
  
      this.shadowRoot.innerHTML = style + `
      <div class="card">
        <div class="header">
          <div class="title">${p.name||"#"+p.id}</div>
          <button id="modeBtn" class="mode-btn ${this._mode==='live'?'mode-live':'mode-manual'}">${modeLabel}</button>
        </div>
        <div class="inner">
          <div class="left">
            <img class="product-img" src="${imgSrc}" onerror="this.src='/local/placeholder.png'">
            ${this._mode==='live' ? `<button id="btnAdd" class="btn-add">Add to cart</button>` : ""}
          </div>
          <div class="right">
            <table class="info-table">${rows.join("")}</table>
          </div>
        </div>
      </div>`;
  
      this.shadowRoot.getElementById("modeBtn")?.addEventListener("click",()=>this._toggleMode());
      if(this._mode==='live') this.shadowRoot.getElementById("btnAdd")?.addEventListener("click",()=>this._addToCart(p.id));
    }
  
    async _addToCart(productId) {
      const base = this._buildHttpBase(); const cartId = this._resolveCartId();
      if(!base||!cartId||!productId) return;
      await fetch(`${base}/cart_inventory/${cartId}/items`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({mode:"merge",items:[{product_id:productId,quantity:1}]})
      });
    }
  }
  
  customElements.define("product-info-card", ProductInfoCard);