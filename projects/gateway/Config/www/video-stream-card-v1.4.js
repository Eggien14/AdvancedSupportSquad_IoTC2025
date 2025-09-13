import ApiConfig from '/local/api-config.js';

class VideoStreamCard extends HTMLElement {
  setConfig(config) {
    this.config = Object.assign({
      cart_id: null,
      title: "",
      aspect_ratio: "66.66%", // 2:3 ratio
      auto_start: false,
      collapsed: false,
    }, config);

    if (!this.config.cart_id) throw new Error("Please define cart_id");

    this._expanded = !this.config.collapsed;
    this._viewing = !!this.config.auto_start && this._expanded;

    // states
    this._micState = "0";   // "0" or "1"
    this._camState = "0";   // "0" or "1"
    this._cartState = "0";  // "0", "1", "2"

    // keep previous values to detect transitions
    this._prevCamState = "0";
    this._prevCartState = "0";

    // persistent alert (user must dismiss)
    this._cartAlertVisible = false;
    this._cartAlertState = null; // "1" or "2" when alert triggered

    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this._updateStates();
    this._buildStreamUrl();
    this.render();
  }

  _updateStates() {
    if (!this._hass) return;
    const entityId = `sensor.cart_state_${this.config.cart_id}`;
    // expected formats:
    // "mic,cam,cart"  OR backwards compatible "mic,cam"
    const raw = this._hass.states[entityId]?.state || "0,0,0";
    const parts = raw.split(",").map(x => x.trim());
    const mic = parts[0] || "0";
    const cam = parts[1] || "0";
    const cart = parts[2] || "0";

    // mic always update
    this._micState = mic;

    // camera: trigger start/stop only on change or when needed
    if (this._camState !== cam) {
      this._prevCamState = this._camState;
      this._camState = cam;

      if (this._camState === "1" && !this._viewing) this._startViewing();
      if (this._camState === "0" && this._viewing) this._stopViewing();
    } else {
      // still keep the value (in case of initial load)
      this._camState = cam;
    }

    // cart state: detect 0 -> (1|2) transition and show persistent popup
    if (this._cartState !== cart) {
      this._prevCartState = this._cartState;
      this._cartState = cart;

      if (this._prevCartState === "0" && (cart === "1" || cart === "2")) {
        // trigger persistent alert (user must dismiss)
        this._cartAlertVisible = true;
        this._cartAlertState = cart;
      }
    } else {
      this._cartState = cart;
    }

    // ensure UI updates
    this.render();
  }

  _buildStreamUrl() {
    if (!this._hass) return;
    const apiBase = ApiConfig.getApiBaseAuto();
    if (!apiBase) return;

    let scheme = this.config.scheme;
    let host = apiBase;
    let port = this.config.port;
    try {
      if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
        const u = new URL(apiBase);
        scheme = u.protocol.replace(":", "");
        host = u.hostname;
        if (u.port) port = u.port;
      }
    } catch (e) {}

