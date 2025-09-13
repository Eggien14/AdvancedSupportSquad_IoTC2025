/* store-map-card.js — phiên bản chỉ dùng ZONES (selector) để bắt click
 * - Nhúng file SVG (từ /local/...svg)
 * - Gắn click theo id/class có sẵn trong SVG (khai báo ở YAML qua `zones`)
 * - Không còn overlay/hotspots
 */

class StoreMapCard extends HTMLElement {
    set hass(hass) {
      this._hass = hass;
      if (!this._root) this._buildShell();
    }
  
    setConfig(config) {
      this.config = config || {};
      this._imgBase = this.config.image_base_path || "/local/product_test_pic/";
      this._svgUrl  = this.config.svg_url || "";
      if (!this._svgUrl) throw new Error("svg_url is required");
  
      // Danh sách vùng click (selector trong SVG)
      this._zones = Array.isArray(this.config.zones) ? this.config.zones : [];
  
      // Re-render nếu đã build
      if (this._root) this._loadAndRender();
    }
  
    getCardSize() { return 10; }
    getGridOptions() {
      return {
        rows: this.config.grid_rows || 6,
        columns: this.config.grid_columns || 12,
        min_rows: 3,
        max_rows: 12
      };
    }
  
    /* ---------------- Shell & layout ---------------- */
    _buildShell() {
      const Hpx = this.config?.map_height ? `${this.config.map_height}px` : null;
      const AR  = this.config?.aspect_ratio; // ví dụ 900/650 ~ 1.385
      const wrapStyle = `${Hpx ? `--map-h:${Hpx};` : ""}${AR ? `--map-ar:${AR};` : ""}`;
  
      this.innerHTML = `
        <ha-card class="card">
          <style>
            .card  { padding: 12px; }
            .title { font-weight: 700; font-size: 22px; margin: 0 0 8px; }
            .wrap  { position: relative; width: 100%; aspect-ratio: var(--map-ar, 900/650); height: var(--map-h, auto); }
            .holder { position:absolute; inset:0; }
            .holder svg { width:100%; height:100%; display:block; }
  
            .clickable { cursor: pointer; }
            .clickable:hover { filter: brightness(0.92); }
  
            /* Modal */
            .modal { position: fixed; inset: 0; display: grid; place-items: center;
                     background: rgba(0,0,0,0); opacity:0; pointer-events:none; transition: .18s; z-index:999; }
            .modal.show { background: rgba(0,0,0,.25); opacity:1; pointer-events:auto; }
            .modal-body { width: min(860px, 92vw); max-height: 80vh; background:#fff; border-radius:14px;
                          box-shadow: 0 10px 40px rgba(0,0,0,.18); padding:14px; overflow:auto; }
            .mtitle { display:flex; align-items:center; gap:10px; font-weight:700; font-size:18px; margin-bottom:8px; }
            .close { margin-left:auto; font-size:22px; border:none; background:transparent; cursor:pointer; }
            .plist { display:grid; gap:10px; }
            @media (min-width:640px){ .plist{ grid-template-columns: repeat(2,minmax(0,1fr)); } }
            @media (min-width:920px){ .plist{ grid-template-columns: repeat(3,minmax(0,1fr)); } }
            .item { display:flex; gap:10px; align-items:center; border:1px solid #eee; border-radius:12px; padding:10px; background:#fafafa; }
            .item img, .ph { width:64px; height:64px; border-radius:10px; background:#fff; border:1px solid #eee;
                              display:grid; place-items:center; font-weight:700; }
            .iname { font-weight:700; }
            .idesc { font-size:13px; color:#666; }
            .iprice { margin-top:2px; font-weight:700; color:#2e7d32; }
            .unit { font-weight:500; color:#666; margin-left:4px; }
          </style>
  
          ${this.config?.title ? `<div class="title">${this.config.title}</div>` : ""}
          <div class="wrap" style="${wrapStyle}">
            <div class="holder"></div>
          </div>
  
          <div class="modal">
            <div class="modal-body">
              <div class="mtitle">
                <span class="mt">Products</span>
                <button class="close">×</button>
              </div>
              <div class="plist"></div>
            </div>
          </div>
        </ha-card>
      `;
  
      this._root   = this.querySelector(".card");
      this._holder = this.querySelector(".holder");
      this._modal  = this.querySelector(".modal");
      this._plist  = this.querySelector(".plist");
  
      this.querySelector(".close").addEventListener("click", () => this._close());
      this._modal.addEventListener("click", () => this._close());
      this.querySelector(".modal-body").addEventListener("click", (ev)=>ev.stopPropagation());
  
      this._loadAndRender();
    }
  
