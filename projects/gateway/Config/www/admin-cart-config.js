class AdminCartConfigCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._cartList = [];
    this._expandedCarts = new Set();
    this._configData = {};
    this._newCartData = {};
  }

  setConfig(config) {
    this._config = Object.assign({
      title: "Admin Cart Configuration",
      show_header: true
    }, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
    this._loadCartList();
  }

  getCardSize() {
    return 6;
  }

  _render() {
    const style = `
      :host { 
        display: block; 
        font-family: system-ui, Roboto, Arial, sans-serif;
        background: var(--card-background-color, #1e1e1e);
        border-radius: 12px;
        padding: 16px;
        margin: 8px;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color, #2a2a2a);
      }
      
      .title {
        font-size: 20px;
        font-weight: 600;
        color: var(--primary-text-color, #eaeaea);
      }
      
      .header-buttons {
        display: flex;
        gap: 12px;
      }
      
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .btn-refresh {
        background: var(--primary-color, #1976d2);
        color: white;
      }
      
      .btn-post {
        background: var(--success-color, #4caf50);
        color: white;
      }
      
      .btn-secondary {
        background: var(--secondary-color, #666);
        color: white;
      }
      
      button:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }
      
      .cart-item {
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 8px;
        margin-bottom: 12px;
        overflow: hidden;
      }
      
      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--secondary-background-color, #252525);
        cursor: pointer;
        user-select: none;
      }
      
      .cart-header:hover {
        background: var(--state-hover-color, #333);
      }
      
      .cart-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color, #eaeaea);
        font-weight: 500;
      }
      
      .expand-icon {
        transition: transform 0.2s ease;
        color: var(--secondary-text-color, #9aa0a6);
      }
      
      .expand-icon.expanded {
        transform: rotate(90deg);
      }
      
      .cart-content {
        padding: 16px;
        background: var(--card-background-color, #1e1e1e);
        display: none;
      }
      
      .cart-content.expanded {
        display: block;
      }
      
      .config-grid {
        display: grid;
        gap: 12px;
      }
      
      .config-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .config-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color, #9aa0a6);
        text-transform: uppercase;
      }
      
      .config-input {
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 6px;
        background: var(--secondary-background-color, #252525);
        color: var(--primary-text-color, #eaeaea);
        font-size: 14px;
      }
      
      .config-input:focus {
        outline: none;
        border-color: var(--primary-color, #1976d2);
      }
      
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, #2a2a2a);
      }
      
      .new-cart-section {
        border: 2px dashed var(--divider-color, #2a2a2a);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        display: none;
      }
      
      .new-cart-section.visible {
        display: block;
      }
      
      .status {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 12px;
      }
      
      .status.success {
        background: rgba(76, 175, 80, 0.1);
        color: var(--success-color, #4caf50);
        border: 1px solid var(--success-color, #4caf50);
      }
      
      .status.error {
        background: rgba(244, 67, 54, 0.1);
        color: var(--error-color, #f44336);
        border: 1px solid var(--error-color, #f44336);
      }
      
      .loading {
        opacity: 0.6;
        pointer-events: none;
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="container">
        <div class="header">
          <div class="title">${this._config.title}</div>
          <div class="header-buttons">
            <button class="btn-refresh" onclick="this.getRootNode().host._refreshAllCarts()">
              🔄 Refresh All
            </button>
            <button class="btn-post" onclick="this.getRootNode().host._postAllConfigs()">
              💾 Save All Changes
            </button>
          </div>
        </div>
        
        <div class="status-container"></div>
        
        <div class="new-cart-section">
          <h3>Add New Cart</h3>
          <div class="config-grid">
            <div class="config-field">
              <label class="config-label">Cart ID</label>
              <input class="config-input" id="new-cart-id" type="number" placeholder="Enter cart ID">
            </div>
            <div class="config-field">
              <label class="config-label">MAC Address</label>
              <input class="config-input" id="new-cart-mac" placeholder="AA:BB:CC:DD:EE:FF">
            </div>
            <div class="config-field">
              <label class="config-label">Position UUID</label>
              <input class="config-input" id="new-cart-position" placeholder="UUID for position">
            </div>
            <div class="config-field">
              <label class="config-label">State UUID</label>
              <input class="config-input" id="new-cart-state" placeholder="UUID for state">
            </div>
            <div class="config-field">
              <label class="config-label">Voice Command UUID</label>
              <input class="config-input" id="new-cart-voice" placeholder="UUID for voice command">
            </div>
            <div class="config-field">
              <label class="config-label">Firmware Update UUID</label>
              <input class="config-input" id="new-cart-firmware" placeholder="UUID for firmware">
            </div>
            <div class="config-field">
              <label class="config-label">Camera Stream URL</label>
              <input class="config-input" id="new-cart-camera" placeholder="http://192.168.1.100:8080/stream">
            </div>
          </div>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="btn-post" onclick="this.getRootNode().host._createNewCart()">
              ➕ Create Cart
            </button>
            <button class="btn-secondary" onclick="this.getRootNode().host._cancelNewCart()">
              ❌ Cancel
            </button>
          </div>
        </div>
        
        <div class="cart-list"></div>
        
        <div class="footer">
          <button class="btn-secondary" onclick="this.getRootNode().host._showNewCartForm()">
            ➕ New Cart
          </button>
          <button class="btn-secondary" onclick="this.getRootNode().host._navigateToFirmware()">
            🔧 Update Firmware
          </button>
        </div>
      </div>
    `;

    this._rendered = true;
  }

  _loadCartList() {
    if (!this._hass) return;
    
    const cartListEntity = this._hass.states["input_text.admin_cart_list"];
    if (cartListEntity) {
      const cartListStr = cartListEntity.state || "";
      this._cartList = cartListStr.split(",")
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      this._renderCartList();
    }
  }

  _renderCartList() {
    const container = this.shadowRoot.querySelector(".cart-list");
    if (!container) return;

    const html = this._cartList.map(cartId => {
      const isExpanded = this._expandedCarts.has(cartId);
      const config = this._getCartConfig(cartId);
      
      return `
        <div class="cart-item">
          <div class="cart-header" onclick="this.getRootNode().host._toggleCart(${cartId})">
            <div class="cart-title">
              <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>
              📋 Cart ${cartId}
            </div>
            <button class="btn-refresh" onclick="event.stopPropagation(); this.getRootNode().host._refreshCart(${cartId})">
              🔄
            </button>
          </div>
          <div class="cart-content ${isExpanded ? 'expanded' : ''}">
            ${this._renderCartConfig(cartId, config)}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = html;
  }

  _renderCartConfig(cartId, config) {
    return `
      <div class="config-grid">
        <div class="config-field">
          <label class="config-label">MAC Address</label>
          <input class="config-input" data-cart="${cartId}" data-field="cart_mac_address" 
                 value="${config.cart_mac_address || ''}" 
                 placeholder="AA:BB:CC:DD:EE:FF">
        </div>
        <div class="config-field">
          <label class="config-label">Position UUID</label>
          <input class="config-input" data-cart="${cartId}" data-field="cart_position" 
                 value="${config.cart_position || ''}" 
                 placeholder="UUID for position">
        </div>
        <div class="config-field">
          <label class="config-label">State UUID</label>
          <input class="config-input" data-cart="${cartId}" data-field="cart_state" 
                 value="${config.cart_state || ''}" 
                 placeholder="UUID for state">
        </div>
        <div class="config-field">
          <label class="config-label">Voice Command UUID</label>
          <input class="config-input" data-cart="${cartId}" data-field="cart_voice_cmd" 
                 value="${config.cart_voice_cmd || ''}" 
                 placeholder="UUID for voice command">
        </div>
        <div class="config-field">
          <label class="config-label">Firmware Update UUID</label>
          <input class="config-input" data-cart="${cartId}" data-field="cart_firmware_update" 
                 value="${config.cart_firmware_update || ''}" 
                 placeholder="UUID for firmware">
        </div>
        <div class="config-field">
          <label class="config-label">Camera Stream URL</label>
          <input class="config-input" data-cart="${cartId}" data-field="cam_stream_url" 
                 value="${config.cam_stream_url || ''}" 
                 placeholder="http://192.168.1.100:8080/stream">
        </div>
      </div>
    `;
  }

  _getCartConfig(cartId) {
    try {
      const entityId = `input_text.cart_new_config_${cartId}`;
      const entity = this._hass.states[entityId];
      if (entity && entity.state) {
        return JSON.parse(entity.state);
      }
    } catch (e) {
      console.warn(`Failed to parse config for cart ${cartId}:`, e);
    }
    return {};
  }

  _toggleCart(cartId) {
    if (this._expandedCarts.has(cartId)) {
      this._expandedCarts.delete(cartId);
    } else {
      this._expandedCarts.add(cartId);
    }
    this._renderCartList();
  }

  async _refreshCart(cartId) {
    this._showStatus(`Refreshing cart ${cartId}...`, 'info');
    
    try {
      const apiBase = this._hass.states["input_text.api_base"].state;
      const url = `${apiBase}/cart_infor/${cartId}`;
      
      const response = await fetch(url, {
        headers: { Accept: "application/json" }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update cart_new_config entity
      await this._hass.callService('input_text', 'set_value', {
        entity_id: `input_text.cart_new_config_${cartId}`,
        value: JSON.stringify(data)
      });
      
      this._showStatus(`Cart ${cartId} refreshed successfully!`, 'success');
      this._renderCartList();
      
    } catch (error) {
      console.error(`Failed to refresh cart ${cartId}:`, error);
      this._showStatus(`Failed to refresh cart ${cartId}: ${error.message}`, 'error');
    }
  }

  async _refreshAllCarts() {
    this._showStatus('Refreshing all carts...', 'info');
    
    for (const cartId of this._cartList) {
      try {
        await this._refreshCart(cartId);
      } catch (error) {
        console.error(`Failed to refresh cart ${cartId}:`, error);
      }
    }
    
    this._showStatus('All carts refreshed!', 'success');
  }

  async _postAllConfigs() {
    this._showStatus('Saving all configurations...', 'info');
    
    // Collect all changed configs from UI
    const inputs = this.shadowRoot.querySelectorAll('.config-input[data-cart]');
    const updates = {};
    
    inputs.forEach(input => {
      const cartId = input.dataset.cart;
      const field = input.dataset.field;
      const value = input.value;
      
      if (!updates[cartId]) updates[cartId] = {};
      updates[cartId][field] = value;
    });
    
    // POST each cart config
    for (const [cartId, config] of Object.entries(updates)) {
      try {
        await this._postCartConfig(parseInt(cartId), config);
      } catch (error) {
        console.error(`Failed to save cart ${cartId}:`, error);
        this._showStatus(`Failed to save cart ${cartId}: ${error.message}`, 'error');
        return;
      }
    }
    
    this._showStatus('All configurations saved successfully!', 'success');
  }

  async _postCartConfig(cartId, configData) {
    const apiBase = this._hass.states["input_text.api_base"].state;
    const url = `${apiBase}/cart_infor/${cartId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(configData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }

  _showNewCartForm() {
    const form = this.shadowRoot.querySelector('.new-cart-section');
    form.classList.add('visible');
  }

  _cancelNewCart() {
    const form = this.shadowRoot.querySelector('.new-cart-section');
    form.classList.remove('visible');
    
    // Clear form
    form.querySelectorAll('input').forEach(input => input.value = '');
  }

  async _createNewCart() {
    const cartId = parseInt(this.shadowRoot.querySelector('#new-cart-id').value);
    if (!cartId || cartId <= 0) {
      this._showStatus('Please enter a valid cart ID', 'error');
      return;
    }
    
    // Check if cart already exists
    if (this._cartList.includes(cartId)) {
      this._showStatus(`Cart ${cartId} already exists`, 'error');
      return;
    }
    
    // Collect new cart data
    const configData = {
      cart_mac_address: this.shadowRoot.querySelector('#new-cart-mac').value,
      cart_position: this.shadowRoot.querySelector('#new-cart-position').value,
      cart_state: this.shadowRoot.querySelector('#new-cart-state').value,
      cart_voice_cmd: this.shadowRoot.querySelector('#new-cart-voice').value,
      cart_firmware_update: this.shadowRoot.querySelector('#new-cart-firmware').value,
      cam_stream_url: this.shadowRoot.querySelector('#new-cart-camera').value
    };
    
    try {
      // POST to API
      await this._postCartConfig(cartId, configData);
      
      // Add to cart list
      this._cartList.push(cartId);
      await this._hass.callService('input_text', 'set_value', {
        entity_id: 'input_text.admin_cart_list',
        value: this._cartList.join(',')
      });
      
      // Create entities for new cart
      await this._createCartEntities(cartId);
      
      // Update cart config
      await this._hass.callService('input_text', 'set_value', {
        entity_id: `input_text.cart_new_config_${cartId}`,
        value: JSON.stringify(configData)
      });
      
      this._showStatus(`Cart ${cartId} created successfully!`, 'success');
      this._cancelNewCart();
      this._renderCartList();
      
    } catch (error) {
      console.error(`Failed to create cart ${cartId}:`, error);
      this._showStatus(`Failed to create cart ${cartId}: ${error.message}`, 'error');
    }
  }

  async _createCartEntities(cartId) {
    // Note: In real HA, you'd need to add these to configuration.yaml
    // For now, we'll just create them programmatically if they don't exist
    
    const entities = [
      `input_text.cart_new_config_${cartId}`,
      `input_text.cart_old_config_${cartId}`
    ];
    
    for (const entityId of entities) {
      try {
        // Check if entity exists
        if (!this._hass.states[entityId]) {
          console.warn(`Entity ${entityId} needs to be added to configuration.yaml`);
        }
      } catch (error) {
        console.error(`Error checking entity ${entityId}:`, error);
      }
    }
  }

  _navigateToFirmware() {
    // Navigate to firmware update page
    // This would typically be handled by the dashboard routing system
    window.location.hash = '#admin-firmware-update';
    
    // Or dispatch a custom event
    this.dispatchEvent(new CustomEvent('navigate-to-firmware', {
      bubbles: true,
      composed: true
    }));
  }

  _showStatus(message, type = 'info') {
    const container = this.shadowRoot.querySelector('.status-container');
    container.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        container.innerHTML = '';
      }, 3000);
    }
  }

  static getStubConfig() {
    return {
      title: "Admin Cart Configuration"
    };
  }
}

customElements.define('admin-cart-config-card', AdminCartConfigCard);
