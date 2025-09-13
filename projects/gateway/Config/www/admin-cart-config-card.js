// Admin Cart Configuration Management
// Quản lý cấu hình cart cho Admin với đầy đủ tính năng

import ApiConfig from '/local/api-config.js';

class AdminCartConfigCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._cartList = [];
    this._expandedCarts = new Set();
    this._cartConfigs = {}; // Cache cart configs từ API
    this._rendered = false;
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
    this._loadCartListFromHA();
  }

  getCardSize() {
    return 8;
  }

  _render() {
    const style = `
      :host { 
        display: block; 
        font-family: system-ui, Roboto, Arial, sans-serif;customElements.define("admin-cart-config-card", AdminCartConfigCard);
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
        flex-wrap: wrap;
      }
      
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      
      .btn-primary {
        background: var(--primary-color, #2196F3);
        color: white;
      }
      
      .btn-primary:hover:not(:disabled) {
        background: var(--primary-color-dark, #1976D2);
        transform: translateY(-1px);
      }
      
      .btn-success {
        background: var(--success-color, #4CAF50);
        color: white;
      }
      
      .btn-success:hover:not(:disabled) {
        background: var(--success-color-dark, #45a049);
        transform: translateY(-1px);
      }
      
      .btn-warning {
        background: var(--warning-color, #FF9800);
        color: white;
      }
      
      .btn-warning:hover:not(:disabled) {
        background: var(--warning-color-dark, #F57C00);
        transform: translateY(-1px);
      }
      
      .btn-danger {
        background: var(--error-color, #f44336);
        color: white;
      }
      
      .btn-danger:hover:not(:disabled) {
        background: var(--error-color-dark, #d32f2f);
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: var(--secondary-background-color, #424242);
        color: var(--primary-text-color, #eaeaea);
        border: 1px solid var(--divider-color, #555);
      }
      
      .btn-secondary:hover:not(:disabled) {
        background: var(--state-hover-color, #333);
        border-color: var(--primary-color, #1976d2);
      }
      
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      
      .cart-item {
        margin-bottom: 12px;
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 8px;
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
      
      .cart-actions {
        display: flex;
        gap: 8px;
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
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
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
      
      .config-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }
      
      .status-container {
        margin-top: 16px;
      }
      
      .status {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 12px;
      }
      
      .status.success {
        background: rgba(76, 175, 80, 0.2);
        color: var(--success-color, #4CAF50);
        border: 1px solid var(--success-color, #4CAF50);
      }
      
      .status.error {
        background: rgba(244, 67, 54, 0.2);
        color: var(--error-color, #f44336);
        border: 1px solid var(--error-color, #f44336);
      }
      
      .status.info {
        background: rgba(33, 150, 243, 0.2);
        color: var(--primary-color, #2196F3);
        border: 1px solid var(--primary-color, #2196F3);
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
      
      .new-cart-section h3 {
        margin: 0 0 16px 0;
        color: var(--primary-color, #2196F3);
      }
      
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, #2a2a2a);
        flex-wrap: wrap;
        gap: 12px;
      }
    `;

    const html = `
      <div class="header">
        <div class="title">🛒 ${this._config.title}</div>
        <div class="header-buttons">
          <button class="btn-primary" onclick="this.getRootNode().host._refreshAllCarts()">
            🔄 REFRESH ALL CARTS
          </button>
          <button class="btn-success" onclick="this.getRootNode().host._saveAllChanges()">
            💾 SAVE ALL CHANGES
          </button>
        </div>
      </div>
      
      <div class="status-container"></div>
      
      <div class="new-cart-section">
        <h3>➕ Add New Cart</h3>
        <div class="config-grid">
          <div class="config-field">
            <label class="config-label">Cart ID</label>
            <input class="config-input" id="new-cart-id" type="number" placeholder="Enter cart ID" required>
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
          <button class="btn-success" onclick="this.getRootNode().host._createNewCart()">
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
        <button class="btn-warning" onclick="this.getRootNode().host._updateFirmware()">
          🔧 Update Firmware
        </button>
      </div>
    `;

    this.shadowRoot.innerHTML = `<style>${style}</style>${html}`;
    this._rendered = true;
  }

  // Load cart list từ Home Assistant input_text.admin_cart_list
  _loadCartListFromHA() {
    if (!this._hass) return;
    
    const cartListEntity = this._hass.states["input_text.admin_cart_list"];
    if (cartListEntity) {
      const cartListStr = cartListEntity.state || "";
      this._cartList = cartListStr.split(",")
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id) && id > 0);
      this._renderCartList();
    }
  }

  // REFRESH ALL CARTS - Call API list-all-cart và update HA
  async _refreshAllCarts() {
    const refreshBtn = this.shadowRoot.querySelector('.header-buttons .btn-primary');
    
    try {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '🔄 Loading...';
      this._showStatus('🔄 Loading all carts from server...', 'info');

      // 1. Call API list-all-cart
      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/cart_infor/list-all-cart`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const allCarts = await response.json();
      console.log('Loaded all carts from API:', allCarts);

      // 2. Extract cart IDs và update admin_cart_list
      const cartIds = allCarts.map(cart => cart.cart_id);
      if (cartIds.length > 0) {
        await this._hass.callService('input_text', 'set_value', {
          entity_id: 'input_text.admin_cart_list',
          value: cartIds.join(',')
        });
      }

      // 3. Cache cart configs và save to new_config sensors
      for (const cart of allCarts) {
        this._cartConfigs[cart.cart_id] = cart;
        await this._saveSensorData(cart.cart_id, cart, 'new_config');
      }

      // 4. Update UI
      this._cartList = cartIds;
      this._renderCartList();
      this._autoFillAllCarts();

      this._showStatus(`✅ Loaded ${allCarts.length} carts successfully!`, 'success');

    } catch (error) {
      console.error('Failed to refresh all carts:', error);
      this._showStatus(`❌ Failed to load carts: ${error.message}`, 'error');
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 REFRESH ALL CARTS';
    }
  }

  // Render cart list
  _renderCartList() {
    const container = this.shadowRoot.querySelector(".cart-list");
    if (!container) return;

    if (this._cartList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--secondary-text-color, #9aa0a6);">
          <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
          <div>No carts configured</div>
          <div style="font-size: 12px; margin-top: 8px;">Click "REFRESH ALL CARTS" to load from server</div>
        </div>
      `;
      return;
    }

    const html = this._cartList.map(cartId => {
      const isExpanded = this._expandedCarts.has(cartId);
      
      return `
        <div class="cart-item">
          <div class="cart-header" onclick="this.getRootNode().host._toggleCart(${cartId})">
            <div class="cart-title">
              <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>
              🛒 Cart ${cartId}
            </div>
            <div class="cart-actions" onclick="event.stopPropagation()">
              <button class="btn-primary" onclick="this.getRootNode().host._refreshSingleCart(${cartId})">
                🔄 REFRESH CART
              </button>
            </div>
          </div>
          <div class="cart-content ${isExpanded ? 'expanded' : ''}">
            ${this._renderCartConfig(cartId)}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = html;
  }

  // Render cart configuration form
  _renderCartConfig(cartId) {
    const config = this._cartConfigs[cartId] || {};
    
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
      <div class="config-actions">
        <button class="btn-success" onclick="this.getRootNode().host._saveCartChanges(${cartId})">
          💾 SAVE CHANGES
        </button>
        <button class="btn-danger" onclick="this.getRootNode().host._deleteCart(${cartId})">
          🗑️ DELETE CART
        </button>
      </div>
    `;
  }

  // Toggle cart expand/collapse
  _toggleCart(cartId) {
    if (this._expandedCarts.has(cartId)) {
      this._expandedCarts.delete(cartId);
    } else {
      this._expandedCarts.add(cartId);
    }
    this._renderCartList();
  }

  // Refresh single cart from API
  async _refreshSingleCart(cartId) {
    try {
      this._showStatus(`🔄 Refreshing cart ${cartId}...`, 'info');

      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/cart_infor/${cartId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const cartConfig = await response.json();
      console.log(`Refreshed cart ${cartId}:`, cartConfig);

      // Cache config và save to new_config sensor
      this._cartConfigs[cartId] = cartConfig;
      await this._saveSensorData(cartId, cartConfig, 'new_config');

      // Auto fill form với data từ API
      this._autoFillCartForm(cartId, cartConfig);

      this._showStatus(`✅ Cart ${cartId} refreshed and auto-filled successfully!`, 'success');

    } catch (error) {
      console.error(`Failed to refresh cart ${cartId}:`, error);
      this._showStatus(`❌ Failed to refresh cart ${cartId}: ${error.message}`, 'error');
    }
  }

  // Auto fill tất cả cart forms từ cached data
  _autoFillAllCarts() {
    this._cartList.forEach(cartId => {
      if (this._cartConfigs[cartId]) {
        this._autoFillCartForm(cartId, this._cartConfigs[cartId]);
      }
    });
  }

  // Auto fill single cart form với data
  _autoFillCartForm(cartId, configData) {
    if (!configData) {
      configData = this._cartConfigs[cartId];
      if (!configData) return;
    }

    // Find all inputs for this cart và fill với data từ API
    const inputs = this.shadowRoot.querySelectorAll(`input[data-cart="${cartId}"]`);
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      if (configData[field] !== undefined) {
        input.value = configData[field] || '';
      }
    });
  }

  // Save single cart changes
  async _saveCartChanges(cartId) {
    try {
      this._showStatus(`💾 Saving cart ${cartId} changes...`, 'info');

      // Collect form data from input boxes
      const configData = {};
      const inputs = this.shadowRoot.querySelectorAll(`input[data-cart="${cartId}"]`);
      
      inputs.forEach(input => {
        const field = input.getAttribute('data-field');
        configData[field] = input.value.trim() || null;
      });

      console.log(`Saving cart ${cartId} config:`, configData);

      // 1. POST to API với data từ input boxes
      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/cart_infor/${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`Cart ${cartId} saved:`, result);

      // 2. Update cache với data từ input boxes
      this._cartConfigs[cartId] = configData;

      // 3. Save to new_config sensor với data từ input boxes
      await this._saveSensorData(cartId, configData, 'new_config');

      this._showStatus(`✅ Cart ${cartId} saved successfully!`, 'success');

    } catch (error) {
      console.error(`Failed to save cart ${cartId}:`, error);
      this._showStatus(`❌ Failed to save cart ${cartId}: ${error.message}`, 'error');
    }
  }

  // Save ALL changes for all carts
  async _saveAllChanges() {
    const saveBtn = this.shadowRoot.querySelector('.header-buttons .btn-success');
    
    try {
      saveBtn.disabled = true;
      saveBtn.textContent = '💾 Saving...';
      this._showStatus('💾 Saving all cart configurations...', 'info');

      let savedCount = 0;
      let errorCount = 0;

      // Save each cart
      for (const cartId of this._cartList) {
        try {
          // Collect form data from input boxes
          const configData = {};
          const inputs = this.shadowRoot.querySelectorAll(`input[data-cart="${cartId}"]`);
          
          inputs.forEach(input => {
            const field = input.getAttribute('data-field');
            configData[field] = input.value.trim() || null;
          });

          // POST to API với data từ input boxes
          const apiBase = ApiConfig.getApiBaseAuto();
          const response = await fetch(`${apiBase}/cart_infor/${cartId}`, {
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

          const result = await response.json();
          
          // Update cache và new_config sensor với data từ input boxes
          this._cartConfigs[cartId] = configData;
          await this._saveSensorData(cartId, configData, 'new_config');
          
          savedCount++;
          
        } catch (error) {
          console.error(`Failed to save cart ${cartId}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        this._showStatus(`✅ All ${savedCount} carts saved successfully!`, 'success');
      } else {
        this._showStatus(`⚠️ Saved ${savedCount} carts, ${errorCount} failed`, 'error');
      }

    } catch (error) {
      console.error('Failed to save all changes:', error);
      this._showStatus(`❌ Failed to save changes: ${error.message}`, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 SAVE ALL CHANGES';
    }
  }

  // Delete cart
  async _deleteCart(cartId) {
    const confirmed = confirm(`Are you sure you want to delete Cart ${cartId}?\n\nThis will remove the cart configuration from the server and update the cart list.`);
    
    if (!confirmed) return;

    try {
      this._showStatus(`🗑️ Deleting cart ${cartId}...`, 'info');

      // 1. Call delete API
      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/cart_infor/delete-cart/${cartId}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`Cart ${cartId} deleted:`, result);

      // 2. Remove from cart list và update HA
      this._cartList = this._cartList.filter(id => id !== cartId);
      await this._hass.callService('input_text', 'set_value', {
        entity_id: 'input_text.admin_cart_list',
        value: this._cartList.join(',')
      });

      // 3. Remove from cache
      delete this._cartConfigs[cartId];
      this._expandedCarts.delete(cartId);

      // 4. Update UI
      this._renderCartList();

      this._showStatus(`✅ Cart ${cartId} deleted successfully!`, 'success');

    } catch (error) {
      console.error(`Failed to delete cart ${cartId}:`, error);
      this._showStatus(`❌ Failed to delete cart ${cartId}: ${error.message}`, 'error');
    }
  }

  // Show new cart form
  _showNewCartForm() {
    const section = this.shadowRoot.querySelector('.new-cart-section');
    section.classList.add('visible');
    
    // Clear form
    const inputs = section.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
    
    // Focus on cart ID input
    const cartIdInput = section.querySelector('#new-cart-id');
    cartIdInput.focus();
  }

  // Cancel new cart form
  _cancelNewCart() {
    const section = this.shadowRoot.querySelector('.new-cart-section');
    section.classList.remove('visible');
  }

  // Create new cart
  async _createNewCart() {
    const cartIdInput = this.shadowRoot.querySelector('#new-cart-id');
    const cartId = parseInt(cartIdInput.value);
    
    if (!cartId || cartId <= 0) {
      this._showStatus('❌ Please enter a valid cart ID', 'error');
      return;
    }
    
    // Check if cart already exists
    if (this._cartList.includes(cartId)) {
      this._showStatus(`❌ Cart ${cartId} already exists`, 'error');
      return;
    }

    try {
      this._showStatus(`➕ Creating cart ${cartId}...`, 'info');

      // Collect new cart data from input boxes
      const configData = {
        cart_mac_address: this.shadowRoot.querySelector('#new-cart-mac').value.trim() || null,
        cart_position: this.shadowRoot.querySelector('#new-cart-position').value.trim() || null,
        cart_state: this.shadowRoot.querySelector('#new-cart-state').value.trim() || null,
        cart_voice_cmd: this.shadowRoot.querySelector('#new-cart-voice').value.trim() || null,
        cart_firmware_update: this.shadowRoot.querySelector('#new-cart-firmware').value.trim() || null,
        cam_stream_url: this.shadowRoot.querySelector('#new-cart-camera').value.trim() || null
      };

      console.log(`Creating cart ${cartId} with config:`, configData);

      // 1. POST to API để tạo cart mới
      const apiBase = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/cart_infor/${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`Cart ${cartId} created:`, result);

      // 2. Add to cart list và update admin_cart_list
      this._cartList.push(cartId);
      await this._hass.callService('input_text', 'set_value', {
        entity_id: 'input_text.admin_cart_list',
        value: this._cartList.join(',')
      });

      // 3. Cache config - không cần tạo template sensor mới
      this._cartConfigs[cartId] = configData;

      // 4. Update UI
      this._renderCartList();
      this._cancelNewCart();

      // 5. Thông báo thành công
      const supportedCarts = [142, 105];
      if (supportedCarts.includes(cartId)) {
        this._showStatus(`✅ Cart ${cartId} created successfully! Data will be saved to input_text entities.`, 'success');
      } else {
        this._showStatus(`✅ Cart ${cartId} created successfully!\n\n⚠️ Note: This cart will only store data in cache/API (no input_text entities). Only carts 142, 105 have persistent storage.`, 'warning');
      }

    } catch (error) {
      console.error(`Failed to create cart ${cartId}:`, error);
      this._showStatus(`❌ Failed to create cart ${cartId}: ${error.message}`, 'error');
    }
  }

  // Update Firmware - Copy new_config to old_config
  async _updateFirmware() {
    const confirmed = confirm('Update Firmware for all carts?\n\nThis will copy all "new_config" to "old_config" for all carts.');
    
    if (!confirmed) return;

    try {
      this._showStatus('🔧 Updating firmware for all carts...', 'info');

      let updatedCount = 0;

      for (const cartId of this._cartList) {
        try {
          // Read new_config data from input_text
          const newConfigData = this._readSensorData(cartId, 'new_config');
          
          if (newConfigData && Object.keys(newConfigData).length > 1) { // More than just cart_id
            // Save to old_config input_text fields
            await this._saveSensorData(cartId, newConfigData, 'old_config');
            
            console.log(`🔄 Updated cart_${cartId}_old_config with:`, newConfigData);
            updatedCount++;
          } else {
            console.warn(`⚠️ No new_config data found for cart ${cartId}`);
          }
          
        } catch (error) {
          console.error(`❌ Failed to update firmware for cart ${cartId}:`, error);
        }
      }

      this._showStatus(`✅ Firmware update completed for ${updatedCount} carts!`, 'success');

    } catch (error) {
      console.error('Failed to update firmware:', error);
      this._showStatus(`❌ Failed to update firmware: ${error.message}`, 'error');
    }
  }

  // Save data to shared input_text fields using comma-separated format
  async _saveSensorData(cartId, configData, type = 'new_config') {
    try {
      if (!this._hass || !configData) return;

      console.log(`Saving cart ${cartId} ${type} config to shared input_text:`, configData);

      // Get cart list từ admin_cart_list
      const cartListEntity = this._hass.states["input_text.admin_cart_list"];
      if (!cartListEntity) {
        console.error('admin_cart_list not found');
        return;
      }

      const cartListStr = cartListEntity.state || "";
      if (!cartListStr.trim()) {
        console.error('admin_cart_list is empty');
        return;
      }

      const cartList = cartListStr.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      const cartIndex = cartList.indexOf(cartId);
      
      if (cartIndex === -1) {
        console.error(`Cart ${cartId} not found in admin_cart_list`);
        return;
      }

      // Map API field names to HA field names
      const fieldMapping = {
        'cart_mac_address': type === 'new_config' ? 'cart_new_mac_address' : 'cart_old_mac_address',
        'cart_position': type === 'new_config' ? 'cart_new_position_uuid' : 'cart_old_position_uuid',
        'cart_state': type === 'new_config' ? 'cart_new_state_uuid' : 'cart_old_state_uuid',
        'cart_voice_cmd': type === 'new_config' ? 'cart_new_voice_uuid' : 'cart_old_voice_uuid',
        'cart_firmware_update': type === 'new_config' ? 'cart_new_firmware_uuid' : 'cart_old_firmware_uuid',
        'cam_stream_url': type === 'new_config' ? 'cart_new_camera_url' : 'cart_old_camera_url'
      };

      // Update each field
      for (const [apiField, haField] of Object.entries(fieldMapping)) {
        if (configData[apiField] !== undefined) {
          // Get current value
          const currentEntity = this._hass.states[`input_text.${haField}`];
          const currentValue = currentEntity ? (currentEntity.state || '') : '';
          
          // Split current value to array - handle empty string
          const valueArray = currentValue.trim() ? currentValue.split(',') : [];
          
          // Ensure array has enough elements for all carts
          while (valueArray.length < cartList.length) {
            valueArray.push('');
          }
          
          // Update value at cart index
          valueArray[cartIndex] = configData[apiField] || '';
          
          // Join back to comma-separated string
          const newValue = valueArray.join(',');
          
          // Save to HA
          await this._hass.callService('input_text', 'set_value', {
            entity_id: `input_text.${haField}`,
            value: newValue
          });
          
          console.log(`✅ Updated ${haField}[${cartIndex}]: "${configData[apiField]}" (full: "${newValue}")`);
        }
      }

      console.log(`✅ Completed saving cart ${cartId} ${type} config at index ${cartIndex}`);
      
    } catch (error) {
      console.error(`Failed to save sensor data for cart ${cartId}:`, error);
      throw error;
    }
  }

  // Read data from shared input_text fields using comma-separated format
  _readSensorData(cartId, type = 'new_config') {
    try {
      if (!this._hass) return null;

      // Get cart list từ admin_cart_list
      const cartListEntity = this._hass.states["input_text.admin_cart_list"];
      if (!cartListEntity) {
        console.error('admin_cart_list not found');
        return null;
      }

      const cartListStr = cartListEntity.state || "";
      if (!cartListStr.trim()) {
        console.error('admin_cart_list is empty');
        return null;
      }

      const cartList = cartListStr.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      const cartIndex = cartList.indexOf(cartId);
      
      if (cartIndex === -1) {
        console.error(`Cart ${cartId} not found in admin_cart_list`);
        return null;
      }

      // Map API field names to HA field names
      const fieldMapping = {
        'cart_mac_address': type === 'new_config' ? 'cart_new_mac_address' : 'cart_old_mac_address',
        'cart_position': type === 'new_config' ? 'cart_new_position_uuid' : 'cart_old_position_uuid',
        'cart_state': type === 'new_config' ? 'cart_new_state_uuid' : 'cart_old_state_uuid',
        'cart_voice_cmd': type === 'new_config' ? 'cart_new_voice_uuid' : 'cart_old_voice_uuid',
        'cart_firmware_update': type === 'new_config' ? 'cart_new_firmware_uuid' : 'cart_old_firmware_uuid',
        'cam_stream_url': type === 'new_config' ? 'cart_new_camera_url' : 'cart_old_camera_url'
      };
      
      const configData = { cart_id: cartId };
      
      // Read each field from shared input_text
      for (const [apiField, haField] of Object.entries(fieldMapping)) {
        const entity = this._hass.states[`input_text.${haField}`];
        if (entity) {
          const currentValue = entity.state || '';
          
          // Handle empty input_text
          if (!currentValue.trim()) {
            configData[apiField] = '';
            console.log(`📖 ${haField} is empty, using empty value for cart ${cartId}`);
            continue;
          }
          
          const valueArray = currentValue.split(',');
          
          // Get value at cart index, handle missing index
          if (cartIndex < valueArray.length) {
            configData[apiField] = (valueArray[cartIndex] || '').trim();
          } else {
            configData[apiField] = '';
            console.log(`📖 ${haField}[${cartIndex}] not found (array length: ${valueArray.length}), using empty value`);
          }
        } else {
          configData[apiField] = '';
          console.warn(`⚠️ Entity input_text.${haField} not found, using empty value`);
        }
      }
      
      console.log(`📖 Read cart ${cartId} ${type} config from shared input_text[${cartIndex}]:`, configData);
      return configData;
      
    } catch (error) {
      console.error(`Failed to read sensor data for cart ${cartId}:`, error);
      return null;
    }
  }

  // Show status message
  _showStatus(message, type = 'info') {
    const container = this.shadowRoot.querySelector('.status-container');
    if (!container) return;

    const statusEl = document.createElement('div');
    statusEl.className = `status ${type}`;
    statusEl.textContent = message;

    container.innerHTML = '';
    container.appendChild(statusEl);

    // Auto hide after 5 seconds
    setTimeout(() => {
      if (statusEl.parentNode) {
        statusEl.remove();
      }
    }, 5000);
  }

  // Utility function to escape HTML
  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  static getStubConfig() {
    return {
      title: "Admin Cart Configuration - Test"
    };
  }
}

// Register the custom element
customElements.define('admin-cart-config-card', AdminCartConfigCard);

// Export
window.AdminCartConfigCard = AdminCartConfigCard;
export default AdminCartConfigCard;