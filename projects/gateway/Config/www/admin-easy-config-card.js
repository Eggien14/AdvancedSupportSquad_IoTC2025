// Admin Easy Config Card - Quick Edit Input Text Values
// Chỉnh sửa nhanh các input text với giao diện đơn giản

class AdminEasyConfigCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._rendered = false;
  }

  setConfig(config) {
    this._config = Object.assign({
      title: "Admin Easy Config Card",
      show_header: true
    }, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
    }
  }

  getCardSize() {
    return 12;
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
      
      .config-section {
        margin-bottom: 24px;
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .section-header {
        background: var(--secondary-background-color, #252525);
        padding: 12px 16px;
        font-weight: 600;
        color: var(--primary-text-color, #eaeaea);
        font-size: 16px;
      }
      
      .section-content {
        padding: 16px;
      }
      
      .config-item {
        margin-bottom: 16px;
        padding: 12px;
        border: 1px solid var(--divider-color, #333);
        border-radius: 6px;
        background: var(--card-background-color, #1e1e1e);
      }
      
      .config-item:last-child {
        margin-bottom: 0;
      }
      
      .config-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #eaeaea);
        margin-bottom: 8px;
      }
      
      .config-description {
        font-size: 11px;
        color: var(--secondary-text-color, #9aa0a6);
        margin-bottom: 8px;
      }
      
      .config-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .config-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 6px;
        background: var(--secondary-background-color, #252525);
        color: var(--primary-text-color, #eaeaea);
        font-size: 14px;
        font-family: 'Courier New', monospace;
        resize: vertical;
        min-height: 40px;
      }
      
      .config-input:focus {
        outline: none;
        border-color: var(--primary-color, #1976d2);
      }
      
      .config-input.multiline {
        min-height: 80px;
      }
      
      button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      
      .btn-config {
        background: var(--primary-color, #2196F3);
        color: white;
      }
      
      .btn-config:hover:not(:disabled) {
        background: var(--primary-color-dark, #1976D2);
        transform: translateY(-1px);
      }
      
      .btn-apply {
        background: var(--success-color, #4CAF50);
        color: white;
      }
      
      .btn-apply:hover:not(:disabled) {
        background: var(--success-color-dark, #45a049);
        transform: translateY(-1px);
      }
      
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      
      .status {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 12px;
        display: none;
      }
      
      .status.show {
        display: block;
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
      
      .current-value {
        font-size: 11px;
        color: var(--secondary-text-color, #9aa0a6);
        background: var(--secondary-background-color, #252525);
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 4px;
        word-break: break-all;
        font-family: 'Courier New', monospace;
      }
    `;

    const html = `
      <div class="header">
        <div class="title">⚙️ ${this._config.title}</div>
      </div>
      
      <div class="status" id="status-message"></div>
      
      <!-- API Configuration -->
      <div class="config-section">
        <div class="section-header">🔗 API Configuration</div>
        <div class="section-content">
          ${this._renderConfigItem('api_base_http', 'API Base HTTP URL', 'Base URL for HTTP API calls')}
          ${this._renderConfigItem('api_base_https', 'API Base HTTPS URL', 'Base URL for HTTPS API calls')}
        </div>
      </div>
      
      <!-- Admin Management -->
      <div class="config-section">
        <div class="section-header">🛠️ Admin Management</div>
        <div class="section-content">
          ${this._renderConfigItem('admin_cart_list', 'Admin Cart List', 'Comma-separated list of cart IDs (e.g., 142,105)')}
          ${this._renderConfigItem('admin_map_list', 'Admin Map List', 'Comma-separated list of map IDs (e.g., 510)')}
          ${this._renderConfigItem('map_entity_colour', 'Map Entity Colour', 'Entity colors mapping (e.g., 1-#FFFFFF,0-#000000)', true)}
          ${this._renderConfigItem('admin_cart_map_connect', 'Admin Cart Map Connect', 'Cart to map connections (e.g., 142-510,105-510)')}
        </div>
      </div>
      
      <!-- Cart New Config -->
      <div class="config-section">
        <div class="section-header">🆕 Cart New Config (Shared Fields)</div>
        <div class="section-content">
          ${this._renderConfigItem('cart_new_mac_address', 'Cart New MAC Address', 'Comma-separated MAC addresses in cart order', true)}
          ${this._renderConfigItem('cart_new_position_uuid', 'Cart New Position UUID', 'Comma-separated position UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_new_state_uuid', 'Cart New State UUID', 'Comma-separated state UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_new_voice_uuid', 'Cart New Voice UUID', 'Comma-separated voice UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_new_firmware_uuid', 'Cart New Firmware UUID', 'Comma-separated firmware UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_new_camera_url', 'Cart New Camera URL', 'Comma-separated camera URLs in cart order', true)}
        </div>
      </div>
      
      <!-- Cart Old Config -->
      <div class="config-section">
        <div class="section-header">📂 Cart Old Config (Shared Fields)</div>
        <div class="section-content">
          ${this._renderConfigItem('cart_old_mac_address', 'Cart Old MAC Address', 'Comma-separated MAC addresses in cart order', true)}
          ${this._renderConfigItem('cart_old_position_uuid', 'Cart Old Position UUID', 'Comma-separated position UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_old_state_uuid', 'Cart Old State UUID', 'Comma-separated state UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_old_voice_uuid', 'Cart Old Voice UUID', 'Comma-separated voice UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_old_firmware_uuid', 'Cart Old Firmware UUID', 'Comma-separated firmware UUIDs in cart order', true)}
          ${this._renderConfigItem('cart_old_camera_url', 'Cart Old Camera URL', 'Comma-separated camera URLs in cart order', true)}
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = `<style>${style}</style>${html}`;
    this._rendered = true;
  }

  _renderConfigItem(entityId, label, description, isMultiline = false) {
    return `
      <div class="config-item">
        <label class="config-label">${label}</label>
        <div class="config-description">${description}</div>
        <div class="config-controls">
          <button class="btn-config" onclick="this.getRootNode().host._loadConfig('${entityId}')">
            📥 Config
          </button>
          <button class="btn-apply" onclick="this.getRootNode().host._applyConfig('${entityId}')">
            ✅ Apply
          </button>
        </div>
        <textarea 
          class="config-input ${isMultiline ? 'multiline' : ''}" 
          id="${entityId}-input" 
          placeholder="Click 'Config' to load current value or enter new value..."
        ></textarea>
        <div class="current-value" id="${entityId}-current">Current: Loading...</div>
      </div>
    `;
  }

  // Load current value from input_text to textarea
  async _loadConfig(entityId) {
    try {
      if (!this._hass) return;

      const entity = this._hass.states[`input_text.${entityId}`];
      if (!entity) {
        this._showStatus(`❌ Entity input_text.${entityId} not found`, 'error');
        return;
      }

      const currentValue = entity.state || '';
      const textarea = this.shadowRoot.querySelector(`#${entityId}-input`);
      const currentDiv = this.shadowRoot.querySelector(`#${entityId}-current`);

      if (textarea) {
        textarea.value = currentValue;
        this._showStatus(`📥 Loaded current value for ${entityId}`, 'success');
      }

      if (currentDiv) {
        currentDiv.textContent = `Current: ${currentValue || '(empty)'}`;
      }

    } catch (error) {
      console.error(`Failed to load config for ${entityId}:`, error);
      this._showStatus(`❌ Failed to load ${entityId}: ${error.message}`, 'error');
    }
  }

  // Apply textarea value to input_text
  async _applyConfig(entityId) {
    try {
      if (!this._hass) return;

      const textarea = this.shadowRoot.querySelector(`#${entityId}-input`);
      if (!textarea) return;

      const newValue = textarea.value || '';
      
      // Apply to Home Assistant
      await this._hass.callService('input_text', 'set_value', {
        entity_id: `input_text.${entityId}`,
        value: newValue
      });

      // Update current value display
      const currentDiv = this.shadowRoot.querySelector(`#${entityId}-current`);
      if (currentDiv) {
        currentDiv.textContent = `Current: ${newValue || '(empty)'}`;
      }

      this._showStatus(`✅ Applied new value for ${entityId}`, 'success');

    } catch (error) {
      console.error(`Failed to apply config for ${entityId}:`, error);
      this._showStatus(`❌ Failed to apply ${entityId}: ${error.message}`, 'error');
    }
  }

  // Show status message
  _showStatus(message, type = 'info') {
    const statusEl = this.shadowRoot.querySelector('#status-message');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `status ${type} show`;

    // Auto hide after 3 seconds
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 3000);
  }

  static getStubConfig() {
    return {
      title: "Admin Easy Config Card - Test"
    };
  }
}

// Register the custom element
customElements.define('admin-easy-config-card', AdminEasyConfigCard);

// Export
window.AdminEasyConfigCard = AdminEasyConfigCard;
export default AdminEasyConfigCard;
