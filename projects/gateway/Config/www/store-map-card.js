import { LitElement, html, css } from "/config/www/static/lit-element.js";

class StoreMapCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _activeZone: { type: Object },
      _products: { type: Array },
    };
  }

  constructor() {
    super();
    this.config = {};
    this._activeZone = null;
    this._products = [];
    // Kích thước canvas logic (viewBox) 
    this._W = 1000;
    this._H = 600;

    // Khu mặc định 
    this._zones = [
      // Trên bên trái: Hoa quả 
      { id: "fruits", x: 30, y: 40, w: 220, h: 150, color: "#a8e6cf", icon: "🍎" },
      // Dưới bên trái: Bánh mì
      { id: "bakery", x: 30, y: 220, w: 220, h: 120, color: "#ffd3b6", icon: "🥖" },
      // Các dãy giữa 
      { id: "spices", x: 280, y: 40, w: 140, h: 300, color: "#fff59d", icon: "🧂" },
      { id: "household", x: 450, y: 40, w: 140, h: 300, color: "#c5cae9", icon: "🧰" },
      { id: "stationery", x: 620, y: 40, w: 140, h: 300, color: "#b2ebf2", icon: "✏️" },
      // Khu Chăm sóc cá nhân
      { id: "personal_care", x: 790, y: 40, w: 140, h: 300, color: "#f8bbd0", icon: "🧴" },
      // Khu ngồi ăn
      { id: "dining", x: 280, y: 380, w: 650, h: 150, color: "#ffaaa5", icon: "🍽️" },
    ];

    // Sản phẩm demo (tĩnh). Sau này có thể lấy từ API theo zone.
    this._staticProducts = {
      fruits: [
        { name: "Banana", price: 1.2, unit: "/bunch", img: "banana.png", desc: "Ngọt, tươi." },
        { name: "Apple Gala", price: 2.1, unit: "/kg", img: "apple.png", desc: "Giòn, thơm." },
        { name: "Orange", price: 1.8, unit: "/kg", img: "orange.png", desc: "Nhiều vitamin C." },
      ],
      bakery: [
        { name: "Baguette", price: 0.9, unit: "/pc", img: "baguette.png", desc: "Vỏ giòn ruột mềm." },
        { name: "Croissant", price: 1.4, unit: "/pc", img: "croissant.png", desc: "Bơ thơm, nhiều lớp." },
      ],
      spices: [
        { name: "Sea Salt", price: 1.1, unit: "/pack", img: "salt.png", desc: "Muối biển hạt nhỏ." },
        { name: "Black Pepper", price: 1.9, unit: "/jar", img: "pepper.png", desc: "Tiêu đen xay." },
      ],
      household: [
        { name: "Dish Soap", price: 2.4, unit: "/bottle", img: "soap.png", desc: "Ít bọt, sạch dầu mỡ." },
        { name: "Trash Bags", price: 1.7, unit: "/roll", img: "trashbag.png", desc: "Dày, bền." },
      ],
      stationery: [
        { name: "A4 Paper", price: 3.2, unit: "/ream", img: "paper.png", desc: "500 tờ, 80gsm." },
        { name: "Blue Pen", price: 0.4, unit: "/pc", img: "pen.png", desc: "Mực êm, nét 0.5." },
      ],
      personal_care: [
        { name: "Shampoo", price: 3.8, unit: "/bottle", img: "shampoo.png", desc: "Dưỡng ẩm." },
        { name: "Toothpaste", price: 1.5, unit: "/tube", img: "toothpaste.png", desc: "Bạc hà mát." },
      ],
      dining: [
        { name: "Combo Lunch", price: 4.9, unit: "", img: "lunch.png", desc: "Món nóng ăn tại chỗ." },
        { name: "Iced Tea", price: 0.8, unit: "/cup", img: "tea.png", desc: "Giải khát." },
      ],
    };
  }

  // Vị trí người dùng (tĩnh, entity hoặc API) 
  _getUserPos() {
    // Entity HA (state: "x,y" hoặc attr {x,y} hoặc JSON)
    const ent = this.config?.user_entity;
    if (ent && this.hass && this.hass.states[ent]) {
      const st = this.hass.states[ent];
      const fromAttr =
        (typeof st.attributes.x === "number" && typeof st.attributes.y === "number")
          ? { x: st.attributes.x, y: st.attributes.y }
          : null;

      let fromState = null;
      if (typeof st.state === "string") {
        
        if (st.state.includes(",")) {
          const [sx, sy] = st.state.split(",").map((v) => Number(v.trim()));
          if (!isNaN(sx) && !isNaN(sy)) fromState = { x: sx, y: sy };
        } else {
          try {
            const j = JSON.parse(st.state);
            if (typeof j?.x === "number" && typeof j?.y === "number") fromState = j;
          } catch (_) {}
        }
      }
      const pos = fromAttr || fromState;
      if (pos) return this._normalizePos(pos);
    }

    // Cấu hình tĩnh
    if (this.config?.user_position && typeof this.config.user_position.x === "number") {
      return this._normalizePos(this.config.user_position);
    }

    // Mặc định demo
    return { x: 200, y: 500 }; // gần trái dưới
  }

  // Cho phép nhập % (0..100) hoặc toạ độ tuyệt đối theo viewBox
  _normalizePos(pos) {
    const isPct = pos.x <= 100 && pos.y <= 100;
    return isPct
      ? { x: (pos.x / 100) * this._W, y: (pos.y / 100) * this._H }
      : { x: pos.x, y: pos.y };
  }

  // ---- Render ----
  render() {
    const W = this._W, H = this._H;
    const you = this._getUserPos();

    return html`
      <div class="card">
        ${this.config?.title ? html`<div class="title">${this.config.title}</div>` : null}
        <div class="map-wrap">
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="map">
            <!-- Viền -->
            <rect x="5" y="5" width="${W-10}" height="${H-10}" rx="18" class="map-border"></rect>

            <!-- Khu vực -->
            ${this._zones.map(z => html`
              <g class="zone" @click=${() => this._openZone(z)} role="button" tabindex="0">
                <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"
                  fill="${z.color}" class="zone-rect"/>
                <text x="${z.x + z.w/2}" y="${z.y + 36}" text-anchor="middle" class="zone-icon">${z.icon}</text>
              </g>
            `)}

            <!-- Lối vào/ra, WC, Checkout -->
            ${this._markers()}

            <!-- Người dùng -->
            <g class="you">
              <circle cx="${you.x}" cy="${you.y}" r="10" class="you-dot"></circle>
              <text x="${you.x + 14}" y="${you.y + 5}" class="you-label">You are here</text>
            </g>
          </svg>
        </div>

        <!-- Modal sản phẩm -->
        <div class="modal ${this._activeZone ? 'show' : ''}" @click=${this._closeModal}>
          <div class="modal-body" @click=${(e)=>e.stopPropagation()}>
            ${this._activeZone ? html`
              <div class="modal-title">
                <span class="mz">${this._activeZone.icon}</span>
                <span>${this._zoneLabel(this._activeZone.id)}</span>
                <button class="close" @click=${this._closeModal}>×</button>
              </div>
              <div class="prod-list">
                ${this._products.map(p => html`
                  <div class="prod">
                    ${this._renderImg(p)}
                    <div class="pinfo">
                      <div class="pname">${p.name}</div>
                      <div class="pdesc">${p.desc || ""}</div>
                      <div class="pprice">${this._fmt(p.price)} <span class="unit">${p.unit||""}</span></div>
                    </div>
                  </div>
                `)}
              </div>
            ` : null}
          </div>
        </div>
      </div>
    `;
  }

  // Entrance, Exit, WC, Checkout
  _markers() {

    return html`
      <g class="marker">
        <rect x="300" y="${this._H - 50}" width="120" height="36" rx="8" class="mk entrance"/>
        <text x="360" y="${this._H - 26}" text-anchor="middle" class="mk-label">Entrance</text>
      </g>
      <g class="marker">
        <rect x="640" y="${this._H - 50}" width="120" height="36" rx="8" class="mk checkout"/>
        <text x="700" y="${this._H - 26}" text-anchor="middle" class="mk-label">Checkout</text>
      </g>
      <g class="marker">
        <rect x="${this._W - 150}" y="${this._H - 50}" width="120" height="36" rx="8" class="mk exit"/>
        <text x="${this._W - 90}" y="${this._H - 26}" text-anchor="middle" class="mk-label">Exit</text>
      </g>
      <g class="marker">
        <rect x="${this._W - 150}" y="20" width="120" height="36" rx="8" class="mk wc"/>
        <text x="${this._W - 90}" y="44" text-anchor="middle" class="mk-label">WC</text>
      </g>
    `;
  }

  _zoneLabel(id) {
    const map = {
      fruits: "Fruits",
      bakery: "Bakery",
      spices: "Spices",
      household: "Household",
      stationery: "Stationery",
      personal_care: "Personal Care",
      dining: "Dining Area",
    };
    return map[id] || id;
  }

  _renderImg(p) {
    
    const base = this.config?.image_base_path || "/config/www/product_test_pic/";
    const src = p.img ? (base + p.img) : "";
    return src
      ? html`<img src="${src}" loading="lazy" alt="${p.name}" />`
      : html`<div class="placeholder">${(p.name||"")[0]||"?"}</div>`;
  }

  _fmt(n) { return typeof n === "number" ? `$${n.toFixed(2)}` : n; }

  // ---- Popup ----
  async _openZone(zone) {
    this._activeZone = zone;
    // Nếu config.api_url tồn tại, gọi API: `${api_url}?zone=${zone.id}`
    if (this.config?.api_url) {
      try {
        const url = this._composeApi(zone.id);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this._products = Array.isArray(data) ? data : [];
      } catch (e) {
        console.warn("Fetch products failed:", e);
        this._products = this._staticProducts[zone.id] || [];
      }
    } else {
      // Dữ liệu tĩnh demo
      this._products = this._staticProducts[zone.id] || [];
    }
  }

  _closeModal() {
    this._activeZone = null;
    this._products = [];
  }

  _composeApi(zoneId) {
    const api = this.config.api_url;
    if (!api) return "";
    if (api.includes("{zone}")) return api.replace("{zone}", encodeURIComponent(zoneId));
    return api.includes("?") ? `${api}&zone=${encodeURIComponent(zoneId)}` : `${api}?zone=${encodeURIComponent(zoneId)}`;
  }

  // ---- Config / Card size ----
  setConfig(config) {
    this.config = config || {};
    // Cho phép override vùng qua config.zones 
    if (Array.isArray(config?.zones) && config.zones.length) {
      this._zones = config.zones;
    }
  }

  getCardSize() {
    // Map + modal
    return 8;
  }

  // ---- Styles ----
  static get styles() {
    return css`
      :host { display:block; }
      .card {
        padding: 12px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--primary-text-color);
      }
      .title { font-weight: 600; margin: 0 0 8px; }

      .map-wrap { width: 100%; aspect-ratio: 5 / 3; }
      .map { width: 100%; height: 100%; border-radius: 12px; }
      .map-border { fill: #f7f7f7; stroke: #e0e0e0; stroke-width: 2; }

      .zone { cursor: pointer; transition: transform .12s ease; }
      .zone:focus .zone-rect, .zone:hover .zone-rect { outline: 2px solid rgba(0,0,0,.15); }
      .zone:active { transform: scale(0.997); }
      .zone-rect { rx: 12; }

      .zone-icon {
        font-size: 28px;
        dominant-baseline: middle;
      }

      .marker .mk {
        fill: #e8f5e9;
        stroke: #a5d6a7;
        stroke-width: 2;
      }
      .marker .exit { fill: #ffebee; stroke: #ef9a9a; }
      .marker .wc { fill: #e3f2fd; stroke: #90caf9; }
      .marker .entrance { fill: #e8f5e9; stroke: #81c784; }
      .marker .checkout { fill: #e8f5e9; stroke: #66bb6a; }
      .mk-label { font-size: 16px; fill: #333; font-weight: 600; }

      .you-dot { fill: #e53935; stroke: #fff; stroke-width: 3; }
      .you-label { font-size: 14px; fill: #e53935; font-weight: 700; }

      /* Modal */
      .modal {
        position: fixed; inset: 0;
        display: grid; place-items: center;
        background: rgba(0,0,0,0);
        opacity: 0; pointer-events: none;
        transition: background .18s ease, opacity .18s ease;
        z-index: 999;
      }
      .modal.show {
        background: rgba(0,0,0,.25);
        opacity: 1; pointer-events: auto;
      }
      .modal-body {
        width: min(860px, 92vw);
        max-height: 80vh;
        background: #fff; border-radius: 14px;
        box-shadow: 0 10px 40px rgba(0,0,0,.18);
        transform: translateY(8px);
        animation: pop .18s ease both;
        padding: 14px;
        overflow: auto;
      }
      @keyframes pop {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .modal-title {
        display: flex; align-items: center; gap: 10px;
        font-weight: 700; font-size: 18px; margin-bottom: 8px;
      }
      .modal-title .mz { font-size: 22px; }
      .close {
        margin-left: auto; font-size: 22px; line-height: 1;
        border: none; background: transparent; cursor: pointer;
      }

      .prod-list { display: grid; gap: 10px; }
      @media (min-width: 640px) {
        .prod-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (min-width: 920px) {
        .prod-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      .prod {
        display: flex; gap: 10px; align-items: center;
        border: 1px solid #eee; border-radius: 12px; padding: 10px;
        background: #fafafa;
      }
      .prod img, .prod .placeholder {
        width: 64px; height: 64px; border-radius: 10px;
        background: #fff; border: 1px solid #eee; display: grid; place-items: center;
        font-weight: 700;
      }
      .pinfo { min-width: 0; }
      .pname { font-weight: 700; }
      .pdesc { font-size: 13px; color: #666; }
      .pprice { margin-top: 2px; font-weight: 700; color: #2e7d32; }
      .unit { font-weight: 500; color: #666; margin-left: 4px; }
    `;
  }
}

customElements.define("store-map-card", StoreMapCard);