    this._streamUrl = `${apiBase}/stream?cart_id=${encodeURIComponent(this.config.cart_id)}&_=${Date.now()}`;
  }

  _toggleExpanded() {
    this._expanded = !this._expanded;
    if (!this._expanded && this._viewing) this._stopViewing();
    this.render();
  }

  _toggleViewing() {
    if (this._viewing) this._stopViewing();
    else this._startViewing();
    this.render();
  }

  _startViewing() {
    this._viewing = true;
    this._buildStreamUrl();
  }

  _stopViewing() {
    this._viewing = false;
  }

  _dismissCartAlert() {
    this._cartAlertVisible = false;
    this._cartAlertState = null;
    this.render();
  }

  _showCartAlertManually() {
    if (!this._cartAlertVisible) {
      this._cartAlertVisible = true;
      // keep the current cart state as the alert reason
      this._cartAlertState = this._cartState === "0" ? "1" : this._cartState;
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;
    const title = this.config.title || `Cart ${this.config.cart_id}`;
    const aspect = this.config.aspect_ratio;

    const style = `
      <style>
        :host { display:block; box-sizing:border-box; font-family: Roboto, Arial, sans-serif; }
        .card { border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.15); background:#fff; color:#222; overflow:hidden; position:relative; }
        .card-header { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #ddd; cursor:pointer; }
        .title { font-weight:600; }
        .content { padding:8px; }
        .video-frame { position:relative; width:100%; background:#000; border-radius:8px; overflow:hidden; }
        .video-frame::before { content:""; display:block; padding-top:${aspect}; }
        .video-frame img, .placeholder { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
        .placeholder { display:flex; align-items:center; justify-content:center; background:#fff; color:#666; font-size:14px; }

        /* vertical status bar */
        .status-bar {
          position:absolute; top:8px; left:8px; display:flex; flex-direction:column; gap:10px; z-index:10;
        }
        .indicator { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.2); border:2px solid rgba(255,255,255,0.18); }
        .indicator.off { background: rgba(255,255,255,0.12); color:#ddd; }
        .indicator.on { background: linear-gradient(180deg,#4ade80,#16a34a); color:#053; color:#fff; }
        .indicator.cam-on { background: linear-gradient(180deg,#60a5fa,#0284c7); color:#fff; }
        .indicator.cart-normal { background: rgba(255,255,255,0.12); color:#c7f9d3; }
        .indicator.cart-warning { background: linear-gradient(180deg,#f59e0b,#d97706); color:#fff; }

        /* view button (floating) */
        .fab { position:absolute; right:8px; bottom:8px; width:44px; height:44px; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 2px 8px rgba(0,0,0,0.25); }
        .fab.viewing { background: linear-gradient(180deg,#ef4444,#dc2626); color:white; }
        .fab.stopped { background: linear-gradient(180deg,#94a3b8,#64748b); color:white; }

        .collapsed-bar { display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; background:#f5f5f5; font-weight:600; }

        /* cart alert modal */
        .cart-alert-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.42); z-index:60; }
        .cart-alert { background:#fff; color:#111; border-radius:10px; padding:16px; width:320px; box-shadow:0 8px 30px rgba(0,0,0,0.3); }
        .cart-alert-title { font-weight:700; margin-bottom:8px; }
        .cart-alert-body { margin-bottom:12px; line-height:1.3; }
        .cart-alert-actions { text-align:right; }
        .btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; }
        .btn.dismiss { background:#0ea5a4; color:white; }
        .btn.secondary { background:#e5e7eb; color:#111; margin-right:8px; }
      </style>
    `;

    let html = "";
    if (this._expanded) {
      html = `
        <div class="card">
          <div class="card-header" id="toggleExpand">
            <div class="title">${title}</div>
            <div>▲</div>
          </div>

          <div class="content">
            <div class="video-frame">
              ${this._viewing ? `<img src="${this._streamUrl}" />` : `<div class="placeholder">Put product in front of the camera to start detect</div>`}

              <div class="status-bar">
                <!-- microphone indicator (visual toggle style) -->
                <div class="indicator mic ${this._micState === '1' ? 'on' : 'off'}" title="Microphone: ${this._micState === '1' ? 'ON' : 'OFF'}">
                  <span style="font-size:11px">MIC</span>
                </div>

                <!-- camera indicator (clickable: toggles viewing) -->
                <div class="indicator cam ${this._camState === '1' ? 'cam-on' : 'off'}" id="camIndicator" title="Camera: ${this._camState === '1' ? 'ON' : 'OFF'}">
                  <span style="font-size:11px">CAM</span>
                </div>

                <!-- cart state indicator -->
                <div class="indicator cart ${this._cartState === '0' ? 'cart-normal' : 'cart-warning'}" id="cartIndicator" title="Cart state: ${this._cartState}">
                  <span style="font-size:11px">${this._cartState === '0' ? 'OK' : (this._cartState === '1' ? 'TILT' : 'SHAKE')}</span>
                </div>
              </div>

              <button class="fab ${this._viewing ? 'viewing' : 'stopped'}" id="toggleView">${this._viewing ? 'STOP' : 'VIEW'}</button>

              ${this._cartAlertVisible ? `
                <div class="cart-alert-overlay" id="cartAlert">
                  <div class="cart-alert">
                    <div class="cart-alert-title">${this._cartAlertState === '1' ? 'Cart Tilt / Tip Warning' : 'Cart Rapid Movement Warning'}</div>
                    <div class="cart-alert-body">
                      ${this._cartAlertState === '1' ?
                        `This cart shows signs of tilting or tipping. Please stop and secure the load, check wheel alignment, and make sure the path is clear.` :
                        `This cart exhibits rapid movement or excessive shaking. Slow down, inspect for mechanical issues, and proceed with caution.`
                      }
                    </div>
                    <div class="cart-alert-actions">
                      <button class="btn secondary" id="cartAlertReview">Mark as reviewed</button>
                      <button class="btn dismiss" id="cartAlertDismiss">Dismiss</button>
                    </div>
                  </div>
                </div>
              ` : ''}

            </div>
          </div>
        </div>`;
    } else {
      html = `
        <div class="card collapsed-bar" id="toggleExpand">
          ▼ Tap here to detect your product
        </div>`;
    }

    this.shadowRoot.innerHTML = style + html;

    // event bindings
    this.shadowRoot.getElementById("toggleExpand")?.addEventListener("click", () => this._toggleExpanded());
    this.shadowRoot.getElementById("toggleView")?.addEventListener("click", (e) => { e.stopPropagation(); this._toggleViewing(); });

    const camIndicator = this.shadowRoot.getElementById("camIndicator");
    camIndicator?.addEventListener("click", (e) => { e.stopPropagation(); this._toggleViewing(); });

    const cartIndicator = this.shadowRoot.getElementById("cartIndicator");
    cartIndicator?.addEventListener("click", (e) => { e.stopPropagation(); this._showCartAlertManually(); });

    // cart alert buttons
    this.shadowRoot.getElementById("cartAlertDismiss")?.addEventListener("click", (e) => { e.stopPropagation(); this._dismissCartAlert(); });
    this.shadowRoot.getElementById("cartAlertReview")?.addEventListener("click", (e) => { e.stopPropagation(); this._dismissCartAlert(); /* could set different handling */ });
  }
}

customElements.define("video-stream-card", VideoStreamCard);

