class AdminUpdateFirmwareCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._hass = null;
      this._cartList = [];
      this._selectedCart = null;
      this._differences = {};
    }
  
    setConfig(config) {
      this._config = Object.assign({
        title: "Firmware Update Manager",
        show_header: true
      }, config || {});
    }
  
    set hass(hass) {
      this._hass = hass;
      if (!this._rendered) this._render();
      this._loadCartList();
    }
  
    getCardSize() {
      return 8;
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
        
        .btn-primary {
          background: var(--primary-color, #1976d2);
          color: white;
        }
        
        .btn-success {
          background: var(--success-color, #4caf50);
          color: white;
        }
        
        .btn-warning {
          background: var(--warning-color, #ff9800);
          color: white;
        }
        
        .btn-secondary {
          background: var(--secondary-color, #666);
          color: white;
        }
        
        button:hover:not(:disabled) {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .cart-selector {
          margin-bottom: 20px;
        }
        
        .cart-selector label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--primary-text-color, #eaeaea);
        }
        
        .cart-selector select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--divider-color, #2a2a2a);
          border-radius: 8px;
          background: var(--secondary-background-color, #252525);
          color: var(--primary-text-color, #eaeaea);
          font-size: 14px;
        }
        
        .comparison-container {
          display: none;
          border: 1px solid var(--divider-color, #2a2a2a);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .comparison-container.visible {
          display: block;
        }
        
        .comparison-header {
          background: var(--secondary-background-color, #252525);
          padding: 12px 16px;
          border-bottom: 1px solid var(--divider-color, #2a2a2a);
        }
        
        .comparison-title {
          font-weight: 600;
          color: var(--primary-text-color, #eaeaea);
        }
        
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .comparison-table th,
        .comparison-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--divider-color, #2a2a2a);
        }
        
        .comparison-table th {
          background: var(--secondary-background-color, #252525);
          font-weight: 600;
          color: var(--primary-text-color, #eaeaea);
          position: sticky;
          top: 0;
        }
        
        .comparison-table td {
          color: var(--primary-text-color, #eaeaea);
          font-family: monospace;
          font-size: 13px;
        }
        
        .field-name {
          font-weight: 500;
          color: var(--secondary-text-color, #9aa0a6);
        }
        
        .value-old {
          background: rgba(244, 67, 54, 0.1);
          border-left: 3px solid var(--error-color, #f44336);
          padding-left: 12px;
        }
        
        .value-new {
          background: rgba(76, 175, 80, 0.1);
          border-left: 3px solid var(--success-color, #4caf50);
          padding-left: 12px;
        }
        
        .value-same {
          background: var(--card-background-color, #1e1e1e);
          color: var(--secondary-text-color, #9aa0a6);
        }
        
        .difference-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .difference-indicator.changed {
          background: var(--warning-color, #ff9800);
        }
        
        .difference-indicator.same {
          background: var(--success-color, #4caf50);
        }
        
        .no-differences {
          padding: 40px;
          text-align: center;
          color: var(--secondary-text-color, #9aa0a6);
        }
        
        .update-section {
          margin-top: 20px;
          padding: 16px;
          background: var(--secondary-background-color, #252525);
          border-radius: 8px;
          display: none;
        }
        
        .update-section.visible {
          display: block;
        }
        
        .update-warning {
          padding: 12px;
          margin-bottom: 16px;
          background: rgba(255, 152, 0, 0.1);
          border: 1px solid var(--warning-color, #ff9800);
          border-radius: 6px;
          color: var(--warning-color, #ff9800);
          font-size: 14px;
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
        
        .status.info {
          background: rgba(25, 118, 210, 0.1);
          color: var(--primary-color, #1976d2);
          border: 1px solid var(--primary-color, #1976d2);
        }
        
        .summary {
          margin-bottom: 16px;
          padding: 12px;
          background: var(--card-background-color, #1e1e1e);
          border-radius: 6px;
          border: 1px solid var(--divider-color, #2a2a2a);
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .summary-label {
          color: var(--secondary-text-color, #9aa0a6);
        }
        
        .summary-value {
          color: var(--primary-text-color, #eaeaea);
          font-weight: 500;
        }
      `;
  
      this.shadowRoot.innerHTML = `
        <style>${style}</style>
        <div class="container">
          <div class="header">
            <div class="title">${this._config.title}</div>
            <div class="header-buttons">
              <button class="btn-secondary" onclick="this.getRootNode().host._navigateBack()">
                ← Back to Config
              </button>
              <button class="btn-primary" onclick="this.getRootNode().host._refreshComparison()">
                🔄 Refresh
              </button>
            </div>
          </div>
          
          <div class="status-container"></div>
          
          <div class="cart-selector">
            <label for="cart-select">Select Cart to Compare:</label>
            <select id="cart-select" onchange="this.getRootNode().host._selectCart(this.value)">
              <option value="">Choose a cart...</option>
            </select>
          </div>
          
          <div class="comparison-container">
            <div class="comparison-header">
              <div class="comparison-title">Configuration Comparison</div>
            </div>
            <div class="comparison-content">
              <div class="no-differences">
                Select a cart to view configuration differences
              </div>
            </div>
          </div>
          
          <div class="update-section">
            <div class="summary">
              <div class="summary-item">
                <span class="summary-label">Cart ID:</span>
                <span class="summary-value" id="summary-cart-id">-</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Changed Fields:</span>
                <span class="summary-value" id="summary-changes">-</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Status:</span>
                <span class="summary-value" id="summary-status">Ready</span>
              </div>
            </div>
            
            <div class="update-warning">
              ⚠️ Warning: This will update the "Old Config" to match the "New Config". 
              This action represents a firmware update synchronization and cannot be undone.
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="btn-warning" id="update-btn" onclick="this.getRootNode().host._updateFirmware()" disabled>
                🚀 Update Firmware
              </button>
              <button class="btn-secondary" onclick="this.getRootNode().host._cancelUpdate()">
                ❌ Cancel
              </button>
            </div>
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
        this._renderCartSelector();
      }
    }
  
    _renderCartSelector() {
      const select = this.shadowRoot.querySelector('#cart-select');
      if (!select) return;
  
      const options = this._cartList.map(cartId => 
        `<option value="${cartId}">Cart ${cartId}</option>`
      ).join('');
  
      select.innerHTML = `
        <option value="">Choose a cart...</option>
        ${options}
      `;
    }
  
    _selectCart(cartId) {
      if (!cartId) {
        this._selectedCart = null;
        this._hideComparison();
        return;
      }
  
      this._selectedCart = parseInt(cartId);
      this._loadConfigs();
    }
  
    _loadConfigs() {
      if (!this._selectedCart) return;
  
      const oldConfig = this._getCartConfig(this._selectedCart, 'old');
      const newConfig = this._getCartConfig(this._selectedCart, 'new');
  
      this._compareConfigs(oldConfig, newConfig);
    }
  
    _getCartConfig(cartId, type) {
      try {
        const entityId = `input_text.cart_${type}_config_${cartId}`;
        const entity = this._hass.states[entityId];
        if (entity && entity.state) {
          return JSON.parse(entity.state);
        }
      } catch (e) {
        console.warn(`Failed to parse ${type} config for cart ${cartId}:`, e);
      }
      return {};
    }
  
    _compareConfigs(oldConfig, newConfig) {
      const fields = [
        'cart_mac_address',
        'cart_position', 
        'cart_state',
        'cart_voice_cmd',
        'cart_firmware_update',
        'cam_stream_url'
      ];
  
      this._differences = {};
      let changedCount = 0;
  
      fields.forEach(field => {
        const oldValue = oldConfig[field] || '';
        const newValue = newConfig[field] || '';
        const isChanged = oldValue !== newValue;
        
        this._differences[field] = {
          old: oldValue,
          new: newValue,
          changed: isChanged
        };
  
        if (isChanged) changedCount++;
      });
  
      this._renderComparison(changedCount);
    }
  
    _renderComparison(changedCount) {
      const container = this.shadowRoot.querySelector('.comparison-container');
      const content = container.querySelector('.comparison-content');
      
      if (Object.keys(this._differences).length === 0) {
        content.innerHTML = '<div class="no-differences">No configuration data available</div>';
        this._hideUpdateSection();
        return;
      }
  
      if (changedCount === 0) {
        content.innerHTML = `
          <div class="no-differences">
            ✅ No differences found. Old and New configurations are identical.
          </div>
        `;
        this._hideUpdateSection();
      } else {
        const tableRows = Object.entries(this._differences).map(([field, diff]) => {
          const indicator = diff.changed ? 'changed' : 'same';
          const oldClass = diff.changed ? 'value-old' : 'value-same';
          const newClass = diff.changed ? 'value-new' : 'value-same';
          
          return `
            <tr>
              <td class="field-name">
                <span class="difference-indicator ${indicator}"></span>
                ${this._formatFieldName(field)}
              </td>
              <td class="${oldClass}">${diff.old || '<empty>'}</td>
              <td class="${newClass}">${diff.new || '<empty>'}</td>
            </tr>
          `;
        }).join('');
  
        content.innerHTML = `
          <table class="comparison-table">
            <thead>
              <tr>
                <th style="width: 25%;">Field</th>
                <th style="width: 37.5%;">Old Config</th>
                <th style="width: 37.5%;">New Config</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;
  
        this._showUpdateSection(changedCount);
      }
  
      container.classList.add('visible');
    }
  
    _formatFieldName(field) {
      return field.replace(/_/g, ' ')
                 .replace(/\b\w/g, l => l.toUpperCase());
    }
  
    _showUpdateSection(changedCount) {
      const section = this.shadowRoot.querySelector('.update-section');
      const updateBtn = this.shadowRoot.querySelector('#update-btn');
      
      this.shadowRoot.querySelector('#summary-cart-id').textContent = this._selectedCart;
      this.shadowRoot.querySelector('#summary-changes').textContent = `${changedCount} field(s)`;
      this.shadowRoot.querySelector('#summary-status').textContent = 'Ready to update';
      
      updateBtn.disabled = false;
      section.classList.add('visible');
    }
  
    _hideUpdateSection() {
      const section = this.shadowRoot.querySelector('.update-section');
      section.classList.remove('visible');
    }
  
    _hideComparison() {
      const container = this.shadowRoot.querySelector('.comparison-container');
      container.classList.remove('visible');
      this._hideUpdateSection();
    }
  
    async _updateFirmware() {
      if (!this._selectedCart) return;
  
      this._showStatus('Updating firmware configuration...', 'info');
      
      try {
        // Get new config
        const newConfig = this._getCartConfig(this._selectedCart, 'new');
        
        // Update old config to match new config
        await this._hass.callService('input_text', 'set_value', {
          entity_id: `input_text.cart_old_config_${this._selectedCart}`,
          value: JSON.stringify(newConfig)
        });
        
        this._showStatus(`Firmware updated successfully for Cart ${this._selectedCart}!`, 'success');
        
        // Update summary
        this.shadowRoot.querySelector('#summary-status').textContent = 'Updated';
        this.shadowRoot.querySelector('#update-btn').disabled = true;
        
        // Refresh comparison
        setTimeout(() => {
          this._loadConfigs();
        }, 1000);
        
      } catch (error) {
        console.error('Failed to update firmware:', error);
        this._showStatus(`Failed to update firmware: ${error.message}`, 'error');
      }
    }
  
    _cancelUpdate() {
      this._hideUpdateSection();
    }
  
    _refreshComparison() {
      if (!this._selectedCart) {
        this._showStatus('Please select a cart first', 'error');
        return;
      }
      
      this._showStatus('Refreshing comparison...', 'info');
      this._loadConfigs();
      this._showStatus('Comparison refreshed!', 'success');
    }
  
    _navigateBack() {
      // Navigate back to cart config page
      window.location.hash = '#admin-cart-config';
      
      // Or dispatch a custom event
      this.dispatchEvent(new CustomEvent('navigate-to-config', {
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
        title: "Firmware Update Manager"
      };
    }
  }
  
  customElements.define('admin-update-firmware-card', AdminUpdateFirmwareCard);
  