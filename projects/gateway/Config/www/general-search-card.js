// Import API Config
import ApiConfig from '/local/api-config.js';
import GeneralProductDetailPopup from '/local/general-product-detail-popup.js';

class GeneralSearchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._results = [];
    this._typeRecommendations = [];
    this._lastQuery = "";
    this._lastType = "";
    this._debounce = null;
    this._popup = new GeneralProductDetailPopup();

    this._onWindowClick = (ev) => {
      const path = ev.composedPath ? ev.composedPath() : [];
      
      // Bỏ qua nếu click vào popup
      const clickedOnPopup = path.some(el => 
        el && el.classList && (
          el.classList.contains('popup-overlay') || 
          el.classList.contains('popup-container') ||
          el.closest && el.closest('.popup-overlay')
        )
      );
      
      if (clickedOnPopup) return;
      
      if (!path.includes(this)) this._reset();
    };
  }

  setConfig(config) {
    this._config = Object.assign({ 
      placeholder: "Enter product name...",
      typePlaceholder: "Enter product type..."
    }, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
  }

  getCardSize() {
    return 4;
  }

  _render() {
    const style = `
      :host { display:block; font-family: system-ui, Roboto, Arial, sans-serif; }
      .wrapper { position: relative; max-width: 560px; }
      .search-container { display: flex; flex-direction: column; gap: 8px; }
      input.search, input.type {
        width: 100%; box-sizing: border-box; padding: 12px 14px;
        border-radius: 10px; border: 1px solid var(--divider-color, #ddd);
        outline: none; font-size: 16px; background: var(--card-background-color, #1e1e1e);
        color: var(--primary-text-color, #eaeaea);
      }
      input.search::placeholder, input.type::placeholder { color: var(--secondary-text-color, #9aa0a6); }
      .list {
        position: absolute; left: 0; right: 0; top: calc(100% + 6px);
        max-height: 380px; overflow: auto; border-radius: 12px;
        border: 1px solid var(--divider-color, #2a2a2a);
        background: var(--card-background-color, #111);
        box-shadow: 0 10px 24px rgba(0,0,0,.25);
        z-index: 2;
      }
      .type-recommendations {
        margin-bottom: 8px; padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color, #333);
      }
      .type-item {
        padding: 8px 12px; cursor: pointer;
        background: var(--primary-color, #2196F3);
        color: white; font-size: 13px; border-radius: 6px;
        margin: 4px; display: inline-block;
      }
      .type-item:hover { opacity: 0.8; }
      .item {
        display: grid; grid-template-columns: 56px 1fr; gap: 12px;
        padding: 10px 12px; align-items: center; cursor: pointer;
      }
      .item:hover { background: rgba(255,255,255,.05); }
      .thumb { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; background: #222; }
      .title { font-weight: 600; line-height: 1.25; }
      .sub { opacity: .8; font-size: 13px; }
      .empty { padding: 14px; opacity: .7; }
      .hidden { display: none; }
    `;

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="wrapper">
        <div class="search-container">
          <input class="type" type="text" placeholder="${this._config.typePlaceholder}" />
          <input class="search" type="text" placeholder="${this._config.placeholder}" />
        </div>
        <div class="list hidden"></div>
      </div>
    `;
    this._inputType = this.shadowRoot.querySelector("input.type");
    this._input = this.shadowRoot.querySelector("input.search");
    this._list = this.shadowRoot.querySelector(".list");

    this._inputType.addEventListener("input", (e) => this._onInput(e));
    this._input.addEventListener("input", (e) => this._onInput(e));
    window.addEventListener("click", this._onWindowClick, true);

    this._rendered = true;
  }

  disconnectedCallback() {
    window.removeEventListener("click", this._onWindowClick, true);
  }

  _reset() {
    if (!this._input || !this._inputType) return;
    this._input.value = "";
    this._inputType.value = "";
    this._lastQuery = "";
    this._lastType = "";
    this._results = [];
    this._typeRecommendations = [];
    this._renderList();
  }

  _onInput(ev) {
    const q = (this._input.value || "").trim();
    const t = (this._inputType.value || "").trim();
    
    // Only trigger if either input changed
    if (q === this._lastQuery && t === this._lastType) return;
    
    this._lastQuery = q;
    this._lastType = t;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      if (q === "" && t === "") {
        // Both empty - reset everything (same as click outside)
        this._results = [];
        this._typeRecommendations = [];
        this._renderList();
      } else if (t === "" && q !== "") {
        // Only name search - clear recommendations immediately
        this._typeRecommendations = [];
        this._fetch(q, t);
      } else {
        this._fetch(q, t);
      }
    }, 250);
  }

  async _fetch(q, t) {
    try {
      const apiBase = ApiConfig.getApiBaseAuto();
      let data;

      if (t && !q) {
        // Case 1: Only product type specified - use by-type API
        const url = `${apiBase}/products/by-type/${encodeURIComponent(t)}?limit=50`;
        console.log('API URL (by-type):', url);
        
        const r = await fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        data = JSON.parse(text);
        
        // Extract unique types for recommendations
        this._extractTypeRecommendations(data, t);
        
      } else if (q && !t) {
        // Case 3: Only product name search - use name search API, no type filter
        const url = `${apiBase}/products?name=${encodeURIComponent(q)}&limit=50`;
        console.log('API URL (by-name only):', url);
        
        const r = await fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        data = JSON.parse(text);
        
        // No type recommendations for case 3
        this._typeRecommendations = [];
        
      } else if (q && t) {
        // Case 2: Both name and type - call BOTH APIs and get intersection
        console.log('Case 2: Calling both APIs for intersection');
        
        const [nameResponse, typeResponse] = await Promise.all([
          fetch(`${apiBase}/products?name=${encodeURIComponent(q)}&limit=50`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          }),
          fetch(`${apiBase}/products/by-type/${encodeURIComponent(t)}?limit=50`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          })
        ]);
        
        if (!nameResponse.ok || !typeResponse.ok) {
          throw new Error(`HTTP ${nameResponse.status} or ${typeResponse.status}`);
        }
        
        const nameData = JSON.parse(await nameResponse.text());
        const typeData = JSON.parse(await typeResponse.text());
        
        // Get intersection by product_id
        const nameIds = new Set(nameData.map(p => p.product_id));
        data = typeData.filter(p => nameIds.has(p.product_id));
        
        console.log(`Name results: ${nameData.length}, Type results: ${typeData.length}, Intersection: ${data.length}`);
        
        // Extract type recommendations from typeData (full results)
        this._extractTypeRecommendations(typeData, t);
      }

      this._results = Array.isArray(data) ? data : [];
      
    } catch (e) {
      console.warn("Fetch error:", e);
      this._results = [];
      this._typeRecommendations = [];
    }
    
    this._renderList();
  }

  _extractTypeRecommendations(data, userInput) {
    if (!Array.isArray(data)) return;
    
    // Get unique types that contain the user input
    const types = [...new Set(
      data
        .map(p => p.type)
        .filter(type => type && type.toLowerCase().includes(userInput.toLowerCase()))
    )];
    
    this._typeRecommendations = types;
  }

  _renderList() {
    if (!this._list) return;
    
    let html = "";
    
    // Render type recommendations first
    if (this._typeRecommendations && this._typeRecommendations.length > 0) {
      const typeHtml = this._typeRecommendations
        .map(type => `<span class="type-item" data-type="${this._escape(type)}">${this._escape(type)}</span>`)
        .join("");
      html += `<div class="type-recommendations">${typeHtml}</div>`;
    }
    
    // Render product results
    if (!this._results || this._results.length === 0) {
      if (!this._typeRecommendations || this._typeRecommendations.length === 0) {
        this._list.innerHTML = `<div class="empty">Không có kết quả</div>`;
        this._list.classList.add("hidden");
        return;
      }
    } else {
      const productHtml = this._results
        .map((p) => {
          const id = p.product_id != null ? String(p.product_id) : "empty-cart";
          const img = `/local/product_pic/${id}.jpg`;
          const name = p.name || "Sản phẩm";
          const price =
            typeof p.price === "number"
              ? this._vnd(p.price)
              : p.price ?? "";
          const qty = p.quantity != null ? p.quantity : "";
          const type = p.type ? ` [${p.type}]` : "";
          return `
            <div class="item" data-product-id="${id}">
              <img class="thumb" src="${img}" onerror="this.src='/local/product_pic/empty-cart.jpg'">
              <div>
                <div class="title">${this._escape(name)}${type}</div>
                <div class="sub">${price}VNĐ${qty !== "" ? ` · Remaining ${qty}` : ""}</div>
              </div>
            </div>
          `;
        })
        .join("");
      html += productHtml;
    }

    this._list.innerHTML = html;
    this._list.classList.remove("hidden");

    // Add click handlers for product items
    this._list.querySelectorAll(".item").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const productId = el.getAttribute("data-product-id");
        if (productId && productId !== "empty-cart") {
          // Hiển thị popup chi tiết sản phẩm
          this._popup.show(productId, ApiConfig);
        }
      });
    });

    // Add click handlers for type recommendations
    this._list.querySelectorAll(".type-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedType = el.getAttribute("data-type");
        this._inputType.value = selectedType;
        this._lastType = selectedType;
        
        // Trigger search with new type
        const q = (this._input.value || "").trim();
        const t = selectedType;
        this._fetch(q, t);
      });
    });
  }

  _vnd(n) {
    try {
      return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    } catch (e) {
      return `${n} ₫`;
    }
  }

  _escape(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  static getConfigElement() { return document.createElement("hui-text-card-editor"); }
  static getStubConfig() { return { placeholder: "Enter product name..." }; }
}

customElements.define('general-search-card', GeneralSearchCard);