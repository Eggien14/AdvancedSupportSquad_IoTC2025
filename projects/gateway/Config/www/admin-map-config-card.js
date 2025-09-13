// Admin Map Configuration Management
// Quản lý cấu hình map cho Admin với đầy đủ tính năng

import ApiConfig from '/local/api-config.js';

class AdminMapConfigCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._mapList = [];
    this._expandedMaps = new Set();
    this._expandedBeacons = new Set(); // Track expanded beacons
    this._mapConfigs = {}; // Cache map configs từ API
    this._mapEntities = {}; // Cache map entities từ API
    this._beaconConfigs = {}; // Cache beacon configs từ API
    this._areaColors = {}; // Cache area colors
    this._rendered = false;
  }

  setConfig(config) {
    this._config = Object.assign({
      title: "Admin Map Configuration",
      show_header: true
    }, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
    this._loadMapListFromHA();
    this._loadAreaColorsFromHA();
  }

  getCardSize() {
    return 10;
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
        background: var(--warning-color-dark, #f57c00);
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
      
      .btn-info {
        background: var(--info-color, #17a2b8);
        color: white;
      }
      
      .btn-info:hover:not(:disabled) {
        background: var(--info-color-dark, #138496);
        transform: translateY(-1px);
      }
      
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .loading {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .status-container {
        height: 25px;
        margin-bottom: 20px;
        position: relative;
      }
      
      .main-content {
        display: flex;
        gap: 20px;
      }
      
      .sidebar {
        width: 250px;
        min-width: 250px;
        background: var(--secondary-background-color, #2a2a2a);
        border-radius: 8px;
        padding: 16px;
      }
      
      .sidebar h3 {
        margin: 0 0 16px 0;
        color: var(--primary-text-color, #eaeaea);
        font-size: 16px;
      }
      
      .area-colors {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .area-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .area-item:hover {
        background: var(--state-hover-color, #333);
      }
      
      .area-color-box {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #444);
      }
      
      .area-label {
        color: var(--primary-text-color, #eaeaea);
        font-size: 14px;
        flex: 1;
      }
      
      .area-delete-btn {
        background: var(--error-color, #f44336);
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 10px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .area-item:hover .area-delete-btn {
        opacity: 1;
      }
      
      .add-area-btn {
        margin-top: 12px;
        width: 100%;
        background: var(--secondary-color, #03dac6);
        color: var(--text-primary-color, #000);
        font-size: 12px;
        padding: 6px 12px;
      }
      
      .maps-container {
        flex: 1;
      }
      
      .map-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .map-item {
        background: var(--secondary-background-color, #2a2a2a);
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--divider-color, #3a3a3a);
      }
      
      .map-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        cursor: pointer;
        background: var(--secondary-background-color, #2a2a2a);
        transition: background 0.2s ease;
      }
      
      .map-header:hover {
        background: var(--state-hover-color, #333);
      }
      
      .map-title {
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
      
      .map-actions {
        display: flex;
        gap: 8px;
      }
      
      .map-content {
        padding: 16px;
        background: var(--card-background-color, #1e1e1e);
        display: none;
      }
      
      .map-content.expanded {
        display: block;
      }
      
      .map-grid-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        position: relative;
      }
      
      .map-grid {
        display: grid;
        grid-template-columns: repeat(10, 30px);
        grid-template-rows: repeat(10, 30px);
        gap: 1px;
        border: 2px solid var(--divider-color, #444);
        background: var(--divider-color, #444);
        position: relative;
      }
      
      .beacon-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      }
      
      .beacon-icon {
        position: absolute;
        width: 12px;
        height: 12px;
        background: #ff6b35;
        border: 1px solid #ffffff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: auto;
        cursor: help;
        z-index: 11;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 6px;
        font-weight: bold;
        color: white;
      }
      
      .beacon-icon::before {
        content: '📡';
        font-size: 8px;
      }
      
      .beacon-icon:hover {
        transform: translate(-50%, -50%) scale(1.2);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        z-index: 12;
      }
      
      .beacon-tooltip {
        position: absolute;
        background: var(--card-background-color, #1e1e1e);
        color: var(--primary-text-color, #eaeaea);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        border: 1px solid var(--divider-color, #444);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 15;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .beacon-icon:hover .beacon-tooltip {
        opacity: 1;
      }
      
      .map-cell {
        width: 30px;
        height: 30px;
        cursor: pointer;
        border: none;
        transition: opacity 0.2s ease;
      }
      
      .map-cell:hover {
        opacity: 0.7;
      }
      
      .map-coordinates {
        font-size: 12px;
        color: var(--secondary-text-color, #9aa0a6);
        margin-top: 8px;
        text-align: center;
      }
      
      .map-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
        padding: 8px;
        background: var(--secondary-background-color, #2a2a2a);
        border-radius: 4px;
        font-size: 11px;
      }
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        border: 1px solid var(--divider-color, #444);
      }
      
      .area-selector {
        position: absolute;
        background: var(--card-background-color, #1e1e1e);
        border: 2px solid var(--primary-color, #2196F3);
        border-radius: 6px;
        padding: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        display: none;
        min-width: 120px;
      }
      
      .area-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        cursor: pointer;
        border-radius: 4px;
        margin-bottom: 4px;
        transition: background 0.2s ease;
        font-size: 12px;
      }
      
      .area-option:hover {
        background: var(--state-hover-color, #333);
      }
      
      .area-option:last-child {
        margin-bottom: 0;
      }
      
      .area-option-color {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid var(--divider-color, #444);
      }
      
      .area-option-label {
        color: var(--primary-text-color, #eaeaea);
        font-weight: 500;
      }
      
      .status {
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin: 0;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        animation: slideDown 0.3s ease;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .status.success {
        background: var(--success-color, #4CAF50);
        color: white;
      }
      
      .status.error {
        background: var(--error-color, #f44336);
        color: white;
      }
      
      .status.warning {
        background: var(--warning-color, #FF9800);
        color: white;
      }
      
      .status.info {
        background: var(--info-color, #17a2b8);
        color: white;
      }
      
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .modal.show {
        display: flex;
      }
      
      .modal-content {
        background: var(--card-background-color, #1e1e1e);
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .modal-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color, #eaeaea);
      }
      
      .close-btn {
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
      
      .form-group {
        margin-bottom: 16px;
      }
      
      .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--primary-text-color, #eaeaea);
      }
      
      .form-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color, #444);
        border-radius: 4px;
        background: var(--secondary-background-color, #2a2a2a);
        color: var(--primary-text-color, #eaeaea);
        font-size: 14px;
      }
      
      .form-input:focus {
        outline: none;
        border-color: var(--primary-color, #2196F3);
      }
      
      .modal-buttons {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 20px;
      }
      
      /* Beacon Management Styles */
      .beacon-section {
        margin-top: 20px;
        border-top: 1px solid var(--divider-color, #2a2a2a);
        padding-top: 15px;
      }
      
      .beacon-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .beacon-header h3 {
        color: var(--primary-text-color, #eaeaea);
        margin: 0;
        font-size: 16px;
      }
      
      .beacon-actions {
        display: flex;
        gap: 8px;
      }
      
      .beacon-item {
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 8px;
        margin-bottom: 10px;
        background: var(--card-background-color, #252525);
      }
      
      .beacon-item .beacon-header {
        padding: 12px;
        margin-bottom: 0;
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color, #2a2a2a);
      }
      
      .beacon-title {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      
      .beacon-mac {
        font-size: 12px;
        color: var(--secondary-text-color, #888);
      }
      
      .beacon-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }
      
      .beacon-content.expanded {
        max-height: 400px;
      }
      
      .beacon-form {
        padding: 15px;
      }
      
      .beacon-form .form-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        gap: 10px;
      }
      
      .beacon-form label {
        width: 150px;
        font-size: 12px;
        color: var(--secondary-text-color, #888);
      }
      
      .beacon-form input {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid var(--divider-color, #2a2a2a);
        border-radius: 4px;
        background: var(--card-background-color, #1e1e1e);
        color: var(--primary-text-color, #eaeaea);
        font-size: 12px;
      }
      
      .beacon-form input:focus {
        outline: none;
        border-color: var(--primary-color, #007bff);
      }
      
      .beacon-form input[readonly] {
        background: var(--disabled-color, #333);
        color: var(--secondary-text-color, #888);
      }
      
      .no-beacons {
        text-align: center;
        color: var(--secondary-text-color, #888);
        font-style: italic;
        padding: 20px;
      }
      
      @media (max-width: 768px) {
        .main-content {
          flex-direction: column;
        }
        
        .sidebar {
          width: 100%;
          min-width: unset;
        }
        
        .header-buttons {
          flex-direction: column;
          width: 100%;
        }
        
        button {
          width: 100%;
        }
        
        .beacon-form .form-row {
          flex-direction: column;
          align-items: stretch;
        }
        
        .beacon-form label {
          width: auto;
          margin-bottom: 5px;
        }
      }
    `;

    const html = `
      <style>${style}</style>
      <div class="container">
        <div class="header">
          <div class="title">${this._config.title}</div>
          <div class="header-buttons">
            <button class="btn-info" id="downloadAllBtn">Download All Maps</button>
            <button class="btn-success" id="uploadAllBtn">Upload All Maps</button>
            <button class="btn-primary" id="createMapBtn">+ Create New Map</button>
          </div>
        </div>
        
        <div id="statusContainer" class="status-container"></div>
        
        <div class="main-content">
          <div class="sidebar">
            <h3>Area Colors</h3>
            <div class="area-colors" id="areaColors"></div>
            <button class="btn-primary add-area-btn" id="addAreaBtn">+ Define New Area</button>
          </div>
          
          <div class="maps-container">
            <div class="map-list" id="mapList"></div>
          </div>
        </div>
      </div>
      
      <!-- Area Selector Popup -->
      <div class="area-selector" id="areaSelector"></div>
      
      <!-- Modal for new map creation -->
      <div class="modal" id="newMapModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">Create New Map</div>
            <button class="close-btn" id="closeNewMapModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label" for="newMapId">Map ID *</label>
            <input type="number" class="form-input" id="newMapId" placeholder="Enter map ID" required>
          </div>
          <div class="modal-buttons">
            <button class="btn-primary" id="cancelNewMap">Cancel</button>
            <button class="btn-success" id="confirmNewMap">Create Map</button>
          </div>
        </div>
      </div>
      
      <!-- Modal for area color editing -->
      <div class="modal" id="colorModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">Edit Area Color</div>
            <button class="close-btn" id="closeColorModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label" for="areaCode">Area Code</label>
            <input type="text" class="form-input" id="areaCode" placeholder="Enter area code">
          </div>
          <div class="form-group">
            <label class="form-label" for="areaColor">Color</label>
            <input type="color" class="form-input" id="areaColor">
          </div>
          <div class="modal-buttons">
            <button class="btn-primary" id="cancelColor">Cancel</button>
            <button class="btn-success" id="confirmColor">Save Color</button>
          </div>
        </div>
      </div>

      <!-- Modal for new beacon creation -->
      <div class="modal" id="newBeaconModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">Create New Beacon</div>
            <button class="close-btn" id="closeNewBeaconModal">&times;</button>
          </div>
          <div class="form-group">
            <label class="form-label" for="newBeaconId">Beacon ID *</label>
            <input type="text" class="form-input" id="newBeaconId" placeholder="Enter beacon ID (e.g., 05)" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="newBeaconMapId">Map ID</label>
            <input type="number" class="form-input" id="newBeaconMapId" placeholder="Map ID" readonly>
          </div>
          <div class="modal-buttons">
            <button class="btn-primary" id="cancelNewBeacon">Cancel</button>
            <button class="btn-success" id="confirmNewBeacon">Create Beacon</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = html;
    this._rendered = true;
    this._attachEventListeners();
    
    // Add global click handler to close area selector
    this.shadowRoot.addEventListener('click', (e) => {
      if (!e.target.closest('.area-selector') && !e.target.closest('.map-cell')) {
        this._hideAreaSelector();
      }
    });
  }

  _attachEventListeners() {
    // Header buttons
    this.shadowRoot.getElementById('downloadAllBtn').addEventListener('click', () => this._downloadAllMaps());
    this.shadowRoot.getElementById('uploadAllBtn').addEventListener('click', () => this._uploadAllMaps());
    this.shadowRoot.getElementById('createMapBtn').addEventListener('click', () => this._showNewMapModal());
    
    // Area color management
    this.shadowRoot.getElementById('addAreaBtn').addEventListener('click', () => this._showColorModal());
    
    // New map modal
    this.shadowRoot.getElementById('closeNewMapModal').addEventListener('click', () => this._hideNewMapModal());
    this.shadowRoot.getElementById('cancelNewMap').addEventListener('click', () => this._hideNewMapModal());
    this.shadowRoot.getElementById('confirmNewMap').addEventListener('click', () => this._createNewMap());
    
    // Color modal
    this.shadowRoot.getElementById('closeColorModal').addEventListener('click', () => this._hideColorModal());
    this.shadowRoot.getElementById('cancelColor').addEventListener('click', () => this._hideColorModal());
    this.shadowRoot.getElementById('confirmColor').addEventListener('click', () => this._saveAreaColor());
    
    // New beacon modal
    this.shadowRoot.getElementById('closeNewBeaconModal').addEventListener('click', () => this._hideNewBeaconModal());
    this.shadowRoot.getElementById('cancelNewBeacon').addEventListener('click', () => this._hideNewBeaconModal());
    this.shadowRoot.getElementById('confirmNewBeacon').addEventListener('click', () => this._createNewBeacon());
  }

  async _loadMapListFromHA() {
    if (!this._hass) return;
    
    const mapListEntity = this._hass.states['input_text.admin_map_list'];
    if (mapListEntity && mapListEntity.state) {
      const newMapList = mapListEntity.state.split(',').map(id => id.trim()).filter(id => id);
      if (JSON.stringify(newMapList) !== JSON.stringify(this._mapList)) {
        this._mapList = newMapList;
        this._renderMapList();
      }
    }
  }

  async _loadAreaColorsFromHA() {
    if (!this._hass) return;
    
    const colorEntity = this._hass.states['input_text.map_entity_colour'];
    if (colorEntity && colorEntity.state) {
      this._parseAreaColors(colorEntity.state);
      this._renderAreaColors();
    }
  }

  _parseAreaColors(colorString) {
    this._areaColors = {};
    const pairs = colorString.split(',');
    pairs.forEach(pair => {
      const [area, color] = pair.split('-');
      if (area && color) {
        this._areaColors[area.trim()] = color.trim();
      }
    });
  }

  _renderAreaColors() {
    const container = this.shadowRoot.getElementById('areaColors');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(this._areaColors).forEach(([area, color]) => {
      const areaItem = document.createElement('div');
      areaItem.className = 'area-item';
      areaItem.innerHTML = `
        <div class="area-color-box" style="background-color: ${color}"></div>
        <div class="area-label">${area}</div>
        ${area !== 'NULL' ? '<button class="area-delete-btn" title="Delete area">×</button>' : ''}
      `;
      
      // Edit color on main area click
      const colorBox = areaItem.querySelector('.area-color-box');
      const label = areaItem.querySelector('.area-label');
      
      const editHandler = () => this._editAreaColor(area, color);
      colorBox.addEventListener('click', editHandler);
      label.addEventListener('click', editHandler);
      
      // Delete area on delete button click
      const deleteBtn = areaItem.querySelector('.area-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._deleteAreaColor(area);
        });
      }
      
      container.appendChild(areaItem);
    });
  }

  _renderMapList() {
    const container = this.shadowRoot.getElementById('mapList');
    if (!container) return;
    
    container.innerHTML = '';
    
    this._mapList.forEach(mapId => {
      const mapItem = this._createMapItem(mapId);
      container.appendChild(mapItem);
    });
  }

  _createMapItem(mapId) {
    const mapItem = document.createElement('div');
    mapItem.className = 'map-item';
    
    const isExpanded = this._expandedMaps.has(mapId);
    
    mapItem.innerHTML = `
      <div class="map-header" data-map-id="${mapId}">
        <div class="map-title">
          <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>
          <span>Map ${mapId}</span>
        </div>
        <div class="map-actions">
          <button class="btn-info map-refresh" data-map-id="${mapId}">Download</button>
          <button class="btn-success map-save" data-map-id="${mapId}">Upload</button>
          <button class="btn-danger map-delete" data-map-id="${mapId}">Delete</button>
        </div>
      </div>
      <div class="map-content ${isExpanded ? 'expanded' : ''}" id="mapContent${mapId}">
        <div class="map-grid-container">
          <div class="map-grid" id="mapGrid${mapId}">
            <div class="beacon-overlay" id="beaconOverlay${mapId}"></div>
          </div>
          <div class="map-coordinates">Coordinates: (x, y) - Click cells to change area</div>
          <div class="map-legend" id="mapLegend${mapId}"></div>
        </div>
        
        <!-- Beacon Management Section -->
        <div class="beacon-section">
          <div class="beacon-header">
            <h3>Beacon Management</h3>
            <div class="beacon-actions">
              <button class="btn-success" id="newBeaconBtn${mapId}">+ New Beacon</button>
            </div>
          </div>
          <div class="beacon-list" id="beaconList${mapId}"></div>
        </div>
      </div>
    `;
    
    // Attach event listeners
    const header = mapItem.querySelector('.map-header');
    header.addEventListener('click', (e) => {
      if (!e.target.closest('.map-actions')) {
        this._toggleMapExpansion(mapId);
      }
    });
    
    const refreshBtn = mapItem.querySelector('.map-refresh');
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Download both map and beacons
      Promise.all([
        this._downloadMap(mapId),
        this._downloadBeacons(mapId)
      ]).then(() => {
        this._renderBeaconList(mapId);
      }).catch(error => {
        console.error('Download error:', error);
      });
    });
    
    const saveBtn = mapItem.querySelector('.map-save');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._uploadMap(mapId);
    });
    
    const deleteBtn = mapItem.querySelector('.map-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._deleteMap(mapId);
    });

    // New beacon button
    const newBeaconBtn = mapItem.querySelector(`#newBeaconBtn${mapId}`);
    if (newBeaconBtn) {
      newBeaconBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showNewBeaconModal(mapId);
      });
    }

    return mapItem;
  }

  _toggleMapExpansion(mapId) {
    const icon = this.shadowRoot.querySelector(`[data-map-id="${mapId}"] .expand-icon`);
    const content = this.shadowRoot.getElementById(`mapContent${mapId}`);
    
    if (this._expandedMaps.has(mapId)) {
      this._expandedMaps.delete(mapId);
      icon.classList.remove('expanded');
      content.classList.remove('expanded');
    } else {
      this._expandedMaps.add(mapId);
      icon.classList.add('expanded');
      content.classList.add('expanded');
      
      // Load map data if not already loaded
      if (!this._mapConfigs[mapId]) {
        this._downloadMap(mapId);
      } else {
        this._renderMapGrid(mapId);
      }
      
      // Load beacon data if not already loaded
      if (!this._beaconConfigs[mapId]) {
        this._downloadBeacons(mapId).then(() => {
          this._renderBeaconList(mapId);
        }).catch(error => {
          console.error('Failed to load beacon data:', error);
          this._renderBeaconList(mapId); // Render empty list
        });
      } else {
        this._renderBeaconList(mapId);
      }
    }
  }

  async _downloadMap(mapId) {
    try {
      this._showStatus(`Downloading map ${mapId}...`, 'info');
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map/${mapId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this._mapConfigs[mapId] = data.cells || [];
      this._renderMapGrid(mapId);
      
      this._showStatus(`Map ${mapId} downloaded successfully!`, 'success');
    } catch (error) {
      console.error('Download map error:', error);
      this._showStatus(`Failed to download map ${mapId}: ${error.message}`, 'error');
    }
  }

  async _downloadBeacons(mapId) {
    try {
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map_beacon/${mapId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this._beaconConfigs[mapId] = data.beacons || [];
      
      // Save to shared storage in Home Assistant
      this._saveAllBeaconsToSharedStorage(mapId, data.beacons || []);
      
    } catch (error) {
      console.error('Download beacons error:', error);
      this._beaconConfigs[mapId] = []; // Set empty array on error
      throw error;
    }
  }

  _renderBeaconList(mapId) {
    const container = this.shadowRoot.getElementById(`beaconList${mapId}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    const beacons = this._beaconConfigs[mapId] || [];
    
    if (beacons.length === 0) {
      container.innerHTML = '<div class="no-beacons">No beacons found for this map. Click "Download" to load beacons from server.</div>';
      return;
    }
    
    beacons.forEach(beacon => {
      const beaconItem = this._createBeaconItem(mapId, beacon);
      container.appendChild(beaconItem);
    });
    
    // Auto-fill all expanded beacon forms after rendering
    setTimeout(() => {
      beacons.forEach(beacon => {
        const key = `${mapId}-${beacon.beacon_id}`;
        if (this._expandedBeacons.has(key)) {
          this._updateBeaconForm(mapId, beacon.beacon_id, beacon);
        }
      });
      
      // Update beacon overlay on map
      this._renderBeaconOverlay(mapId);
    }, 100);
  }

  _createBeaconItem(mapId, beacon) {
    const beaconItem = document.createElement('div');
    beaconItem.className = 'beacon-item';
    
    const isExpanded = this._expandedBeacons.has(`${mapId}-${beacon.beacon_id}`);
    
    beaconItem.innerHTML = `
      <div class="beacon-header" data-map-id="${mapId}" data-beacon-id="${beacon.beacon_id}">
        <div class="beacon-title">
          <span class="expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>
          <span>Beacon ${beacon.beacon_id}</span>
          <span class="beacon-mac">(${beacon.beacon_mac_address || beacon.mac_address || 'undefined'})</span>
        </div>
        <div class="beacon-actions">
          <button class="btn-info beacon-download" data-map-id="${mapId}" data-beacon-id="${beacon.beacon_id}">Download</button>
          <button class="btn-success beacon-save" data-map-id="${mapId}" data-beacon-id="${beacon.beacon_id}">Save</button>
          <button class="btn-danger beacon-delete" data-map-id="${mapId}" data-beacon-id="${beacon.beacon_id}">Delete</button>
        </div>
      </div>
      <div class="beacon-content ${isExpanded ? 'expanded' : ''}" id="beaconContent${mapId}_${beacon.beacon_id}">
        <div class="beacon-form">
          <div class="form-row">
            <label>Beacon ID:</label>
            <input type="text" class="beacon-input" data-map="${mapId}" data-beacon="${beacon.beacon_id}" data-field="beacon_id" 
                   value="${beacon.beacon_id || ''}" readonly>
          </div>
          <div class="form-row">
            <label>MAC Address:</label>
            <input type="text" class="beacon-input" data-map="${mapId}" data-beacon="${beacon.beacon_id}" data-field="beacon_mac_address" 
                   value="${beacon.beacon_mac_address || beacon.mac_address || ''}">
          </div>
          <div class="form-row">
            <label>X Coordinate:</label>
            <input type="number" step="0.01" class="beacon-input" data-map="${mapId}" data-beacon="${beacon.beacon_id}" data-field="beacon_x_coordinate" 
                   value="${beacon.beacon_x_coordinate || beacon.x || ''}">
          </div>
          <div class="form-row">
            <label>Y Coordinate:</label>
            <input type="number" step="0.01" class="beacon-input" data-map="${mapId}" data-beacon="${beacon.beacon_id}" data-field="beacon_y_coordinate" 
                   value="${beacon.beacon_y_coordinate || beacon.y || ''}">
          </div>
          <div class="form-row">
            <label>D0 (Reference Distance):</label>
            <input type="number" step="0.1" class="beacon-input" data-map="${mapId}" data-beacon="${beacon.beacon_id}" data-field="beacon_D0" 
                   value="${beacon.beacon_D0 || beacon.D0 || ''}">
          </div>
          <div class="form-row">
            <label>n (Path Loss Exponent):</label>
            <input type="number" step="0.01" class="beacon-input" data-map="${mapId}" data-beacon="${beacon.beacon_id}" data-field="beacon_n" 
                   value="${beacon.beacon_n || beacon.n || ''}">
          </div>
        </div>
      </div>
    `;
    
    // Attach event listeners
    const header = beaconItem.querySelector('.beacon-header');
    header.addEventListener('click', (e) => {
      if (!e.target.closest('.beacon-actions')) {
        this._toggleBeaconExpansion(mapId, beacon.beacon_id);
      }
    });
    
    const downloadBtn = beaconItem.querySelector('.beacon-download');
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._downloadSingleBeacon(mapId, beacon.beacon_id);
    });
    
    const saveBtn = beaconItem.querySelector('.beacon-save');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._saveBeacon(mapId, beacon.beacon_id);
    });
    
    const deleteBtn = beaconItem.querySelector('.beacon-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._deleteBeacon(mapId, beacon.beacon_id);
    });
    
    return beaconItem;
  }

  _toggleBeaconExpansion(mapId, beaconId) {
    const key = `${mapId}-${beaconId}`;
    const icon = this.shadowRoot.querySelector(`[data-map-id="${mapId}"][data-beacon-id="${beaconId}"] .expand-icon`);
    const content = this.shadowRoot.getElementById(`beaconContent${mapId}_${beaconId}`);
    
    console.log(`🔄 Toggling beacon ${mapId}-${beaconId}, current expanded:`, this._expandedBeacons.has(key));
    
    if (this._expandedBeacons.has(key)) {
      this._expandedBeacons.delete(key);
      icon.classList.remove('expanded');
      content.classList.remove('expanded');
    } else {
      this._expandedBeacons.add(key);
      icon.classList.add('expanded');
      content.classList.add('expanded');
      
      // Auto-fill form when expanded (similar to cart logic)
      const beacons = this._beaconConfigs[mapId] || [];
      
      // Try both string and number comparison for beacon_id
      const beaconData = beacons.find(b => 
        b.beacon_id === beaconId || 
        b.beacon_id === String(beaconId) || 
        String(b.beacon_id) === String(beaconId)
      );
      
      if (beaconData) {
        setTimeout(() => {
          this._updateBeaconForm(mapId, beaconId, beaconData);
        }, 100); // Small delay to ensure DOM is ready
      } else {
        console.warn(`❌ No beacon data found for beacon_id: ${beaconId}`);
      }
    }
  }

  async _downloadSingleBeacon(mapId, beaconId) {
    try {
      this._showStatus(`Downloading beacon ${beaconId} from map ${mapId}...`, 'info');
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map_beacon/${mapId}/${beaconId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const beaconData = await response.json();
      console.log(`Downloaded beacon ${beaconId}:`, beaconData);
      
      // Update local config
      if (!this._beaconConfigs[mapId]) {
        this._beaconConfigs[mapId] = [];
      }
      
      const beacons = this._beaconConfigs[mapId];
      const beaconIndex = beacons.findIndex(b => b.beacon_id === beaconId);
      if (beaconIndex >= 0) {
        beacons[beaconIndex] = beaconData;
      } else {
        beacons.push(beaconData);
      }
      
      // Save to shared storage in Home Assistant
      this._saveBeaconToSharedStorage(mapId, beaconData);
      
      // Re-render beacon list to get updated form
      this._renderBeaconList(mapId);
      
      // Ensure the beacon is expanded after re-render
      const key = `${mapId}-${beaconId}`;
      this._expandedBeacons.add(key);
      
      // Re-render again to show expanded state
      setTimeout(() => {
        this._renderBeaconList(mapId);
      }, 50);
      
      this._showStatus(`Beacon ${beaconId} downloaded and auto-filled successfully!`, 'success');
    } catch (error) {
      console.error('Download single beacon error:', error);
      this._showStatus(`Failed to download beacon ${beaconId}: ${error.message}`, 'error');
    }
  }

  _updateBeaconForm(mapId, beaconId, beaconData) {
    // Find all inputs for this beacon và fill với data từ API
    const inputs = this.shadowRoot.querySelectorAll(`input[data-map="${mapId}"][data-beacon="${beaconId}"]`);
    
    if (inputs.length === 0) {
      console.warn(`No inputs found for beacon ${beaconId}`);
      return;
    }
    
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      
      if (beaconData[field] !== undefined) {
        input.value = beaconData[field] || '';
      }
    });
  }

  _collectBeaconFormData(mapId, beaconId) {
    // Collect form data from input boxes (same logic as _saveBeacon)
    const beaconData = { beacon_id: beaconId };
    const inputs = this.shadowRoot.querySelectorAll(`input[data-map="${mapId}"][data-beacon="${beaconId}"]`);
    
    inputs.forEach(input => {
      const field = input.getAttribute('data-field');
      const value = input.value.trim();
      
      if (field === 'beacon_id') {
        beaconData[field] = beaconId; // Always use the beaconId parameter
      } else if (field === 'beacon_x_coordinate' || field === 'beacon_y_coordinate' || field === 'beacon_D0' || field === 'beacon_n') {
        beaconData[field] = value ? parseFloat(value) : null;
      } else {
        beaconData[field] = value || null;
      }
    });
    
    return beaconData;
  }

  async _saveBeacon(mapId, beaconId) {
    try {
      console.log(`Starting save beacon ${beaconId} for map ${mapId}`);
      
      // Use helper method to collect form data
      const beaconData = this._collectBeaconFormData(mapId, beaconId);
      console.log(`Final beacon data to save:`, beaconData);
      
      this._showStatus(`Saving beacon ${beaconId} for map ${mapId}...`, 'info');
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      console.log(`Using API base URL: ${apiBaseUrl}`);
      
      const response = await fetch(`${apiBaseUrl}/map_beacon/${mapId}/${beaconId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(beaconData)
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Response error text:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const savedBeaconData = await response.json();
      
      // Update local config
      const beacons = this._beaconConfigs[mapId] || [];
      const beaconIndex = beacons.findIndex(b => b.beacon_id === beaconId);
      if (beaconIndex >= 0) {
        beacons[beaconIndex] = savedBeaconData;
      } else {
        beacons.push(savedBeaconData);
      }
      this._beaconConfigs[mapId] = beacons;
      
      // Save to shared storage in Home Assistant
      this._saveBeaconToSharedStorage(mapId, savedBeaconData);
      
      this._showStatus(`Beacon ${beaconId} saved successfully!`, 'success');
    } catch (error) {
      console.error('Save beacon error:', error);
      this._showStatus(`Failed to save beacon ${beaconId}: ${error.message}`, 'error');
    }
  }

  async _deleteBeacon(mapId, beaconId) {
    if (!confirm(`Are you sure you want to delete beacon ${beaconId} from map ${mapId}?`)) {
      return;
    }
    
    try {
      this._showStatus(`Deleting beacon ${beaconId} from map ${mapId}...`, 'info');
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map_beacon/delete-beacon/${mapId}/${beaconId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Update local config
      const beacons = this._beaconConfigs[mapId] || [];
      this._beaconConfigs[mapId] = beacons.filter(b => b.beacon_id !== beaconId);
      
      // Remove from shared storage in Home Assistant
      this._removeBeaconFromSharedStorage(mapId, beaconId);
      
      // Re-render beacon list
      this._renderBeaconList(mapId);
      
      this._showStatus(`Beacon ${beaconId} deleted successfully!`, 'success');
    } catch (error) {
      console.error('Delete beacon error:', error);
      this._showStatus(`Failed to delete beacon ${beaconId}: ${error.message}`, 'error');
    }
  }

  async _uploadBeacons(mapId) {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const beacons = JSON.parse(text);
          
          if (!Array.isArray(beacons)) {
            throw new Error('File must contain an array of beacons');
          }
          
          this._showStatus(`Uploading ${beacons.length} beacons to map ${mapId}...`, 'info');
          
          // Upload each beacon
          const apiBaseUrl = ApiConfig.getApiBaseAuto();
          
          for (const beacon of beacons) {
            const response = await fetch(`${apiBaseUrl}/map_beacon/${mapId}/${beacon.beacon_id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(beacon)
            });
            
            if (!response.ok) {
              throw new Error(`Failed to upload beacon ${beacon.beacon_id}: HTTP ${response.status}`);
            }
          }
          
          // Reload beacon data
          await this._downloadBeacons(mapId);
          this._renderBeaconList(mapId);
          
          this._showStatus(`Successfully uploaded ${beacons.length} beacons to map ${mapId}!`, 'success');
        } catch (error) {
          console.error('Upload beacons error:', error);
          this._showStatus(`Failed to upload beacons: ${error.message}`, 'error');
        }
      };
      input.click();
    } catch (error) {
      console.error('Upload beacons error:', error);
      this._showStatus(`Failed to upload beacons: ${error.message}`, 'error');
    }
  }

  // Helper functions for shared beacon storage in Home Assistant input_text entities
  _saveBeaconToSharedStorage(mapId, beaconData) {
    if (!this._hass || !beaconData || !beaconData.beacon_id) return;

    try {
      console.log(`Saving beacon to shared storage:`, { mapId, beaconData });
      
      // Get current beacon ID list
      const beaconIdEntity = `input_text.map_${mapId}_new_beacon_id`;
      const currentIds = this._hass.states[beaconIdEntity]?.state || '';
      const beaconIds = currentIds ? currentIds.split(',').map(id => id.trim()) : [];
      
      console.log(`Current beacon IDs:`, beaconIds);
      
      // Find or add beacon ID position
      let beaconIndex = beaconIds.indexOf(beaconData.beacon_id);
      if (beaconIndex === -1) {
        beaconIds.push(beaconData.beacon_id);
        beaconIndex = beaconIds.length - 1;
        
        // Update beacon ID list
        this._hass.callService('input_text', 'set_value', {
          entity_id: beaconIdEntity,
          value: beaconIds.join(',')
        });
        
        console.log(`Added new beacon ID, new list:`, beaconIds.join(','));
      }
      
      console.log(`Beacon index:`, beaconIndex);
      
      // Save beacon data to corresponding positions
      const fields = [
        { key: 'beacon_mac_address', entity: `input_text.map_${mapId}_new_beacon_mac_address` },
        { key: 'beacon_x_coordinate', entity: `input_text.map_${mapId}_new_beacon_x_coordinate` },
        { key: 'beacon_y_coordinate', entity: `input_text.map_${mapId}_new_beacon_y_coordinate` },
        { key: 'beacon_D0', entity: `input_text.map_${mapId}_new_beacon_d0` },
        { key: 'beacon_n', entity: `input_text.map_${mapId}_new_beacon_n` }
      ];
      
      fields.forEach(field => {
        const entity = field.entity;
        const currentValues = this._hass.states[entity]?.state || '';
        const values = currentValues ? currentValues.split(',').map(v => v.trim()) : [];
        
        console.log(`Field ${field.key}: current values:`, values);
        
        // Ensure array is large enough
        while (values.length <= beaconIndex) {
          values.push('');
        }
        
        // Update value at beacon position
        const newValue = beaconData[field.key] || '';
        values[beaconIndex] = newValue;
        
        console.log(`Field ${field.key}: setting value "${newValue}" at index ${beaconIndex}, new values:`, values);
        
        // Save to Home Assistant
        this._hass.callService('input_text', 'set_value', {
          entity_id: entity,
          value: values.join(',')
        });
      });
      
      console.log(`Saved beacon ${beaconData.beacon_id} to shared storage at position ${beaconIndex}`);
    } catch (error) {
      console.error('Error saving beacon to shared storage:', error);
    }
  }

  _removeBeaconFromSharedStorage(mapId, beaconId) {
    if (!this._hass || !beaconId) return;

    try {
      // Get current beacon ID list
      const beaconIdEntity = `input_text.map_${mapId}_new_beacon_id`;
      const currentIds = this._hass.states[beaconIdEntity]?.state || '';
      const beaconIds = currentIds ? currentIds.split(',').map(id => id.trim()) : [];
      
      // Find beacon position
      const beaconIndex = beaconIds.indexOf(beaconId);
      if (beaconIndex === -1) {
        console.log(`Beacon ${beaconId} not found in shared storage`);
        return;
      }
      
      // Remove beacon ID
      beaconIds.splice(beaconIndex, 1);
      
      // Update beacon ID list
      this._hass.callService('input_text', 'set_value', {
        entity_id: beaconIdEntity,
        value: beaconIds.join(',')
      });
      
      // Remove corresponding data from all fields
      const fields = [
        `input_text.map_${mapId}_new_beacon_mac_address`,
        `input_text.map_${mapId}_new_beacon_x_coordinate`,
        `input_text.map_${mapId}_new_beacon_y_coordinate`,
        `input_text.map_${mapId}_new_beacon_d0`,
        `input_text.map_${mapId}_new_beacon_n`
      ];
      
      fields.forEach(entity => {
        const currentValues = this._hass.states[entity]?.state || '';
        const values = currentValues ? currentValues.split(',').map(v => v.trim()) : [];
        
        if (beaconIndex < values.length) {
          values.splice(beaconIndex, 1);
          
          // Save updated values
          this._hass.callService('input_text', 'set_value', {
            entity_id: entity,
            value: values.join(',')
          });
        }
      });
      
      console.log(`Removed beacon ${beaconId} from shared storage at position ${beaconIndex}`);
    } catch (error) {
      console.error('Error removing beacon from shared storage:', error);
    }
  }

  _saveAllBeaconsToSharedStorage(mapId, beacons) {
    if (!this._hass || !Array.isArray(beacons)) return;

    try {
      // Collect all beacon IDs and data
      const beaconIds = beacons.map(b => b.beacon_id);
      const macAddresses = beacons.map(b => b.beacon_mac_address || '');
      const xCoordinates = beacons.map(b => b.beacon_x_coordinate || '');
      const yCoordinates = beacons.map(b => b.beacon_y_coordinate || '');
      const d0Values = beacons.map(b => b.beacon_D0 || '');
      const nValues = beacons.map(b => b.beacon_n || '');
      
      // Save all data at once
      const updates = [
        { entity: `input_text.map_${mapId}_new_beacon_id`, values: beaconIds },
        { entity: `input_text.map_${mapId}_new_beacon_mac_address`, values: macAddresses },
        { entity: `input_text.map_${mapId}_new_beacon_x_coordinate`, values: xCoordinates },
        { entity: `input_text.map_${mapId}_new_beacon_y_coordinate`, values: yCoordinates },
        { entity: `input_text.map_${mapId}_new_beacon_d0`, values: d0Values },
        { entity: `input_text.map_${mapId}_new_beacon_n`, values: nValues }
      ];
      
      updates.forEach(update => {
        this._hass.callService('input_text', 'set_value', {
          entity_id: update.entity,
          value: update.values.join(',')
        });
      });
      
      console.log(`Saved ${beacons.length} beacons to shared storage for map ${mapId}`);
    } catch (error) {
      console.error('Error saving all beacons to shared storage:', error);
    }
  }

  async _downloadAllMaps() {
    if (this._mapList.length === 0) {
      this._showStatus('No maps in list', 'warning');
      return;
    }
    
    try {
      this._showStatus('Downloading all maps and beacons...', 'info');
      
      // Download map data
      const mapPromises = this._mapList.map(mapId => this._downloadMap(mapId));
      await Promise.all(mapPromises);
      
      // Download beacon data for all maps
      const beaconPromises = this._mapList.map(mapId => this._downloadBeacons(mapId));
      await Promise.all(beaconPromises);
      
      this._showStatus('All maps and beacons downloaded successfully!', 'success');
      this._renderMapList(); // Re-render to show beacon data
    } catch (error) {
      console.error('Download all maps error:', error);
      this._showStatus(`Failed to download all maps: ${error.message}`, 'error');
    }
  }

  async _uploadMap(mapId) {
    try {
      const mapData = this._mapConfigs[mapId];
      if (!mapData || mapData.length === 0) {
        this._showStatus(`No data to upload for map ${mapId}`, 'warning');
        return;
      }
      
      this._showStatus(`Uploading map ${mapId}...`, 'info');
      
      // Convert to the format expected by API
      const cells = mapData.map(cell => ({
        x_coor: cell.x_coordinate,
        y_coor: cell.y_coordinate,
        area: cell.area
      }));
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map/map-upload/${mapId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cells: cells })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Also upload beacons if any exist for this map
      const beacons = this._beaconConfigs[mapId];
      
      if (beacons && beacons.length > 0) {
        this._showStatus(`Uploading ${beacons.length} beacons for map ${mapId}...`, 'info');
        
        for (const beacon of beacons) {
          try {
            // Collect current form data for this beacon (like _saveBeacon does)
            const currentBeaconData = this._collectBeaconFormData(mapId, beacon.beacon_id);
            
            const beaconResponse = await fetch(`${apiBaseUrl}/map_beacon/${mapId}/${beacon.beacon_id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(currentBeaconData)
            });
            
            if (!beaconResponse.ok) {
              console.warn(`Failed to upload beacon ${beacon.beacon_id}: HTTP ${beaconResponse.status}`);
            } else {
              // Save to shared storage after successful upload
              const savedBeaconData = await beaconResponse.json();
              this._saveBeaconToSharedStorage(mapId, savedBeaconData);
            }
          } catch (beaconError) {
            console.warn(`Error uploading beacon ${beacon.beacon_id}:`, beaconError);
          }
        }
      }
      
      this._showStatus(`Map ${mapId} uploaded successfully!`, 'success');
    } catch (error) {
      console.error('Upload map error:', error);
      this._showStatus(`Failed to upload map ${mapId}: ${error.message}`, 'error');
    }
  }

  async _uploadAllMaps() {
    if (this._mapList.length === 0) {
      this._showStatus('No maps in list', 'warning');
      return;
    }
    
    try {
      this._showStatus('Uploading all maps...', 'info');
      
      const promises = this._mapList.map(mapId => this._uploadMap(mapId));
      await Promise.all(promises);
      
      this._showStatus('All maps uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload all maps error:', error);
      this._showStatus(`Failed to upload all maps: ${error.message}`, 'error');
    }
  }

  async _deleteMap(mapId) {
    if (!confirm(`Are you sure you want to delete map ${mapId}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      this._showStatus(`Deleting map ${mapId}...`, 'info');
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map/delete-map/${mapId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Remove from local data
      delete this._mapConfigs[mapId];
      this._expandedMaps.delete(mapId);
      
      // Remove from map list
      this._mapList = this._mapList.filter(id => id !== mapId);
      await this._updateMapListInHA();
      
      this._showStatus(`Map ${mapId} deleted successfully!`, 'success');
    } catch (error) {
      console.error('Delete map error:', error);
      this._showStatus(`Failed to delete map ${mapId}: ${error.message}`, 'error');
    }
  }

  _renderMapGrid(mapId) {
    const grid = this.shadowRoot.getElementById(`mapGrid${mapId}`);
    const legend = this.shadowRoot.getElementById(`mapLegend${mapId}`);
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const mapData = this._mapConfigs[mapId] || [];
    
    // Create 10x10 grid (y from 9 to 0, x from 0 to 9)
    for (let y = 9; y >= 0; y--) {
      for (let x = 0; x <= 9; x++) {
        const cell = mapData.find(c => c.x_coordinate === x && c.y_coordinate === y);
        const area = cell ? cell.area : 'NULL';
        const color = this._areaColors[area] || this._areaColors['NULL'] || '#808080';
        
        const cellElement = document.createElement('button');
        cellElement.className = 'map-cell';
        cellElement.style.backgroundColor = color;
        cellElement.title = `(${x}, ${y}) - ${area}`;
        cellElement.dataset.x = x;
        cellElement.dataset.y = y;
        cellElement.dataset.mapId = mapId;
        
        cellElement.addEventListener('click', (e) => this._onCellClick(mapId, x, y, area, e));
        
        grid.appendChild(cellElement);
      }
    }
    
    // Add beacon overlay after rendering cells
    const beaconOverlay = document.createElement('div');
    beaconOverlay.className = 'beacon-overlay';
    beaconOverlay.id = `beaconOverlay${mapId}`;
    grid.appendChild(beaconOverlay);
    
    // Update legend
    if (legend) {
      this._renderMapLegend(mapId, legend);
    }
    
    // Render beacon overlay after DOM update
    setTimeout(() => {
      this._renderBeaconOverlay(mapId);
    }, 50);
  }

  _renderBeaconOverlay(mapId) {
    const overlay = this.shadowRoot.getElementById(`beaconOverlay${mapId}`);
    if (!overlay) {
      return;
    }
    
    // Clear existing beacon icons
    overlay.innerHTML = '';
    
    const beacons = this._beaconConfigs[mapId] || [];
    
    beacons.forEach(beacon => {
      // Get coordinates from beacon data
      let x = beacon.beacon_x_coordinate || beacon.x;
      let y = beacon.beacon_y_coordinate || beacon.y;
      
      // Skip if no valid coordinates
      if (x === undefined || x === null || y === undefined || y === null) {
        return;
      }
      
      // Convert to numbers
      x = parseFloat(x);
      y = parseFloat(y);
      
      // Ensure coordinates are within grid bounds (0-10)
      if (x < 0 || x > 10 || y < 0 || y > 10) {
        console.warn(`Beacon ${beacon.beacon_id} coordinates (${x}, ${y}) are outside grid bounds (0-10)`);
        return;
      }
      
      // Calculate position on the grid
      const cellSize = 30;
      const gap = 1;
      const totalCellSize = cellSize + gap;
      
      // Grid thực tế có 10x10 ô với x từ 0-9 và y từ 9-0 (CSS)
      // Nhưng tọa độ beacon từ 0-10 cho cả x và y
      
      // Map tọa độ beacon [0,10] vào grid 10x10 ô [0,9]
      // Vấn đề chính: Beacon (10,10) cần nằm ở góc trên phải grid
      
      // Công thức mới: 
      // - Với x=0, beacon nằm ở cạnh trái của ô x=0
      // - Với x=10, beacon nằm ở cạnh phải của ô x=9
      // - Với y=0, beacon nằm ở cạnh dưới của ô y=9 (CSS)
      // - Với y=10, beacon nằm ở cạnh trên của ô y=0 (CSS)
      
      // Map x từ [0,10] thành vị trí pixel
      // x=0 → 0px, x=10 → 310px (10 ô * 31px)
      const gridWidthInPixels = 10 * totalCellSize;
      const posX = (x / 10) * gridWidthInPixels;
      
      // Map y từ [0,10] thành vị trí pixel, đảo ngược cho CSS
      // y=0 → 310px, y=10 → 0px
      const gridHeightInPixels = 10 * totalCellSize;
      const posY = (1 - y / 10) * gridHeightInPixels;
      
      // Create beacon icon
      const beaconIcon = document.createElement('div');
      beaconIcon.className = 'beacon-icon';
      beaconIcon.style.left = `${posX}px`;
      beaconIcon.style.top = `${posY}px`;
      
      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'beacon-tooltip';
      tooltip.innerHTML = `Beacon ${beacon.beacon_id}<br>X: ${x}, Y: ${y}`;
      tooltip.style.left = '25px';
      tooltip.style.top = '-45px';
      
      beaconIcon.appendChild(tooltip);
      overlay.appendChild(beaconIcon);
    });
  }

  _renderMapLegend(mapId, legendElement) {
    if (!legendElement) return;
    
    const mapData = this._mapConfigs[mapId] || [];
    const usedAreas = new Set(mapData.map(cell => cell.area || 'NULL'));
    
    legendElement.innerHTML = '';
    
    usedAreas.forEach(area => {
      const color = this._areaColors[area] || '#808080';
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <div class="legend-color" style="background-color: ${color}"></div>
        <span>${area}</span>
      `;
      legendElement.appendChild(legendItem);
    });
  }

  _onCellClick(mapId, x, y, currentArea, event) {
    event.stopPropagation();
    
    // Hide any existing selector
    this._hideAreaSelector();
    
    // Show area selector
    this._showAreaSelector(mapId, x, y, currentArea, event);
  }

  _showAreaSelector(mapId, x, y, currentArea, event) {
    const selector = this.shadowRoot.getElementById('areaSelector');
    if (!selector) return;
    
    // Clear previous content
    selector.innerHTML = '';
    
    // Add area options
    Object.entries(this._areaColors).forEach(([area, color]) => {
      const option = document.createElement('div');
      option.className = 'area-option';
      option.innerHTML = `
        <div class="area-option-color" style="background-color: ${color}"></div>
        <div class="area-option-label">${area}</div>
      `;
      
      option.addEventListener('click', () => {
        this._selectAreaForCell(mapId, x, y, area);
        this._hideAreaSelector();
      });
      
      // Highlight current area
      if (area === currentArea) {
        option.style.background = 'var(--primary-color, #2196F3)';
        option.style.borderRadius = '4px';
      }
      
      selector.appendChild(option);
    });
    
    // Position selector near the clicked cell
    const rect = event.target.getBoundingClientRect();
    const selectorRect = this.shadowRoot.host.getBoundingClientRect();
    
    selector.style.left = `${rect.right - selectorRect.left + 5}px`;
    selector.style.top = `${rect.top - selectorRect.top}px`;
    selector.style.display = 'block';
    
    // Close selector when clicking outside
    const closeHandler = (e) => {
      if (!selector.contains(e.target)) {
        this._hideAreaSelector();
        document.removeEventListener('click', closeHandler);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 10);
  }

  _hideAreaSelector() {
    const selector = this.shadowRoot.getElementById('areaSelector');
    if (selector) {
      selector.style.display = 'none';
    }
  }

  _selectAreaForCell(mapId, x, y, area) {
    // Update map data
    if (!this._mapConfigs[mapId]) {
      this._mapConfigs[mapId] = [];
    }
    
    let cell = this._mapConfigs[mapId].find(c => c.x_coordinate === x && c.y_coordinate === y);
    if (!cell) {
      cell = {
        map_id: parseInt(mapId),
        x_coordinate: x,
        y_coordinate: y,
        area: area
      };
      this._mapConfigs[mapId].push(cell);
    } else {
      cell.area = area;
    }
    
    // Update visual
    const cellElement = this.shadowRoot.querySelector(`[data-map-id="${mapId}"][data-x="${x}"][data-y="${y}"]`);
    if (cellElement) {
      const color = this._areaColors[area] || '#808080';
      cellElement.style.backgroundColor = color;
      cellElement.title = `(${x}, ${y}) - ${area}`;
    }
    
    // Update legend
    const legend = this.shadowRoot.getElementById(`mapLegend${mapId}`);
    if (legend) {
      this._renderMapLegend(mapId, legend);
    }
    
    // Show feedback (reduced duration for frequent actions)
    this._showStatus(`Cell (${x}, ${y}) → ${area}`, 'info');
    setTimeout(() => {
      const statusContainer = this.shadowRoot.getElementById('statusContainer');
      if (statusContainer && statusContainer.innerHTML.includes(`Cell (${x}, ${y})`)) {
        statusContainer.innerHTML = '';
      }
    }, 2000);
  }

  _showNewMapModal() {
    const modal = this.shadowRoot.getElementById('newMapModal');
    modal.classList.add('show');
    
    const input = this.shadowRoot.getElementById('newMapId');
    input.value = '';
    input.focus();
  }

  _hideNewMapModal() {
    const modal = this.shadowRoot.getElementById('newMapModal');
    modal.classList.remove('show');
  }

  async _createNewMap() {
    const mapIdInput = this.shadowRoot.getElementById('newMapId');
    const mapId = mapIdInput.value.trim();
    
    if (!mapId) {
      alert('Please enter a map ID');
      mapIdInput.focus();
      return;
    }
    
    // Validate map ID is a number
    if (isNaN(mapId) || parseInt(mapId) <= 0) {
      alert('Map ID must be a positive number');
      mapIdInput.focus();
      return;
    }
    
    if (this._mapList.includes(mapId)) {
      alert('Map ID already exists');
      mapIdInput.focus();
      return;
    }
    
    try {
      this._showStatus(`Creating new map ${mapId}...`, 'info');
      
      // Create empty 10x10 map with NULL areas
      const cells = [];
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          cells.push({
            map_id: parseInt(mapId),
            x_coordinate: x,
            y_coordinate: y,
            area: 'NULL'
          });
        }
      }
      
      this._mapConfigs[mapId] = cells;
      
      // Add to map list
      this._mapList.push(mapId);
      await this._updateMapListInHA();
      
      // Expand the new map
      this._expandedMaps.add(mapId);
      
      this._hideNewMapModal();
      this._showStatus(`New map ${mapId} created successfully! Remember to upload it to save on server.`, 'success');
    } catch (error) {
      console.error('Create new map error:', error);
      this._showStatus(`Failed to create new map: ${error.message}`, 'error');
    }
  }

  _editAreaColor(area, currentColor) {
    const modal = this.shadowRoot.getElementById('colorModal');
    const areaCodeInput = this.shadowRoot.getElementById('areaCode');
    const areaColorInput = this.shadowRoot.getElementById('areaColor');
    
    areaCodeInput.value = area;
    areaColorInput.value = currentColor;
    
    this._editingArea = area;
    modal.classList.add('show');
  }

  _showColorModal() {
    const modal = this.shadowRoot.getElementById('colorModal');
    const areaCodeInput = this.shadowRoot.getElementById('areaCode');
    const areaColorInput = this.shadowRoot.getElementById('areaColor');
    
    areaCodeInput.value = '';
    areaColorInput.value = '#FFFFFF';
    
    this._editingArea = null;
    modal.classList.add('show');
  }

  _hideColorModal() {
    const modal = this.shadowRoot.getElementById('colorModal');
    modal.classList.remove('show');
  }

  async _saveAreaColor() {
    const areaCodeInput = this.shadowRoot.getElementById('areaCode');
    const areaColorInput = this.shadowRoot.getElementById('areaColor');
    
    const areaCode = areaCodeInput.value.trim();
    const areaColor = areaColorInput.value;
    
    if (!areaCode) {
      alert('Please enter an area code');
      areaCodeInput.focus();
      return;
    }
    
    // Validate area code (no spaces, no special chars except underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(areaCode)) {
      alert('Area code can only contain letters, numbers, and underscores');
      areaCodeInput.focus();
      return;
    }
    
    // Validate color format
    if (!/^#[0-9A-Fa-f]{6}$/.test(areaColor)) {
      alert('Please enter a valid hex color (e.g., #FFFFFF)');
      areaColorInput.focus();
      return;
    }
    
    try {
      this._showStatus(`Saving area color for ${areaCode}...`, 'info');
      
      // Update local colors
      this._areaColors[areaCode] = areaColor;
      
      // Update in Home Assistant
      const colorString = Object.entries(this._areaColors)
        .map(([area, color]) => `${area}-${color}`)
        .join(',');
      
      await this._hass.callService('input_text', 'set_value', {
        entity_id: 'input_text.map_entity_colour',
        value: colorString
      });
      
      this._renderAreaColors();
      
      // Re-render all expanded maps to update colors
      this._expandedMaps.forEach(mapId => {
        this._renderMapGrid(mapId);
      });
      
      this._hideColorModal();
      this._showStatus(`Area color for ${areaCode} updated successfully!`, 'success');
    } catch (error) {
      console.error('Save area color error:', error);
      this._showStatus(`Failed to save area color: ${error.message}`, 'error');
    }
  }

  async _deleteAreaColor(areaCode) {
    if (areaCode === 'NULL') {
      alert('Cannot delete the NULL area');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete area "${areaCode}"? This will affect all cells using this area.`)) {
      return;
    }
    
    try {
      this._showStatus(`Deleting area ${areaCode}...`, 'info');
      
      // Remove from local colors
      delete this._areaColors[areaCode];
      
      // Update all cells using this area to NULL
      Object.values(this._mapConfigs).forEach(mapData => {
        mapData.forEach(cell => {
          if (cell.area === areaCode) {
            cell.area = 'NULL';
          }
        });
      });
      
      // Update in Home Assistant
      const colorString = Object.entries(this._areaColors)
        .map(([area, color]) => `${area}-${color}`)
        .join(',');
      
      await this._hass.callService('input_text', 'set_value', {
        entity_id: 'input_text.map_entity_colour',
        value: colorString
      });
      
      this._renderAreaColors();
      
      // Re-render all expanded maps to update colors
      this._expandedMaps.forEach(mapId => {
        this._renderMapGrid(mapId);
      });
      
      this._showStatus(`Area ${areaCode} deleted successfully!`, 'success');
    } catch (error) {
      console.error('Delete area color error:', error);
      this._showStatus(`Failed to delete area: ${error.message}`, 'error');
    }
  }

  async _updateMapListInHA() {
    try {
      const mapListString = this._mapList.join(',');
      await this._hass.callService('input_text', 'set_value', {
        entity_id: 'input_text.admin_map_list',
        value: mapListString
      });
      
      this._renderMapList();
    } catch (error) {
      console.error('Update map list error:', error);
      this._showStatus(`Failed to update map list: ${error.message}`, 'error');
    }
  }

  _showStatus(message, type = 'info') {
    const container = this.shadowRoot.getElementById('statusContainer');
    if (!container) return;
    
    container.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    setTimeout(() => {
      if (container.innerHTML.includes(message)) {
        container.innerHTML = '';
      }
    }, 5000);
  }

  _showNewBeaconModal(mapId) {
    const modal = this.shadowRoot.getElementById('newBeaconModal');
    const beaconIdInput = this.shadowRoot.getElementById('newBeaconId');
    const mapIdInput = this.shadowRoot.getElementById('newBeaconMapId');
    
    beaconIdInput.value = '';
    mapIdInput.value = mapId;
    
    this._currentMapId = mapId; // Store for later use
    modal.classList.add('show');
    beaconIdInput.focus();
  }

  _hideNewBeaconModal() {
    const modal = this.shadowRoot.getElementById('newBeaconModal');
    modal.classList.remove('show');
  }

  async _createNewBeacon() {
    const beaconIdInput = this.shadowRoot.getElementById('newBeaconId');
    const beaconId = beaconIdInput.value.trim();
    const mapId = this._currentMapId;
    
    if (!beaconId) {
      alert('Please enter a beacon ID');
      beaconIdInput.focus();
      return;
    }
    
    // Check if beacon already exists
    const existingBeacons = this._beaconConfigs[mapId] || [];
    if (existingBeacons.find(b => b.beacon_id === beaconId)) {
      alert(`Beacon ${beaconId} already exists in this map`);
      beaconIdInput.focus();
      return;
    }
    
    try {
      this._showStatus(`Creating new beacon ${beaconId} for map ${mapId}...`, 'info');
      
      // Create new beacon with default values
      const newBeaconData = {
        beacon_id: beaconId,
        beacon_mac_address: '',
        beacon_x_coordinate: 0.0,
        beacon_y_coordinate: 0.0,
        beacon_D0: -60.0,
        beacon_n: 1.8
      };
      
      const apiBaseUrl = ApiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBaseUrl}/map_beacon/${mapId}/${beaconId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBeaconData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const savedBeaconData = await response.json();
      
      // Add to local config
      if (!this._beaconConfigs[mapId]) {
        this._beaconConfigs[mapId] = [];
      }
      this._beaconConfigs[mapId].push(savedBeaconData);
      
      // Save to shared storage in Home Assistant
      this._saveBeaconToSharedStorage(mapId, savedBeaconData);
      
      // Re-render beacon list
      this._renderBeaconList(mapId);
      
      // Auto-expand the new beacon
      const key = `${mapId}-${beaconId}`;
      this._expandedBeacons.add(key);
      
      // Re-render again to show expanded state
      setTimeout(() => {
        this._renderBeaconList(mapId);
      }, 50);
      
      this._hideNewBeaconModal();
      this._showStatus(`Beacon ${beaconId} created successfully! You can now edit its details.`, 'success');
    } catch (error) {
      console.error('Create new beacon error:', error);
      this._showStatus(`Failed to create beacon ${beaconId}: ${error.message}`, 'error');
    }
  }
}

customElements.define("admin-map-config-card", AdminMapConfigCard);
