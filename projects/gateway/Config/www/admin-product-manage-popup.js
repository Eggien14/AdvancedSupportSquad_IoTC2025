// Admin Product Management Popup
// Popup chỉnh sửa/tạo mới sản phẩm cho Admin

class AdminProductManagePopup {
  constructor() {
    this.popup = null;
    this.isNewProduct = false;
    this.currentProductId = null;
    this.apiConfig = null;
    this.onSuccessCallback = null;
  }

  // Hiển thị popup cho sản phẩm mới
  showNew(apiConfig, onSuccess) {
    this.isNewProduct = true;
    this.currentProductId = null;
    this.apiConfig = apiConfig;
    this.onSuccessCallback = onSuccess;
    this._loadExistingTypes().then(() => {
      this._createPopup();
    });
  }

  // Hiển thị popup chỉnh sửa sản phẩm
  async showEdit(productId, apiConfig, onSuccess) {
    this.isNewProduct = false;
    this.currentProductId = productId;
    this.apiConfig = apiConfig;
    this.onSuccessCallback = onSuccess;

    try {
      // Load both product details and existing types
      await this._loadExistingTypes();
      
      // Fetch product details
      const apiBase = apiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/products/${productId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const product = await response.json();
      this._createPopup(product);

    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product information');
    }
  }

  // Load existing product types for recommendations
  async _loadExistingTypes() {
    try {
      const apiBase = this.apiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/products/list-all-product`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const products = await response.json();
        this.existingTypes = [...new Set(products.map(p => p.type || p.product_type).filter(Boolean))];
        console.log('Loaded existing types:', this.existingTypes);
      } else {
        this.existingTypes = ['food', 'drink', 'household', 'stationery']; // fallback
      }
    } catch (error) {
      console.error('Error loading types:', error);
      this.existingTypes = ['food', 'drink', 'household', 'stationery']; // fallback
    }
  }

  // Tạo popup HTML
  _createPopup(productData = null) {
    this._injectStyles();

    const isEdit = !this.isNewProduct && productData;
    const title = isEdit ? `Edit product #${productData.product_id}` : 'Create new product';

    const html = `
      <div class="admin-popup-overlay">
        <div class="admin-popup-container">
          <div class="admin-popup-header">
            <h2>${title}</h2>
            <button class="admin-close-btn">&times;</button>
          </div>
          
          <div class="admin-popup-content">
            <div class="admin-popup-layout">
              <!-- Product Image Section -->
              <div class="admin-image-section">
                <div class="admin-image-container">
                  <img id="productImage" class="admin-product-image" 
                       src="/local/product_pic/${isEdit ? productData.product_id : 'empty-cart'}.jpg" 
                       alt="Product Image"
                       onerror="this.src='/local/product_pic/empty-cart.jpg'">
                </div>
                <div class="admin-image-note">
                  Images will be uploaded from: /local/product_pic/{product_id}.jpg
                </div>
              </div>

              <!-- Form Section -->
              <div class="admin-form-section">
                <form class="admin-product-form" id="productForm">
                  ${this.isNewProduct ? `
                  <!-- Product ID for new product -->
                  <div class="form-section">
                    <h3>🆔 New product ID</h3>
                    <div class="form-group required">
                      <label>Product ID *</label>
                      <input type="number" name="product_id" id="product_id" min="1" 
                             placeholder="Enter a new product ID..." required>
                    </div>
                  </div>
                  ` : ''}

                  <!-- Required fields section -->
                  <div class="form-section">
                    <h3>📋 Required information</h3>
                    
                    <div class="form-row">
                      <div class="form-group required">
                        <label>Product Name *</label>
                        <input type="text" name="product_name" id="product_name" 
                               value="${this._escape(productData?.name || '')}" required>
                      </div>
                      
                      <div class="form-group required">
                        <label>Product Type *</label>
                        <div class="type-input-container">
                          <input type="text" name="product_type" id="product_type" 
                                 value="${this._escape(productData?.type || '')}" 
                                 placeholder="Enter product type..." required>
                          <div class="type-recommendations" id="typeRecommendations"></div>
                        </div>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-group required">
                        <label>Price (VND) *</label>
                        <input type="number" name="price" id="price" step="0.01" min="0"
                               value="${productData?.price || ''}" required>
                      </div>
                      
                      <div class="form-group required">
                        <label>Quantity *</label>
                        <input type="number" name="quantity" id="quantity" step="0.001" min="0"
                               value="${productData?.quantity || ''}" required>
                      </div>
                    </div>
                  </div>

              <!-- Optional fields section -->
              <div class="form-section">
                <h3>📝 Optional information</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" name="weight_kg" id="weight_kg" step="0.001" min="0"
                           value="${productData?.weight_kg || ''}">
                  </div>
                  
                  <div class="form-group">
                    <label>Area</label>
                    <input type="text" name="area" id="area" 
                           value="${this._escape(productData?.area || '')}">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Manufacturer</label>
                    <input type="text" name="manufacturer" id="manufacturer" 
                           value="${this._escape(productData?.manufacturer || '')}">
                  </div>
                  
                  <div class="form-group">
                    <label>Origin</label>
                    <input type="text" name="origin" id="origin" 
                           value="${this._escape(productData?.origin || '')}">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Expiration Date</label>
                    <input type="date" name="expiry_or_mfg_date" id="expiry_or_mfg_date" 
                           value="${productData?.expiry_or_mfg_date || ''}">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Information 1</label>
                    <input type="text" name="info1" id="info1" 
                           value="${this._escape(productData?.info1 || '')}"
                           placeholder="Example: Weight-75g">
                  </div>
                  
                  <div class="form-group">
                    <label>Information 2</label>
                    <input type="text" name="info2" id="info2" 
                           value="${this._escape(productData?.info2 || '')}"
                           placeholder="Example: Style-Stir-fried noodles">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Detail 1</label>
                    <input type="text" name="detail1" id="detail1" 
                           value="${this._escape(productData?.detail1 || '')}"
                           placeholder="Example: Favor-Sweet and sour shrimp with chewy noodles">
                  </div>
                  
                  <div class="form-group">
                    <label>Detail 2</label>
                    <input type="text" name="detail2" id="detail2" 
                           value="${this._escape(productData?.detail2 || '')}"
                           placeholder="Example: How to Use: Drain water, then mix with sauce">
                  </div>
                </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="admin-popup-footer">
            <button type="button" class="admin-btn admin-btn-secondary" id="cancelBtn">
              Cancel
            </button>
            <button type="button" class="admin-btn admin-btn-primary" id="saveBtn" disabled>
              ${isEdit ? 'Update product' : 'Create product'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Add to DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    this.popup = tempDiv.firstElementChild;
    document.body.appendChild(this.popup);

    // Add event listeners
    this._addEventListeners();
    this._validateForm(); // Initial validation
  }

  // Inject CSS styles
  _injectStyles() {
    if (document.getElementById('admin-product-popup-styles')) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'admin-product-popup-styles';
    styleElement.textContent = `
      .admin-popup-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.8) !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        z-index: 10000 !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      }

      .admin-popup-container {
        background: var(--card-background-color, #1e1e1e) !important;
        border: 1px solid var(--divider-color, #444) !important;
        border-radius: 12px !important;
        max-width: 800px !important;
        width: 100% !important;
        max-height: 90vh !important;
        overflow: hidden !important;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .admin-popup-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 20px !important;
        border-bottom: 1px solid var(--divider-color, #444) !important;
        color: var(--primary-text-color, #eaeaea) !important;
        flex-shrink: 0 !important;
      }

      .admin-popup-header h2 {
        margin: 0 !important;
        font-size: 20px !important;
        font-weight: 600 !important;
        color: var(--primary-color, #2196F3) !important;
      }

      .admin-close-btn {
        background: none !important;
        border: none !important;
        font-size: 24px !important;
        cursor: pointer !important;
        color: var(--secondary-text-color, #9aa0a6) !important;
        padding: 0 !important;
        width: 30px !important;
        height: 30px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 6px !important;
      }

      .admin-close-btn:hover {
        background: var(--divider-color, #444) !important;
        color: var(--primary-text-color, #eaeaea) !important;
      }

      .admin-popup-content {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 20px !important;
        color: var(--primary-text-color, #eaeaea) !important;
      }

      .admin-popup-layout {
        display: grid !important;
        grid-template-columns: 200px 1fr !important;
        gap: 20px !important;
      }

      .admin-image-section {
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
      }

      .admin-image-container {
        position: relative !important;
        width: 200px !important;
        height: 200px !important;
        border: 2px dashed var(--divider-color, #444) !important;
        border-radius: 8px !important;
        overflow: hidden !important;
      }

      .admin-product-image {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        background: var(--secondary-background-color, #2d2d2d) !important;
      }

      .admin-image-note {
        font-size: 12px !important;
        color: var(--secondary-text-color, #9aa0a6) !important;
        text-align: center !important;
        line-height: 1.3 !important;
      }

      .admin-form-section {
        flex: 1 !important;
        min-width: 0 !important;
      }

      .type-input-container {
        position: relative !important;
      }

      .type-recommendations {
        position: absolute !important;
        top: 100% !important;
        left: 0 !important;
        right: 0 !important;
        background: var(--card-background-color, #1e1e1e) !important;
        border: 1px solid var(--divider-color, #444) !important;
        border-top: none !important;
        border-radius: 0 0 6px 6px !important;
        max-height: 120px !important;
        overflow-y: auto !important;
        z-index: 1000 !important;
        display: none !important;
      }

      .type-recommendation-item {
        padding: 8px 12px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        border-bottom: 1px solid var(--divider-color, #444) !important;
        transition: background 0.2s ease !important;
      }

      .type-recommendation-item:hover {
        background: var(--primary-color-alpha, rgba(33, 150, 243, 0.1)) !important;
      }

      .type-recommendation-item:last-child {
        border-bottom: none !important;
      }

      .form-section {
        margin-bottom: 24px !important;
        border: 1px solid var(--divider-color, #444) !important;
        border-radius: 8px !important;
        padding: 16px !important;
      }

      .form-section h3 {
        margin: 0 0 16px 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--primary-color, #2196F3) !important;
      }

      .form-row {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 16px !important;
        margin-bottom: 16px !important;
      }

      .form-row:last-child {
        margin-bottom: 0 !important;
      }

      .form-group {
        display: flex !important;
        flex-direction: column !important;
      }

      .form-group.required {
        background: rgba(255, 193, 7, 0.1) !important;
        border: 1px solid rgba(255, 193, 7, 0.3) !important;
        border-radius: 6px !important;
        padding: 12px !important;
      }

      .form-group label {
        font-size: 14px !important;
        font-weight: 500 !important;
        margin-bottom: 6px !important;
        color: var(--primary-text-color, #eaeaea) !important;
      }

      .form-group.required label {
        color: var(--warning-color, #ff9800) !important;
      }

      .form-group input,
      .form-group select {
        padding: 10px 12px !important;
        border: 1px solid var(--divider-color, #444) !important;
        border-radius: 6px !important;
        background: var(--secondary-background-color, #2d2d2d) !important;
        color: var(--primary-text-color, #eaeaea) !important;
        font-size: 14px !important;
      }

      .form-group.required input,
      .form-group.required select {
        border-color: var(--warning-color, #ff9800) !important;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none !important;
        border-color: var(--primary-color, #2196F3) !important;
      }

      .form-group input::placeholder {
        color: var(--secondary-text-color, #9aa0a6) !important;
      }

      .admin-popup-footer {
        display: flex !important;
        justify-content: flex-end !important;
        gap: 12px !important;
        padding: 20px !important;
        border-top: 1px solid var(--divider-color, #444) !important;
        flex-shrink: 0 !important;
      }

      .admin-btn {
        padding: 10px 20px !important;
        border: none !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .admin-btn-secondary {
        background: var(--secondary-color, #666) !important;
        color: white !important;
      }

      .admin-btn-secondary:hover {
        background: var(--secondary-color-dark, #555) !important;
      }

      .admin-btn-primary {
        background: var(--primary-color, #2196F3) !important;
        color: white !important;
      }

      .admin-btn-primary:hover:not(:disabled) {
        background: var(--primary-color-dark, #1976D2) !important;
      }

      .admin-btn:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }

      @media (max-width: 768px) {
        .admin-popup-overlay {
          padding: 12px !important;
        }

        .admin-popup-container {
          max-width: none !important;
        }

        .admin-popup-layout {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }

        .admin-image-section {
          order: 2 !important;
        }

        .admin-form-section {
          order: 1 !important;
        }

        .admin-image-container {
          width: 150px !important;
          height: 150px !important;
          margin: 0 auto !important;
        }

        .form-row {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }

        .admin-popup-header,
        .admin-popup-content,
        .admin-popup-footer {
          padding: 16px !important;
        }
      }
    `;

    document.head.appendChild(styleElement);
  }

  // Add event listeners
  _addEventListeners() {
    if (!this.popup) return;

    // Close button
    const closeBtn = this.popup.querySelector('.admin-close-btn');
    const cancelBtn = this.popup.querySelector('#cancelBtn');
    const saveBtn = this.popup.querySelector('#saveBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveProduct());
    }

    // Click overlay to close
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.hide();
      }
    });

    // Prevent clicks inside container from closing
    const container = this.popup.querySelector('.admin-popup-container');
    if (container) {
      container.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // ESC key to close
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    this.keydownHandler = handleKeydown;

    // Form validation on input
    const form = this.popup.querySelector('#productForm');
    const requiredInputs = form.querySelectorAll('input[required], select[required]');
    
    requiredInputs.forEach(input => {
      input.addEventListener('input', () => this._validateForm());
      input.addEventListener('change', () => this._validateForm());
    });

    // Type input with recommendations
    const typeInput = this.popup.querySelector('#product_type');
    const typeRecommendations = this.popup.querySelector('#typeRecommendations');
    
    if (typeInput && typeRecommendations) {
      typeInput.addEventListener('input', (e) => {
        this._showTypeRecommendations(e.target.value, typeRecommendations);
      });
      
      typeInput.addEventListener('focus', (e) => {
        this._showTypeRecommendations(e.target.value, typeRecommendations);
      });
      
      // Hide recommendations when clicking outside
      document.addEventListener('click', (e) => {
        if (!typeInput.contains(e.target) && !typeRecommendations.contains(e.target)) {
          typeRecommendations.style.display = 'none';
        }
      });
    }

    // Product ID input for new products (update image preview)
    if (this.isNewProduct) {
      const productIdInput = this.popup.querySelector('#product_id');
      const productImage = this.popup.querySelector('#productImage');
      
      if (productIdInput && productImage) {
        productIdInput.addEventListener('input', (e) => {
          const productId = e.target.value.trim();
          if (productId) {
            productImage.src = `/local/product_pic/${productId}.jpg`;
          } else {
            productImage.src = '/local/product_pic/empty-cart.jpg';
          }
        });
      }
    }
  }

  // Show type recommendations
  _showTypeRecommendations(input, recommendationsEl) {
    if (!this.existingTypes || !input) {
      recommendationsEl.style.display = 'none';
      return;
    }

    const filtered = this.existingTypes.filter(type => 
      type.toLowerCase().includes(input.toLowerCase())
    );

    if (filtered.length === 0) {
      recommendationsEl.style.display = 'none';
      return;
    }

    const html = filtered.map(type => 
      `<div class="type-recommendation-item" data-type="${this._escape(type)}">${this._escape(type)}</div>`
    ).join('');

    recommendationsEl.innerHTML = html;
    recommendationsEl.style.display = 'block';

    // Add click handlers
    recommendationsEl.querySelectorAll('.type-recommendation-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const selectedType = e.target.getAttribute('data-type');
        const typeInput = this.popup.querySelector('#product_type');
        typeInput.value = selectedType;
        recommendationsEl.style.display = 'none';
        this._validateForm();
      });
    });
  }

  // Validate form and enable/disable save button
  _validateForm() {
    const form = this.popup.querySelector('#productForm');
    const saveBtn = this.popup.querySelector('#saveBtn');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
      }
    });

    saveBtn.disabled = !isValid;
  }

  // Save product
  async _saveProduct() {
    const form = this.popup.querySelector('#productForm');
    const saveBtn = this.popup.querySelector('#saveBtn');
    
    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Đang lưu...';

      // Collect form data
      const formData = new FormData(form);
      const productData = {};

      // Process all fields
      for (let [key, value] of formData.entries()) {
        if (value.trim() === '') {
          productData[key] = null;
        } else if (key === 'price' || key === 'quantity' || key === 'weight_kg') {
          productData[key] = parseFloat(value) || 0;
        } else if (key === 'product_id') {
          productData[key] = parseInt(value) || null;
        } else {
          productData[key] = value.trim();
        }
      }

      console.log('Saving product data:', productData);

      // Determine product ID for API call
      let productId;
      if (this.isNewProduct) {
        // For new products, use the product_id from form
        productId = productData.product_id;
        if (!productId) {
          throw new Error('Product ID is required for new products');
        }
        // Remove product_id from data since it's in the URL
        delete productData.product_id;
      } else {
        // For existing products, use current ID
        productId = this.currentProductId;
      }
      
      // Call API
      const apiBase = this.apiConfig.getApiBaseAuto();
      const response = await fetch(`${apiBase}/products/update-product/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Product saved:', result);

      // Success
      const action = this.isNewProduct ? 'create' : 'update';
      alert(`✅ Product ${action} successfully!\n\nID: ${result.product_id}\nTên: ${result.name}`);

      // Callback
      if (this.onSuccessCallback) {
        this.onSuccessCallback(result);
      }

      this.hide();

    } catch (error) {
      console.error('Error saving product:', error);
      const action = this.isNewProduct ? 'create' : 'update';
      alert(`❌ Failed ${action} product:\n${error.message}`);
    } finally {
      const action = this.isNewProduct ? 'Create product' : 'Update product';
      saveBtn.textContent = action;
      this._validateForm(); // Re-enable if valid
    }
  }

  // Hide popup
  hide() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }

    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  // Escape HTML
  _escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Export
window.AdminProductManagePopup = AdminProductManagePopup;
export default AdminProductManagePopup;