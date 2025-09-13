// General Product Detail Popup
// Hiển thị chi tiết thông tin sản phẩm trong popup

class GeneralProductDetailPopup {
  constructor() {
    this.popup = null;
    this.overlay = null;
  }

  // Parse info/detail fields từ format "Tiêu đề-Nội dung"
  _parseInfoField(fieldValue) {
    if (!fieldValue || fieldValue.trim() === '') return null;
    
    const parts = fieldValue.split('-');
    if (parts.length >= 2) {
      return {
        title: parts[0].trim(),
        content: parts.slice(1).join('-').trim()
      };
    }
    // Nếu không có dấu "-", coi như là content không có title
    return {
      title: '',
      content: fieldValue.trim()
    };
  }

  // Format giá tiền VND
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

  // Tạo HTML cho popup
  _createPopupHTML(product) {
    const img = `/local/product_pic/${product.product_id}.jpg`;
    const name = this._escape(product.name || 'Sản phẩm');
    const price = this._formatPrice(product.price || 0);
    const quantity = product.quantity != null ? product.quantity : 'N/A';
    const weight = product.weight_kg ? `${product.weight_kg} kg` : 'N/A';
    const type = this._escape(product.type || 'N/A');
    const area = this._escape(product.area || 'N/A');
    const manufacturer = this._escape(product.manufacturer || 'N/A');
    const origin = this._escape(product.origin || 'N/A');
    const expiryDate = product.expiry_or_mfg_date || 'N/A';

    // Parse info và detail fields
    const info1 = this._parseInfoField(product.info1);
    const info2 = this._parseInfoField(product.info2);
    const detail1 = this._parseInfoField(product.detail1);
    const detail2 = this._parseInfoField(product.detail2);

    // Luôn để text mặc định, để _updateLocationButtonText() xử lý sau
    const locationButtonText = '📍 View location';

    return `
      <div class="popup-overlay">
        <div class="popup-container">
          <div class="popup-header">
            <h2>Product detail</h2>
            <button class="close-btn">&times;</button>
          </div>
          
          <div class="popup-content">
            <div class="product-image-section">
              <img src="${img}" alt="${name}" class="product-image" 
                   onerror="this.src='/local/product_pic/empty-cart.jpg'">
              
              <!-- Nút action dưới hình ảnh -->
              <div class="action-buttons">
                <button class="action-btn location-btn" id="locationBtn">
                  ${locationButtonText}
                </button>
                <button class="action-btn cart-btn">
                  🛒 Add to cart
                </button>
              </div>
            </div>
            
            <div class="product-info-section">
              <h3 class="product-name">${name}</h3>
              <div class="product-type-badge">[${type}]</div>
              
              <div class="info-grid">
                <div class="info-row">
                  <label>Price:</label>
                  <span class="price">${price}</span>
                </div>
                <div class="info-row">
                  <label>Quantity:</label>
                  <span>${quantity}</span>
                </div>
                ${product.weight_kg && product.weight_kg > 0 ? `
                <div class="info-row">
                  <label>Weight:</label>
                  <span>${weight}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <label>Area:</label>
                  <span>${area}</span>
                </div>
                <div class="info-row">
                  <label>Manufacturer:</label>
                  <span>${manufacturer}</span>
                </div>
                <div class="info-row">
                  <label>Origin:</label>
                  <span>${origin}</span>
                </div>
                <div class="info-row">
                  <label>Expiration Date:</label>
                  <span>${expiryDate}</span>
                </div>
              </div>

              <!-- Thông tin bổ sung -->
              <div class="additional-info">
                ${info1 && info1.title ? `
                  <div class="info-item">
                    <strong>${this._escape(info1.title)}:</strong>
                    <span>${this._escape(info1.content)}</span>
                  </div>
                ` : info1 && info1.content ? `
                  <div class="info-item">
                    <span>${this._escape(info1.content)}</span>
                  </div>
                ` : ''}
                
                ${info2 && info2.title ? `
                  <div class="info-item">
                    <strong>${this._escape(info2.title)}:</strong>
                    <span>${this._escape(info2.content)}</span>
                  </div>
                ` : info2 && info2.content ? `
                  <div class="info-item">
                    <span>${this._escape(info2.content)}</span>
                  </div>
                ` : ''}
                
                ${detail1 && detail1.title ? `
                  <div class="info-item">
                    <strong>${this._escape(detail1.title)}:</strong>
                    <span>${this._escape(detail1.content)}</span>
                  </div>
                ` : detail1 && detail1.content ? `
                  <div class="info-item">
                    <span>${this._escape(detail1.content)}</span>
                  </div>
                ` : ''}
                
                ${detail2 && detail2.title ? `
                  <div class="info-item">
                    <strong>${this._escape(detail2.title)}:</strong>
                    <span>${this._escape(detail2.content)}</span>
                  </div>
                ` : detail2 && detail2.content ? `
                  <div class="info-item">
                    <span>${this._escape(detail2.content)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Inject CSS styles vào head
  _injectStyles() {
    // Kiểm tra xem styles đã được thêm chưa
    if (document.getElementById('product-detail-popup-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'product-detail-popup-styles';
    styleElement.textContent = `
        .popup-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0, 0, 0, 0.7) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          z-index: 10000 !important;
          padding: 20px !important;
          box-sizing: border-box !important;
        }

