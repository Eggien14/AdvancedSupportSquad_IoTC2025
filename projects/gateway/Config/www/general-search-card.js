class GeneralSearchCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._results = [];
    this._lastQuery = "";
    this._debounce = null;

    this._onWindowClick = (ev) => {
      const path = ev.composedPath ? ev.composedPath() : [];
      if (!path.includes(this)) this._reset();
    };
  }

  setConfig(config) {
    this._config = Object.assign({ placeholder: "Nhập tên sản phẩm..." }, config || {});
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
      input.search {
        width: 100%; box-sizing: border-box; padding: 12px 14px;
        border-radius: 10px; border: 1px solid var(--divider-color, #ddd);
        outline: none; font-size: 16px; background: var(--card-background-color, #1e1e1e);
        color: var(--primary-text-color, #eaeaea);
      }
      input.search::placeholder { color: var(--secondary-text-color, #9aa0a6); }
      .list {
        position: absolute; left: 0; right: 0; top: calc(100% + 6px);
        max-height: 380px; overflow: auto; border-radius: 12px;
        border: 1px solid var(--divider-color, #2a2a2a);
        background: var(--card-background-color, #111);
        box-shadow: 0 10px 24px rgba(0,0,0,.25);
        z-index: 2;
      }
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
        <input class="search" type="text" placeholder="${this._config.placeholder}" />
        <div class="list hidden"></div>
      </div>
    `;
    this._input = this.shadowRoot.querySelector("input.search");
    this._list = this.shadowRoot.querySelector(".list");

    this._input.addEventListener("input", (e) => this._onInput(e));
    window.addEventListener("click", this._onWindowClick, true);

    this._rendered = true;
  }

  disconnectedCallback() {
    window.removeEventListener("click", this._onWindowClick, true);
  }

  _reset() {
    if (!this._input) return;
    this._input.value = "";
    this._lastQuery = "";
    this._results = [];
    this._renderList();
  }

  _onInput(ev) {
    const q = (ev.target.value || "").trim();
    if (q === this._lastQuery) return;
    this._lastQuery = q;

    clearTimeout(this._debounce);
    this._debounce = setTimeout(() => {
      if (q === "") {
        this._results = [];
        this._renderList();
      } else {
        this._fetch(q);
      }
    }, 250);
  }

  async _fetch(q) {
    try {
      const apiBase =
        (this._hass &&
          this._hass.states["input_text.api_base"] &&
          this._hass.states["input_text.api_base"].state) ||
        "";
      if (!apiBase) throw new Error("Missing input_text.api_base");

      const url = `${apiBase}/products?name=${encodeURIComponent(q)}&limit=50`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      this._results = Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("general-search-cart fetch error:", e);
      this._results = [];
    }
    if ((this._input.value || "").trim() !== this._lastQuery) return;
    this._renderList();
  }

  _renderList() {
    if (!this._list) return;
    if (!this._results || this._results.length === 0) {
      this._list.innerHTML = `<div class="empty">Không có kết quả</div>`;
      this._list.classList.add("hidden");
      return;
    }

    const html = this._results
      .map((p) => {
        const id = p.product_id != null ? String(p.product_id) : "empty-cart";
        const img = `/local/product_pic/${id}.jpg`;
        const name = p.name || "Sản phẩm";
        const price =
          typeof p.price === "number"
            ? this._vnd(p.price)
            : p.price ?? "";
        const qty = p.quantity != null ? p.quantity : "";
        return `
          <div class="item" data-product-id="${id}">
            <img class="thumb" src="${img}" onerror="this.src='/local/product_pic/empty-cart.jpg'">
            <div>
              <div class="title">${this._escape(name)}</div>
              <div class="sub">${price}${qty !== "" ? ` · còn ${qty}` : ""}</div>
            </div>
          </div>
        `;
      })
      .join("");

    this._list.innerHTML = html;
    this._list.classList.remove("hidden");

    this._list.querySelectorAll(".item").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        alert("Hello world");
        this._reset();
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
  static getStubConfig() { return { placeholder: "Nhập tên sản phẩm..." }; }
}

customElements.define('general-search-card', GeneralSearchCard);