    async _loadAndRender() {
      // Tải SVG
      let text = "";
      try {
        const res = await fetch(this._svgUrl, { cache: "no-store" });
        text = await res.text();
      } catch (e) {
        console.error("Load SVG failed:", e);
        this._holder.innerHTML = `<div style="padding:12px;color:#b00020">Cannot load SVG: ${this._svgUrl}</div>`;
        return;
      }
  
      // Xoá <script> nếu có (an toàn)
      text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  
      // Nhúng SVG (giữ nguyên viewBox)
      this._holder.innerHTML = text;
  
      // Lấy root svg
      this._svg = this._holder.querySelector("svg");
      if (!this._svg) {
        this._holder.innerHTML = `<div style="padding:12px;color:#b00020">Invalid SVG</div>`;
        return;
      }
  
      // Responsive
      this._svg.removeAttribute("width");
      this._svg.removeAttribute("height");
      this._svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      this._svg.classList.add("base-svg");
  
      // Gắn click theo selector
      this._wireSelectors();
    }
  
    _wireSelectors() {
      if (!Array.isArray(this._zones) || !this._zones.length) return;
  
      this._zones.forEach(z => {
        const selector = z.selector || "";
        const id       = z.id || "";
        const cat      = z.category || "";
        if (!selector || !id) return;
  
        const nodes = this._svg.querySelectorAll(selector);
        nodes.forEach(node => {
          node.classList.add("clickable");
          node.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this._open(id, cat);
          });
        });
      });
    }
  
    /* ---------------- Popup sản phẩm ---------------- */
    _open(zoneId, cat) {
      // Ánh xạ chữ cái -> nhóm sản phẩm demo
      const mapCat = Object.assign({
        A:"fruits", B:"household", C:"spices", D:"bakery"
      }, this.config.category_map || {});
  
      const category = cat || mapCat[String(zoneId).charAt(0)] || "fruits";
      const items = this._demoProducts()[category] || [];
  
      this._plist.innerHTML = items.map(p => {
        const src = p.img ? `${this._imgBase}${p.img}` : "";
        const img = src ? `<img src="${src}" alt="${p.name}" loading="lazy">` : `<div class="ph">${(p.name||"?")[0]}</div>`;
        const price = (typeof p.price === "number") ? `$${p.price.toFixed(2)}` : (p.price || "");
        const unit = p.unit ? `<span class="unit">${p.unit}</span>` : "";
        return `<div class="item">${img}
          <div>
            <div class="iname">${p.name||""}</div>
            <div class="idesc">${p.desc||""}</div>
            <div class="iprice">${price} ${unit}</div>
          </div>
        </div>`;
      }).join("");
  
      this._modal.classList.add("show");
    }
  
    _close(){ this._modal.classList.remove("show"); }
  
    _demoProducts(){
      return {
        fruits: [
          { name: "Banana",       price: 1.2, unit: "/bunch", img: "banana.png",   desc: "Ngọt, tươi." },
          { name: "Apple Gala",   price: 2.1, unit: "/kg",    img: "apple.png",    desc: "Giòn, thơm." },
          { name: "Orange",       price: 1.8, unit: "/kg",    img: "orange.png",   desc: "Vitamin C." },
        ],
        bakery: [
          { name: "Baguette",     price: 0.9, unit: "/pc",    img: "baguette.png", desc: "Vỏ giòn ruột mềm." },
          { name: "Croissant",    price: 1.4, unit: "/pc",    img: "croissant.png",desc: "Bơ thơm, nhiều lớp." },
        ],
        spices: [
          { name: "Sea Salt",     price: 1.1, unit: "/pack",  img: "salt.png",     desc: "Muối biển." },
          { name: "Black Pepper", price: 1.9, unit: "/jar",   img: "pepper.png",   desc: "Tiêu đen xay." },
        ],
        household: [
          { name: "Dish Soap",    price: 2.4, unit: "/bottle",img: "soap.png",     desc: "Ít bọt, sạch dầu mỡ." },
          { name: "Trash Bags",   price: 1.7, unit: "/roll",  img: "trashbag.png", desc: "Dày, bền." },
        ],
      };
    }
  }
  
  customElements.define("store-map-card", StoreMapCard);
  