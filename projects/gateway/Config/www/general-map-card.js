// General Map Card
// Hiển thị bản đồ với hình ảnh overlay và khu vực click để hiển thị sản phẩm

import ApiConfig from '/local/api-config.js';
import GeneralProductDetailPopup from '/local/general-product-detail-popup.js';
import GeneralHelpPopup from '/local/general-help-popup.js';

class GeneralMapCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._mapData = [];
    this._mapId = null;
    this._rendered = false;
    this._popup = window.globalProductPopup || new GeneralProductDetailPopup();
    this._productListPopup = null;
    // store cell elements for quick lookup
    this._cellElements = {}; // key: 'x,y' -> DOM element
    // voice command tracking
    this._lastVoiceCommand = null;
    // cart position tracking
    this._lastCartPosition = null;
    this._cartIcon = null; // DOM element for cart icon
    this._currentUserCell = null; // Current cell with user position highlight
    
    // Pin management
    this.pinnedProducts = new Map(); // Map để lưu các sản phẩm đã pin: productId -> {area, icon, name}
    this.availableIcons = [
      { emoji: '📍', label: 'Pin' },
      { emoji: '🚩', label: 'Flag' },
      { emoji: '🏳️', label: 'Flag White' },
      { emoji: '🏴', label: 'Flag Black' },
      { emoji: '⭐', label: 'Star' },
      { emoji: '💎', label: 'Diamond' },
      { emoji: '🔥', label: 'Fire' },
      { emoji: '⚡', label: 'Lightning' },
      { emoji: '🎯', label: 'Target' },
      { emoji: '🏆', label: 'Trophy' },
      { emoji: '💡', label: 'Bulb' },
      { emoji: '🎪', label: 'Circus' },
      { emoji: '🎨', label: 'Palette' },
      { emoji: '🔔', label: 'Bell' },
      { emoji: '📌', label: 'Pushpin' },
      { emoji: '🎭', label: 'Masks' },
      { emoji: '🎲', label: 'Dice' },
      { emoji: '🎮', label: 'Game' },
      { emoji: '🔑', label: 'Key' },
      { emoji: '💫', label: 'Sparkle' },
      { emoji: '🌟', label: 'Glowing' },
      { emoji: '⚽', label: 'Ball' }
    ];
    this._iconPickerPopup = null;
    this._pendingPinData = null; // Lưu thông tin pin tạm thời khi chọn icon
    
    // Listen for product location events
    this._boundLocationHandler = this._handleProductLocationRequest.bind(this);
    document.addEventListener('product-location-request', this._boundLocationHandler);
    
    // Set global reference để popup có thể truy cập
    window.currentMapCard = this;
  }

  setConfig(config) {
    this._config = Object.assign({
      cart_id: null,
      title: "Map View"
    }, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
    this._updateFromHass();
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
        // padding: 16px;
        // margin: 8px;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color, #2a2a2a);
      }
      
      .title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color, #eaeaea);
      }
      
      .refresh-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        background: var(--primary-color, #2196F3);
        color: white;
        transition: all 0.2s ease;
      }
      
      .refresh-btn:hover:not(:disabled) {
        background: var(--primary-color-dark, #1976D2);
        transform: translateY(-1px);
      }
      
      .refresh-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .map-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--secondary-background-color, #2a2a2a);
        border-radius: 8px;
        padding: 4px;
        min-height: 400px;
      }
      
      .map-grid-wrapper {
        position: relative;
        width: 100%;  
        aspect-ratio: 1 / 1;   
        margin: auto;
      }
      
      .map-grid {
        position: absolute;     /* chồng lên ảnh */
        top: 0;
        left: 0;
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        grid-template-rows: repeat(10, 1fr);
        width: 100%;
        height: 100%;
        gap: 1px;
        border: 2px solid var(--divider-color, #444);
        background: var(--divider-color, #444);
        z-index: 2;
      }

      .map-cell {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        cursor: pointer;
        position: relative;
        z-index: 3;
        transition: background-color 0.2s ease;
      }
      
      .map-cell:hover {
        background-color: rgba(33, 150, 243, 0.3) !important;
      }
      
      .map-cell.user-position {
        background-color: rgba(76, 175, 80, 0.25) !important; /* Light green for user position */
      }
      
      .map-cell.user-position:hover {
        background-color: rgba(54, 162, 161, 0.35) !important; /* Mixed green-blue on hover */
      }
      
      .map-cell[data-area="NULL"] {
        cursor: default;
      }
      
      .map-cell[data-area="NULL"]:hover {
        background-color: transparent !important;
      }
      
      .map-cell[data-area="NULL"].user-position {
        background-color: rgba(76, 175, 80, 0.25) !important; /* Keep user position even for NULL area */
      }
      
      .map-cell[data-area="NULL"].user-position:hover {
        background-color: rgba(54, 162, 161, 0.35) !important; /* Mixed color for NULL area user position */
      }
      
      .map-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
        border-radius: 4px;
      }
      
      .loading-message {
        text-align: center;
        color: var(--secondary-text-color, #9aa0a6);
        font-size: 14px;
      }
      
      .error-message {
        text-align: center;
        color: var(--error-color, #f44336);
        font-size: 14px;
      }
      
      .map-info {
        margin-top: 12px;
        text-align: center;
        font-size: 12px;
        color: var(--secondary-text-color, #9aa0a6);
      }
      
      /* Product List Popup Styles */
      .product-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      }
      
      .product-popup-container {
        background: var(--card-background-color, #1e1e1e);
        border-radius: 12px;
        padding: 20px;
        max-width: 800px;
        max-height: 80vh;
        width: 90%;
        overflow-y: auto;
        position: relative;
      }
      
      .product-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color, #2a2a2a);
      }
      
      .product-popup-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color, #eaeaea);
      }
      
      .product-popup-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--secondary-text-color, #9aa0a6);
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .product-popup-close:hover {
        color: var(--primary-text-color, #eaeaea);
      }
      
      .products-grid {
        display: grid;
        gap: 16px;
      }
      
      /* Grid layout cho nhiều sản phẩm (≥3) */
      .products-grid.multi-products {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
      
      /* Grid layout cho ít sản phẩm (1-2) */
      .products-grid.few-products {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        max-width: 800px;
        margin: 0 auto;
      }
      
      .product-item {
        display: flex;
        flex-direction: column;
        background: var(--secondary-background-color, #2a2a2a);
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: 1px solid var(--divider-color, #444);
      }
      
      .product-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .product-image {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 12px;
        background: var(--divider-color, #444);
      }
      
      /* Styling đặc biệt cho ít sản phẩm */
      .products-grid.few-products .product-item {
        padding: 20px;
      }
      
      .products-grid.few-products .product-image {
        margin-bottom: 16px;
      }
      
      .products-grid.few-products .product-name {
        font-size: 16px;
        margin-bottom: 8px;
      }
      
      .products-grid.few-products .product-price {
        font-size: 15px;
        margin-bottom: 6px;
      }
      
      .product-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--primary-text-color, #eaeaea);
        margin-bottom: 4px;
        line-height: 1.3;
      }
      
      .product-price {
        color: var(--primary-color, #2196F3);
        font-weight: 500;
        font-size: 13px;
        margin-bottom: 2px;
      }
      
      .product-quantity {
        color: var(--secondary-text-color, #9aa0a6);
        font-size: 12px;
        margin-bottom: 4px;
      }
      
      .product-type {
        background: var(--primary-color, #2196F3);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 500;
        align-self: flex-start;
      }
      
      .no-products {
        text-align: center;
        color: var(--secondary-text-color, #9aa0a6);
        font-size: 14px;
        padding: 40px;
      }
      
      /* Pin Styles */
      .map-pin {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 20px;
        z-index: 100;
        cursor: pointer;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));
        pointer-events: none;
      }
      
      /* Cart Position Icon Styles */
      .cart-position-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        z-index: 200;  /* Highest z-index to be on top of everything */
        pointer-events: none;
        filter: drop-shadow(3px 3px 6px rgba(0,0,0,0.9));
        transition: all 0.3s ease;
      }
      
      .cart-position-icon.moving {
        animation: cartPulse 0.5s ease-in-out;
      }
      
      @keyframes cartPulse {
        0% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      
      .pin-remove-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #ff4444;
        color: white;
        border: none;
        font-size: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        z-index: 101;
        pointer-events: auto;
        font-weight: bold;
      }
      
      .pin-remove-btn:hover {
        background: #cc0000;
        transform: scale(1.1);
      }
      
      /* Icon Picker Modal Styles */
      .icon-picker-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
      }
      
      .icon-picker-container {
        background: var(--card-background-color, #1e1e1e);
        border: 1px solid var(--divider-color, #444);
        border-radius: 12px;
        padding: 20px;
        max-width: 450px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .icon-picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color, #444);
      }
      
      .icon-picker-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color, #eaeaea);
      }
      
      .icon-picker-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--secondary-text-color, #9aa0a6);
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
      }
      
      .icon-picker-close:hover {
        background: var(--divider-color, #444);
        color: var(--primary-text-color, #eaeaea);
      }
      
      .icon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .icon-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px;
        border: 2px solid var(--divider-color, #444);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--secondary-background-color, #2a2a2a);
        min-height: 80px;
      }
      
      .icon-option:hover {
        border-color: var(--primary-color, #2196F3);
        background: var(--primary-color-alpha, rgba(33, 150, 243, 0.1));
        transform: translateY(-2px);
      }
      
      .icon-option.selected {
        border-color: var(--primary-color, #2196F3);
        background: var(--primary-color-alpha, rgba(33, 150, 243, 0.2));
      }
      
      .icon-emoji {
        font-size: 24px;
        margin-bottom: 4px;
      }
      
      .icon-label {
        font-size: 11px;
        color: var(--secondary-text-color, #9aa0a6);
        text-align: center;
        line-height: 1.2;
      }
      
      .icon-picker-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      
      .icon-picker-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .icon-picker-btn.cancel {
        background: var(--secondary-background-color, #2a2a2a);
        color: var(--secondary-text-color, #9aa0a6);
      }
      
      .icon-picker-btn.cancel:hover {
        background: var(--divider-color, #444);
      }
      
      .icon-picker-btn.confirm {
        background: var(--primary-color, #2196F3);
        color: white;
      }
      
      .icon-picker-btn.confirm:hover:not(:disabled) {
        background: var(--primary-color-dark, #1976D2);
        transform: translateY(-1px);
      }
      
      .icon-picker-btn.confirm:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      @media (max-width: 768px) {
        .products-grid.multi-products {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .products-grid.few-products {
          grid-template-columns: 1fr;
          max-width: none;
        }
        
        .product-popup-container {
          width: 95%;
          padding: 16px;
        }
        
        .map-grid {
          grid-template-columns: repeat(10, 30px);
          grid-template-rows: repeat(10, 30px);
        }
        
        .map-cell {
          width: 30px;
          height: 30px;
        }
      }
    `;

    const html = `
      <style>${style}</style>
      <div class="container">
        <div class="header">
          <div class="title">${this._config.title} ${this._config.cart_id ? `(Cart ${this._config.cart_id})` : ''}</div>
          <button class="refresh-btn" id="refreshBtn">🔄 Refresh Map</button>
        </div>
        
        <div class="map-container" id="mapContainer">
          <div class="loading-message">Click "Refresh Map" to load map data</div>
        </div>
        
        <div class="map-info" id="mapInfo"></div>
      </div>
    `;

    this.shadowRoot.innerHTML = html;
    this._rendered = true;
    this._attachEventListeners();
  }

  _attachEventListeners() {
    const refreshBtn = this.shadowRoot.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', () => this._refreshMap());
  }

  async _refreshMap() {
    if (!this._hass || !this._config.cart_id) {
      this._showError('Cart ID not configured');
      return;
    }

    try {
      this._showLoading('Loading map data...');
      
      // Get map ID for this cart
      const mapId = await this._getMapIdForCart(this._config.cart_id);
      if (!mapId) {
        this._showError(`No map configured for cart ${this._config.cart_id}`);
        return;
      }

      this._mapId = mapId;
      
      // Fetch map data
      await this._fetchMapData(mapId);
      
      // Render map
      this._renderMap();
      
    } catch (error) {
      console.error('Refresh map error:', error);
      this._showError(`Failed to load map: ${error.message}`);
    }
  }

  async _getMapIdForCart(cartId) {
    const connectEntity = this._hass.states['input_text.admin_cart_map_connect'];
    if (!connectEntity || !connectEntity.state) {
      throw new Error('Cart-Map connection not configured');
    }

    const connections = connectEntity.state.split(',');
    for (const connection of connections) {
      const [cart, map] = connection.split('-').map(s => s.trim());
      if (cart === String(cartId)) {
        return map;
      }
    }

    return null;
  }

  async _fetchMapData(mapId) {
    const apiBaseUrl = this._hass.states['input_text.api_base_http']?.state || 'http://localhost:8136';
    const response = await fetch(`${apiBaseUrl}/map/${mapId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    this._mapData = data.cells || [];
  }

  _renderMap() {
    const container = this.shadowRoot.getElementById('mapContainer');
    const mapInfo = this.shadowRoot.getElementById('mapInfo');
    
    container.innerHTML = `
      <div class="map-grid-wrapper">
        <div class="map-grid" id="mapGrid"></div>
        <img class="map-image" id="mapImage" src="/local/map_pic/${this._mapId}.jpg" 
             onerror="this.style.display='none'" alt="Map ${this._mapId}">
      </div>
    `;

    const grid = container.querySelector('#mapGrid');

    // Reset cell cache
    this._cellElements = {};
    // Create 10x10 grid (y from 9 to 0, x from 0 to 9)
    for (let y = 9; y >= 0; y--) {
      for (let x = 0; x <= 9; x++) {
        const cell = this._mapData.find(c => c.x_coordinate === x && c.y_coordinate === y);
        const area = cell ? cell.area : 'NULL';
    
        const cellElement = document.createElement('button');
        cellElement.className = 'map-cell';
        cellElement.dataset.x = x;
        cellElement.dataset.y = y;
        cellElement.dataset.area = area;
        cellElement.title = `(${x}, ${y}) - ${area}`;
    
        if (area !== 'NULL') {
          cellElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this._onCellClick(area);
          });
        }
    
        grid.appendChild(cellElement);
        // cache element by coordinates
        this._cellElements[`${x},${y}`] = cellElement;
      }
    }
    
    mapInfo.textContent = `Map ${this._mapId} loaded successfully. Click on colored areas to view products.`;
    
    // Render pin hiện có nếu có
    this._renderPins();
    this._renderPinLegend();
    
    // Apply voice command highlight if needed
    this._updateFromHass();    
  }

  async _onCellClick(area) {
    console.log('Cell clicked, area:', area);
    try {
      await this._showProductsForArea(area);
    } catch (error) {
      console.error('Error loading products for area:', error);
      alert(`Failed to load products for area ${area}: ${error.message}`);
    }
  }

  async _showProductsForArea(area) {
    try {
      const apiBaseUrl = this._hass.states['input_text.api_base_http']?.state || 'http://localhost:8136';
      const response = await fetch(`${apiBaseUrl}/products/by-area/${encodeURIComponent(area)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const products = await response.json();
      console.log('Products received for area', area, ':', products);
      this._displayProductPopup(area, products);
      
    } catch (error) {
      console.error('Error loading products for area:', error);
      throw error;
    }
  }

  _displayProductPopup(area, products) {
    console.log('_displayProductPopup called with area:', area, 'products:', products.length);
    
    // Remove existing popup if any
    this._hideProductPopup();

    const popupHtml = `
      <div class="product-popup-overlay" id="productPopup">
        <div class="product-popup-container">
          <div class="product-popup-header">
            <div class="product-popup-title">Product in Area: ${this._escape(area)}</div>
            <button class="product-popup-close">&times;</button>
          </div>
          <div class="products-content">
            ${products.length > 0 ? this._renderProductsGrid(products) : '<div class="no-products">No products in this area</div>'}
          </div>
        </div>
      </div>
    `;

    const popupContainer = document.createElement('div');
    popupContainer.innerHTML = popupHtml;
    this._productListPopup = popupContainer.firstElementChild;
    
    // Attach to shadowRoot instead of document.body
    this.shadowRoot.appendChild(this._productListPopup);
    console.log('Popup attached to shadowRoot');

    // Add event listeners
    const closeBtn = this._productListPopup.querySelector('.product-popup-close');
    closeBtn.addEventListener('click', () => this._hideProductPopup());

    // Close on overlay click
    this._productListPopup.addEventListener('click', (e) => {
      if (e.target === this._productListPopup) {
        this._hideProductPopup();
      }
    });

    // Add product click handlers
    const productItems = this._productListPopup.querySelectorAll('.product-item');
    productItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = item.dataset.productId;
        if (productId) {
          this._popup.show(productId, ApiConfig);
        }
      });
    });

    // ESC key to close
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this._hideProductPopup();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }

  _renderProductsGrid(products) {
    // Xác định class CSS dựa trên số lượng sản phẩm
    const gridClass = products.length >= 3 ? 'multi-products' : 'few-products';
    
    const productsHtml = products.map(product => {
      // Sử dụng đúng field name từ ProductListItem schema
      const img = `/local/product_pic/${product.product_id}.jpg`;
      const name = this._escape(product.name || 'Sản phẩm');
      const price = this._formatPrice(product.price || 0);
      const quantity = product.quantity != null ? product.quantity : 'N/A';
      const type = this._escape(product.type || 'N/A');
      const area = this._escape(product.area || 'N/A');
      const weightInfo = product.weight_kg && product.weight_kg > 0 ? ` (${product.weight_kg}kg)` : '';

      return `
        <div class="product-item" data-product-id="${product.product_id}">
          <img class="product-image" src="${img}" alt="${name}" 
               onerror="this.src='/local/product_pic/empty-cart.jpg'">
          <div class="product-name">${name}</div>
          <div class="product-price">${price}${weightInfo}</div>
          <div class="product-quantity">Remaining: ${quantity}</div>
          <div class="product-type">[${type}]</div>
        </div>
      `;
    }).join('');

    return `<div class="products-grid ${gridClass}">${productsHtml}</div>`;
  }

  _hideProductPopup() {
    if (this._productListPopup) {
      this._productListPopup.remove();
      this._productListPopup = null;
    }
  }

  _showLoading(message) {
    const container = this.shadowRoot.getElementById('mapContainer');
    container.innerHTML = `<div class="loading-message">${message}</div>`;
  }

  _showError(message) {
    const container = this.shadowRoot.getElementById('mapContainer');
    container.innerHTML = `<div class="error-message">${message}</div>`;
  }

  _formatPrice(price) {
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    } catch (e) {
      return `${price} ₫`;
    }
  }

  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Called on each hass update
  _updateFromHass() {
    if (!this._hass || !this._config || !this._config.cart_id) return;
    
    // Handle voice commands
    const voiceEntityId = `sensor.cart_voice_command_${this._config.cart_id}`;
    const voiceEntity = this._hass.states[voiceEntityId];
    const voiceValue = voiceEntity ? String(voiceEntity.state) : null;
    if (voiceValue !== this._lastVoiceCommand) {
      this._lastVoiceCommand = voiceValue;
      this._handleVoiceCommandChange(voiceValue);
    }
    
    // Handle cart position
    const positionEntityId = `sensor.cart_position_${this._config.cart_id}`;
    const positionEntity = this._hass.states[positionEntityId];
    const positionValue = positionEntity ? String(positionEntity.state) : null;
    if (positionValue !== this._lastCartPosition) {
      this._lastCartPosition = positionValue;
      this._handleCartPositionChange(positionValue);
    }
  }

  // Handle voice command change (e.g., 'checkout', 'help', 'unknown')
  _handleVoiceCommandChange(command) {
    if (!command) {
      this._clearAllAreaHighlights();
      return;
    }
    const cmd = String(command).trim().toLowerCase();
    if (cmd === 'checkout') {
      this._highlightAreaByName('checkout');
    } else if (cmd === 'locker') {
      this._highlightAreaByName('locker');
    } else if (cmd === 'baby') {
      this._highlightAreaByName('baby');
    } else if (cmd === 'food') {
      this._highlightAreaByName('food');
    } else if (cmd === 'exit') {
      this._highlightAreaByName('exit');
    } else if (cmd === 'restroom') {
      this._highlightAreaByName('restroom');
    } else if (cmd === 'help') {
      console.log('Voice command: help - showing help popup');
      GeneralHelpPopup.showHelp();
    } else {
      // for other commands we currently clear highlight; can extend for other commands later
      this._clearAllAreaHighlights();
    }
  }

  // Handle cart position change
  _handleCartPositionChange(positionValue) {
    console.log('Cart position changed:', positionValue);
    
    if (!positionValue || positionValue === 'unknown' || positionValue === 'unavailable') {
      this._hideCartIcon();
      return;
    }
    
    // Parse coordinates from "2.51,1.34,-1336.1" format
    const parts = positionValue.split(',');
    if (parts.length < 2) {
      console.warn('Invalid cart position format:', positionValue);
      this._hideCartIcon();
      return;
    }
    
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    
    if (isNaN(x) || isNaN(y)) {
      console.warn('Invalid cart coordinates:', x, y);
      this._hideCartIcon();
      return;
    }
    
    console.log('Parsed cart coordinates:', { x, y });
    this._showCartIcon(x, y);
  }

  // Clear highlight styles from all cells
  _clearAllAreaHighlights() {
    Object.values(this._cellElements || {}).forEach(cell => {
      if (cell) {
        cell.style.border = '';
        cell.style.borderTop = '';
        cell.style.borderRight = '';
        cell.style.borderBottom = '';
        cell.style.borderLeft = '';
        cell.style.boxSizing = '';
        cell.style.zIndex = '';
        cell.style.backgroundColor = '';
      }
    });
  }

  // Highlight all cells whose area equals areaName (case-insensitive).
  // Only outer borders are shown by removing borders between adjacent same-area cells.
  _highlightAreaByName(areaName) {
    if (!areaName) return;
    const target = String(areaName).trim().toLowerCase();

    // First clear any previous
    this._clearAllAreaHighlights();

    // Collect cells coordinates that belong to area
    const coords = [];
    Object.entries(this._cellElements || {}).forEach(([key, cell]) => {
      const area = (cell.dataset.area || '').toLowerCase();
      if (area === target) {
        const [xStr, yStr] = key.split(',');
        coords.push({ x: parseInt(xStr, 10), y: parseInt(yStr, 10), cell });
      }
    });

    if (coords.length === 0) return;

    // Helper to get cell by coordinates
    const getCell = (x, y) => this._cellElements[`${x},${y}`];

    // Apply border to each cell, then remove internal borders for adjacent same-area cells
    coords.forEach(({ x, y, cell }) => {
      // Ensure box sizing so border does not change layout
      cell.style.boxSizing = 'border-box';
      cell.style.zIndex = '4';
      const borderColor = 'rgba(255, 90, 90, 0.7)'; // light red
      const borderWidth = '2px';
      // default borders on all sides
      let top = `${borderWidth} dashed ${borderColor}`;
      let right = `${borderWidth} dashed ${borderColor}`;
      let bottom = `${borderWidth} dashed ${borderColor}`;
      let left = `${borderWidth} dashed ${borderColor}`;

      // If neighbor exists and is same area, hide that side
      const leftNeighbor = getCell(x - 1, y);
      if (leftNeighbor && (String(leftNeighbor.dataset.area || '').toLowerCase() === target)) {
        left = 'none';
      }
      const rightNeighbor = getCell(x + 1, y);
      if (rightNeighbor && (String(rightNeighbor.dataset.area || '').toLowerCase() === target)) {
        right = 'none';
      }
      const topNeighbor = getCell(x, y + 1);
      if (topNeighbor && (String(topNeighbor.dataset.area || '').toLowerCase() === target)) {
        top = 'none';
      }
      const bottomNeighbor = getCell(x, y - 1);
      if (bottomNeighbor && (String(bottomNeighbor.dataset.area || '').toLowerCase() === target)) {
        bottom = 'none';
      }

      // Set per-side borders
      cell.style.borderTop = top;
      cell.style.borderRight = right;
      cell.style.borderBottom = bottom;
      cell.style.borderLeft = left;

      cell.style.backgroundColor = 'rgba(255, 0, 0, 0.25)';
    });
  }

  // Show cart icon at specific coordinates
  _showCartIcon(x, y) {
    if (!this.shadowRoot) return;
    
    // Remove existing cart icon and user position highlight
    this._hideCartIcon();
    
    // Find the appropriate cell based on coordinates
    const cellKey = `${Math.floor(x)},${Math.floor(y)}`;
    const targetCell = this._cellElements[cellKey];
    
    if (!targetCell) {
      console.warn('No cell found for cart position:', { x, y, cellKey });
      return;
    }
    
    // Add user position highlight to the cell
    targetCell.classList.add('user-position');
    
    // Create cart icon
    this._cartIcon = document.createElement('div');
    this._cartIcon.className = 'cart-position-icon moving';
    this._cartIcon.innerHTML = '🛒'; // Shopping cart emoji
    this._cartIcon.title = `Cart position: (${x.toFixed(2)}, ${y.toFixed(2)})`;
    
    // Position the icon more precisely within the cell using fractional coordinates
    const fractionalX = x - Math.floor(x); // 0.0 to 0.99
    const fractionalY = y - Math.floor(y); // 0.0 to 0.99
    
    // Adjust position within cell (50% = center, fractional coordinates for precise positioning)
    const leftPercent = 50 + (fractionalX - 0.5) * 80; // ±40% from center
    const topPercent = 50 + (fractionalY - 0.5) * 80;  // ±40% from center
    
    this._cartIcon.style.left = `${Math.max(5, Math.min(95, leftPercent))}%`;
    this._cartIcon.style.top = `${Math.max(5, Math.min(95, topPercent))}%`;
    
    // Ensure cell is positioned relatively
    targetCell.style.position = 'relative';
    targetCell.appendChild(this._cartIcon);
    
    // Store reference to current cell for cleanup
    this._currentUserCell = targetCell;
    
    // Remove moving animation after animation completes
    setTimeout(() => {
      if (this._cartIcon) {
        this._cartIcon.classList.remove('moving');
      }
    }, 500);
    
    console.log('Cart icon displayed at:', { x, y, cellKey, leftPercent, topPercent });
  }

  // Hide cart icon
  _hideCartIcon() {
    if (this._cartIcon) {
      this._cartIcon.remove();
      this._cartIcon = null;
    }
    
    // Remove user position highlight from previous cell
    if (this._currentUserCell) {
      this._currentUserCell.classList.remove('user-position');
      this._currentUserCell = null;
    }
  }


  disconnectedCallback() {
    this._hideProductPopup();
    this._hideIconPicker();
    this._hideCartIcon();
    // Remove event listener
    document.removeEventListener('product-location-request', this._boundLocationHandler);
  }

  // Xử lý event từ product detail popup
  _handleProductLocationRequest(event) {
    const { productId, area, name } = event.detail;
    console.log('Received location request for:', productId, area, name);
    
    if (this.pinnedProducts.has(productId)) {
      // Gỡ pin
      this._unpinProduct(productId);
    } else {
      // Thêm pin
      this._pinProduct(productId, area, name);
    }
  }

  // Pin sản phẩm lên bản đồ
  _pinProduct(productId, area, name) {
    if (!area || area === 'NULL') {
      alert('Sản phẩm này không có vị trí trên bản đồ');
      return;
    }

    // Lưu thông tin tạm thời và hiển thị icon picker
    this._pendingPinData = { productId, area, name };
    this._showIconPicker();
  }

  // Hiển thị popup chọn icon
  _showIconPicker() {
    if (!this._pendingPinData) return;

    const { name } = this._pendingPinData;

    const iconPickerHTML = `
      <div class="icon-picker-overlay" id="iconPickerOverlay">
        <div class="icon-picker-container">
          <div class="icon-picker-header">
            <div class="icon-picker-title">Select icon for "${this._escape(name)}"</div>
            <button class="icon-picker-close" id="iconPickerClose">&times;</button>
          </div>
          
          <div class="icon-grid">
            ${this.availableIcons.map((icon, index) => `
              <div class="icon-option" data-icon="${icon.emoji}" data-index="${index}">
                <div class="icon-emoji">${icon.emoji}</div>
                <div class="icon-label">${icon.label}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="icon-picker-buttons">
            <button class="icon-picker-btn cancel" id="iconPickerCancel">Cancel</button>
            <button class="icon-picker-btn confirm" id="iconPickerConfirm" disabled>Verify</button>
          </div>
        </div>
      </div>
    `;

    const popupContainer = document.createElement('div');
    popupContainer.innerHTML = iconPickerHTML;
    this._iconPickerPopup = popupContainer.firstElementChild;
    
    // Thêm vào shadowRoot
    this.shadowRoot.appendChild(this._iconPickerPopup);

    // Thêm event listeners
    let selectedIcon = null;

    // Icon selection
    this._iconPickerPopup.querySelectorAll('.icon-option').forEach(option => {
      option.addEventListener('click', () => {
        // Remove previous selection
        this._iconPickerPopup.querySelectorAll('.icon-option').forEach(opt => 
          opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        selectedIcon = option.dataset.icon;
        
        // Enable confirm button
        this._iconPickerPopup.querySelector('#iconPickerConfirm').disabled = false;
      });
    });

    // Close handlers
    this._iconPickerPopup.querySelector('#iconPickerClose').addEventListener('click', () => {
      this._hideIconPicker();
    });

    this._iconPickerPopup.querySelector('#iconPickerCancel').addEventListener('click', () => {
      this._hideIconPicker();
    });

    // Confirm handler
    this._iconPickerPopup.querySelector('#iconPickerConfirm').addEventListener('click', () => {
      if (selectedIcon) {
        this._confirmPinWithIcon(selectedIcon);
      }
    });

    // Close on overlay click
    this._iconPickerPopup.addEventListener('click', (e) => {
      if (e.target === this._iconPickerPopup) {
        this._hideIconPicker();
      }
    });

    // ESC key to close
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this._hideIconPicker();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    this._iconPickerKeyHandler = handleKeydown;
  }

  // Ẩn icon picker popup
  _hideIconPicker() {
    if (this._iconPickerPopup) {
      this._iconPickerPopup.remove();
      this._iconPickerPopup = null;
    }
    if (this._iconPickerKeyHandler) {
      document.removeEventListener('keydown', this._iconPickerKeyHandler);
      this._iconPickerKeyHandler = null;
    }
    this._pendingPinData = null;
  }

  // Xác nhận pin với icon đã chọn
  _confirmPinWithIcon(selectedIcon) {
    if (!this._pendingPinData) return;

    const { productId, area, name } = this._pendingPinData;

    // Lưu thông tin pin với icon
    this.pinnedProducts.set(productId, { area, icon: selectedIcon, name });

    // Hiển thị pin trên bản đồ
    this._renderPins();
    this._renderPinLegend();

    // Cập nhật text nút trong popup nếu có
    this._updatePopupButtonText(productId, true);

    console.log(`Pinned product ${productId} at area ${area} with icon ${selectedIcon}`);

    // Ẩn popup
    this._hideIconPicker();
  }

  // Gỡ pin sản phẩm
  _unpinProduct(productId) {
    console.log('_unpinProduct called with:', productId, 'type:', typeof productId);
    console.log('Current pinnedProducts:', Array.from(this.pinnedProducts.keys()));
    
    const pinData = this.pinnedProducts.get(productId);
    if (!pinData) {
      console.error('Pin data not found for product:', productId);
      return;
    }

    console.log('Found pin data:', pinData);

    // Gỡ khỏi danh sách
    this.pinnedProducts.delete(productId);

    console.log('Removed from pinnedProducts. New size:', this.pinnedProducts.size);

    // Cập nhật hiển thị
    this._renderPins();
    this._renderPinLegend();

    // Cập nhật text nút trong popup nếu có
    this._updatePopupButtonText(productId, false);

    console.log(`Unpinned product ${productId} successfully`);
  }

  // Helper method để cập nhật text nút trong popup
  _updatePopupButtonText(productId, isPinned) {
    console.log('Updating popup button text for product:', productId, 'isPinned:', isPinned);
    // Tìm popup instance
    if (window.globalProductPopup) {
      window.globalProductPopup.updateLocationButtonText(productId, isPinned);
    }
  }

  // Hiển thị tất cả pin trên bản đồ
  _renderPins() {
    if (!this.shadowRoot) return;

    // Xóa tất cả pin cũ
    this.shadowRoot.querySelectorAll('.map-pin').forEach(pin => pin.remove());

    // Thêm pin mới
    this.pinnedProducts.forEach((pinData, productId) => {
      const { area, icon, name } = pinData;
      
      // Tìm tất cả cell có area này
      const cells = this.shadowRoot.querySelectorAll(`[data-area="${area}"]`);
      
      cells.forEach(cell => {
        const pin = document.createElement('div');
        pin.className = 'map-pin';
        pin.innerHTML = icon; // Hiển thị icon thay vì pin với màu
        pin.title = `${name} (${area})`; // Tooltip
        
        cell.style.position = 'relative';
        cell.appendChild(pin);
      });
    });
  }

  // Hiển thị chú thích pin
  _renderPinLegend() {
    if (!this.shadowRoot) return;

    const mapInfo = this.shadowRoot.querySelector('#mapInfo');
    if (!mapInfo) return;

    // Xóa legend cũ
    const oldLegend = mapInfo.querySelector('#pin-legend');
    if (oldLegend) oldLegend.remove();

    if (this.pinnedProducts.size === 0) return;

    // Tạo legend mới
    const legend = document.createElement('div');
    legend.id = 'pin-legend';
    legend.style.cssText = `
      margin-top: 12px;
      padding: 12px;
      background: var(--secondary-background-color, #2a2a2a);
      border-radius: 8px;
      border: 1px solid var(--divider-color, #444);
    `;
    
    let legendHTML = '<div style="font-weight: 600; margin-bottom: 8px; color: var(--primary-text-color, #eaeaea); font-size: 14px;">🗺️ Product location</div>';
    
    this.pinnedProducts.forEach((pinData, productId) => {
      const { icon, name, area } = pinData;
      legendHTML += `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: var(--secondary-text-color, #9aa0a6);">
          <div 
            data-product-id="${productId}" 
            style="display: flex; align-items: center; cursor: pointer; flex: 1; padding: 4px 8px; border-radius: 4px; transition: background-color 0.2s ease;"
            class="legend-product-info"
            title="Click để xem chi tiết sản phẩm ${name}"
          >
            <span style="margin-right: 8px; font-size: 14px;">${icon}</span>
            <span>${name} (${area})</span>
          </div>
          <button 
            data-product-id="${productId}" 
            style="background: #ff4444; color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 10px; cursor: pointer; margin-left: 8px;"
            title="Gỡ pin ${name}"
            class="legend-remove-btn"
          >×</button>
        </div>
      `;
    });
    
    legend.innerHTML = legendHTML;

    // Thêm event listeners cho click vào thông tin sản phẩm
    legend.querySelectorAll('.legend-product-info').forEach(infoDiv => {
      const productId = infoDiv.dataset.productId;
      
      infoDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Legend product info clicked for product:', productId);
        
        // Convert to number nếu cần và mở popup
        const productIdNum = parseInt(productId);
        this._popup.show(productIdNum, ApiConfig);
      });
      
      // Thêm hover effect cho thông tin sản phẩm
      infoDiv.addEventListener('mouseenter', () => {
        infoDiv.style.backgroundColor = 'var(--divider-color, #444)';
      });
      
      infoDiv.addEventListener('mouseleave', () => {
        infoDiv.style.backgroundColor = 'transparent';
      });
    });

    // Thêm event listeners cho các nút gỡ pin
    legend.querySelectorAll('.legend-remove-btn').forEach(btn => {
      const productId = btn.dataset.productId;
      
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Legend X button clicked for product:', productId, 'type:', typeof productId);
        
        // Convert to number nếu cần
        const productIdNum = parseInt(productId);
        console.log('Converting to number:', productIdNum);
        
        // Kiểm tra xem product có trong pinnedProducts không
        console.log('Current pinned products:', Array.from(this.pinnedProducts.keys()));
        console.log('Product exists in pinned?', this.pinnedProducts.has(productId), 'or as number?', this.pinnedProducts.has(productIdNum));
        
        // Thử cả hai kiểu
        if (this.pinnedProducts.has(productId)) {
          this._unpinProduct(productId);
        } else if (this.pinnedProducts.has(productIdNum)) {
          this._unpinProduct(productIdNum);
        } else {
          console.error('Product not found in pinned products:', productId);
        }
      });
      
      // Thêm hover effect
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#cc0000';
        btn.style.transform = 'scale(1.1)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#ff4444';
        btn.style.transform = 'scale(1)';
      });
    });

    mapInfo.appendChild(legend);
  }
}

customElements.define('general-map-card', GeneralMapCard);