        .popup-container {
          background: var(--card-background-color, #1e1e1e) !important;
          border: 1px solid var(--divider-color, #444) !important;
          border-radius: 12px !important;
          max-width: 600px !important;
          width: 100% !important;
          max-height: 90vh !important;
          overflow: auto !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
        }

        .popup-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 20px !important;
          border-bottom: 1px solid var(--divider-color, #444) !important;
          color: var(--primary-text-color, #eaeaea) !important;
        }

        .popup-header h2 {
          margin: 0 !important;
          font-size: 20px !important;
          font-weight: 600 !important;
        }

        .close-btn {
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

        .close-btn:hover {
          background: var(--divider-color, #444) !important;
          color: var(--primary-text-color, #eaeaea) !important;
        }

        .popup-content {
          padding: 20px !important;
          display: grid !important;
          grid-template-columns: 150px 1fr !important;
          gap: 20px !important;
          color: var(--primary-text-color, #eaeaea) !important;
        }

        .product-image {
          width: 150px !important;
          height: 150px !important;
          object-fit: cover !important;
          border-radius: 8px !important;
          background: #333 !important;
          margin-bottom: 12px !important;
        }

        .action-buttons {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
          width: 150px !important;
        }

        .action-btn {
          padding: 8px 12px !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          white-space: nowrap !important;
          text-align: center !important;
        }

        .location-btn {
          background: var(--primary-color, #2196F3) !important;
          color: white !important;
        }

        .location-btn:hover {
          background: var(--primary-color-dark, #1976D2) !important;
          transform: translateY(-1px) !important;
        }

        .cart-btn {
          background: var(--success-color, #4CAF50) !important;
          color: white !important;
        }

        .cart-btn:hover {
          background: var(--success-color-dark, #45a049) !important;
          transform: translateY(-1px) !important;
        }

        .cart-btn:disabled {
          background: #9e9e9e !important;
          color: white !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        .cart-btn:disabled:hover {
          background: #9e9e9e !important;
          transform: none !important;
        }

        .product-name {
          margin: 0 0 8px 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
        }

        .product-type-badge {
          display: inline-block !important;
          background: var(--primary-color, #2196F3) !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
          margin-bottom: 16px !important;
        }

        .info-grid {
          display: grid !important;
          gap: 8px !important;
          margin-bottom: 20px !important;
        }

        .info-row {
          display: grid !important;
          grid-template-columns: 120px 1fr !important;
          gap: 8px !important;
          align-items: center !important;
        }

        .info-row label {
          font-weight: 500 !important;
          color: var(--secondary-text-color, #9aa0a6) !important;
        }

        .price {
          font-weight: 600 !important;
          color: var(--primary-color, #2196F3) !important;
        }

        .additional-info {
          border-top: 1px solid var(--divider-color, #444) !important;
          padding-top: 16px !important;
        }

        .info-item {
          margin-bottom: 12px !important;
          line-height: 1.4 !important;
        }

        .info-item strong {
          color: var(--primary-color, #2196F3) !important;
          display: inline-block !important;
          min-width: 100px !important;
        }

        @media (max-width: 600px) {
          .popup-content {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          
          .product-image {
            justify-self: center !important;
          }
          
          .info-row {
            grid-template-columns: 1fr !important;
            text-align: left !important;
          }
        }
    `;
    
    document.head.appendChild(styleElement);
  }

  // Tạo CSS styles (deprecated - giữ để tương thích)
  _createStyles() {
    return ''; // Không cần nữa, sử dụng _injectStyles thay thế
  }

  // Hiển thị popup với product ID
  async show(productId, apiConfig) {
    try {
      // Ẩn popup cũ nếu có
      this.hide();
      
      // Lấy chi tiết sản phẩm từ API
      const apiBase = apiConfig.getApiBaseAuto();
      const url = `${apiBase}/products/${productId}`;
      
      console.log('Fetching product detail:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const product = await response.json();
      console.log('Product detail received:', product);

      // Lưu thông tin sản phẩm hiện tại
      this._setCurrentProduct(product);

      // Tạo container cho popup
      const popupContainer = document.createElement('div');
      popupContainer.innerHTML = this._createPopupHTML(product);
      
      // Thêm styles vào head nếu chưa có
      this._injectStyles();
      
      // Lấy popup element và thêm vào body
      this.popup = popupContainer.firstElementChild;
      document.body.appendChild(this.popup);
      
      console.log('Popup added to DOM:', this.popup);

      // Thêm event listeners
      this._addEventListeners();
      
      // Force visibility
      this.popup.style.display = 'flex';

      // Cập nhật text button sau khi popup đã được tạo và hiển thị
      // Thử nhiều lần để đảm bảo map card đã được khởi tạo
      setTimeout(() => {
        this._updateLocationButtonText();
      }, 100);
      
      setTimeout(() => {
        this._updateLocationButtonText();
      }, 300);
      
      setTimeout(() => {
        this._updateLocationButtonText();
      }, 500);

    } catch (error) {
      console.error('Error showing product detail:', error);
      alert('Không thể tải thông tin sản phẩm');
    }
  }

  // Thêm event listeners
  _addEventListeners() {
    if (!this.popup) return;

    // Close button
    const closeBtn = this.popup.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide();
      });
    }

    // Action buttons (tạm thời để trống)
    const locationBtn = this.popup.querySelector('.location-btn');
    const cartBtn = this.popup.querySelector('.cart-btn');
    
    if (locationBtn) {
      locationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleLocationButtonClick();
      });
    }
    
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleCartButtonClick();
      });
    }

    // Click overlay to close (chỉ khi click vào overlay, không phải container)
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.hide();
      }
    });

    // Ngăn không cho click vào container đóng popup
    const container = this.popup.querySelector('.popup-container');
    if (container) {
      container.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // ESC key to close
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Lưu reference để có thể remove sau này
    this.keydownHandler = handleKeydown;
  }

  // Ẩn popup
  hide() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
    
    // Remove keydown handler nếu có
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }

  // Xử lý khi click nút location - chỉ emit event
  _handleLocationButtonClick() {
    if (!this.currentProduct) {
      console.log('No current product data');
      return;
    }

    // Emit custom event để map card xử lý
    const event = new CustomEvent('product-location-request', {
      detail: {
        productId: this.currentProduct.product_id,
        area: this.currentProduct.area,
        name: this.currentProduct.name
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    // KHÔNG đóng popup ngay lập tức - để map card cập nhật button text trước
    // this.hide(); // Xóa dòng này
  }

  // Xử lý khi click nút "Thêm vào rọ hàng"
  async _handleCartButtonClick() {
    if (!this.currentProduct) {
      console.error('No current product for cart');
      return;
    }

    const cartBtn = this.popup.querySelector('.cart-btn');
    if (!cartBtn) return;

    // Disable button và hiển thị loading
    const originalText = cartBtn.textContent;
    cartBtn.disabled = true;
    cartBtn.textContent = '⏳ Adding...';

    try {
      await this._addToCart(this.currentProduct);
      
      // Hiển thị thành công
      cartBtn.textContent = '✅ Added!';
      cartBtn.style.backgroundColor = '#28a745';
      
      // Reset button sau 2 giây
      setTimeout(() => {
        cartBtn.disabled = false;
        cartBtn.textContent = originalText;
        cartBtn.style.backgroundColor = '';
      }, 2000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Hiển thị lỗi
      cartBtn.textContent = '❌ Fail!';
      cartBtn.style.backgroundColor = '#dc3545';
      
      // Reset button sau 2 giây
      setTimeout(() => {
        cartBtn.disabled = false;
        cartBtn.textContent = originalText;
        cartBtn.style.backgroundColor = '';
      }, 2000);
    }
  }

  // API call để thêm sản phẩm vào cart
  async _addToCart(product) {
    const cartId = 142; // Mặc định cart_id = 142
    
    // Xác định delta dựa trên weight
    const delta = (product.weight_kg && product.weight_kg > 0) ? 0.01 : 1;
    
    const requestBody = {
      mode: "delta",
      changes: [
        {
          product_id: product.product_id,
          delta: delta
        }
      ]
    };

    console.log('Adding to cart:', requestBody);

    // Sử dụng ApiConfig để lấy base URL
    const apiBase = window.ApiConfig ? window.ApiConfig.getApiBaseAuto() : 'http://192.168.108.45:8136';
    const response = await fetch(`${apiBase}/cart_inventory/${cartId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    console.log('Cart update result:', result);
    return result;
  }

  // Lưu thông tin sản phẩm hiện tại
  _setCurrentProduct(product) {
    this.currentProduct = product;
  }

  // Kiểm tra xem sản phẩm đã được pin chưa
  _isProductPinned(productId) {
    console.log('Checking if product is pinned:', productId);
    
    // Thử tìm map card với nhiều cách khác nhau
    let mapCards = document.querySelectorAll('general-map-card');
    console.log('Found map cards (direct):', mapCards.length);
    
    // Nếu không tìm thấy, thử tìm trong Shadow DOM của các component khác
    if (mapCards.length === 0) {
      const allElements = document.querySelectorAll('*');
      for (let element of allElements) {
        if (element.shadowRoot) {
          const shadowMapCards = element.shadowRoot.querySelectorAll('general-map-card');
          if (shadowMapCards.length > 0) {
            mapCards = shadowMapCards;
            console.log('Found map cards in shadow DOM:', mapCards.length);
            break;
          }
        }
      }
    }
    
    // Nếu vẫn không có, thử truy cập trực tiếp qua global variable
    if (mapCards.length === 0) {
      // Kiểm tra xem có global map card instance không
      if (window.currentMapCard && window.currentMapCard.pinnedProducts) {
        console.log('Using global map card instance');
        const isPinned = window.currentMapCard.pinnedProducts.has(productId);
        console.log('Product', productId, isPinned ? 'is pinned!' : 'is NOT pinned');
        return isPinned;
      }
    }
    
    // Kiểm tra từng map card tìm được
    for (let mapCard of mapCards) {
      console.log('Checking map card:', mapCard, 'has pinnedProducts:', !!mapCard.pinnedProducts);
      if (mapCard.pinnedProducts) {
        console.log('pinnedProducts size:', mapCard.pinnedProducts.size);
        console.log('pinnedProducts keys:', Array.from(mapCard.pinnedProducts.keys()));
        if (mapCard.pinnedProducts.has(productId)) {
          console.log('Product', productId, 'is pinned!');
          return true;
        }
      }
    }
    
    console.log('Product', productId, 'is NOT pinned');
    return false;
  }

  // Cập nhật text nút location dựa trên trạng thái pin
  updateLocationButtonText(productId, isPinned) {
    console.log('updateLocationButtonText called:', productId, isPinned);
    const locationBtn = this.popup && this.popup.querySelector('#locationBtn');
    console.log('Found location button:', locationBtn);
    if (locationBtn && this.currentProduct && this.currentProduct.product_id === productId) {
      const newText = isPinned ? '📍 Hide location' : '📍 View location';
      console.log('Updating button text to:', newText);
      locationBtn.textContent = newText;
    }
  }

  // Cập nhật text button dựa trên trạng thái hiện tại (dùng khi mở popup)
  _updateLocationButtonText() {
    if (!this.currentProduct) return;
    
    const isPinned = this._isProductPinned(this.currentProduct.product_id);
    console.log('_updateLocationButtonText - Product:', this.currentProduct.product_id, 'isPinned:', isPinned);
    
    const locationBtn = this.popup && this.popup.querySelector('#locationBtn');
    if (locationBtn) {
      const newText = isPinned ? '📍 Hide location' : '📍 View location';
      console.log('Setting initial button text to:', newText);
      locationBtn.textContent = newText;
      
      // Đảm bảo UI được cập nhật
      locationBtn.style.opacity = '0.8';
      setTimeout(() => {
        locationBtn.style.opacity = '1';
      }, 50);
    } else {
      console.log('Location button not found, will retry...');
    }
  }
}

// Tạo instance toàn cục
window.globalProductPopup = new GeneralProductDetailPopup();

// Export cho sử dụng
window.GeneralProductDetailPopup = GeneralProductDetailPopup;
export default GeneralProductDetailPopup;
