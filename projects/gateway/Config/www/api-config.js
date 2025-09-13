/**
 * Simple API Configuration for IoTC25
 * Đọc URL HTTP/HTTPS từ entities của Home Assistant
 * 
 * Cách sử dụng đơn giản:
 * const apiBase = ApiConfig.getApiBaseAuto();
 * fetch(`${apiBase}/products?name=coca&limit=50`);
 */
class ApiConfig {
  /**
   * Get HTTP API URL from HA entity
   * @returns {string} HTTP API URL
   */
  static getHttpApiBase() {
    const entity = window.hass?.states?.['input_text.api_base_http'];
    return entity?.state || 'http://192.168.0.101:8136';
  }

  /**
   * Get HTTPS API URL from HA entity
   * @returns {string} HTTPS API URL
   */
  static getHttpsApiBase() {
    const entity = window.hass?.states?.['input_text.api_base_https'];
    return entity?.state || 'https://192.168.0.101:8118';
  }

  /**
   * Auto-detect API URL dựa trên protocol của trang hiện tại
   * Nếu trang dùng HTTPS → dùng HTTPS API
   * Nếu trang dùng HTTP → dùng HTTP API
   * @returns {string} URL API phù hợp
   */
  static getApiBaseAuto() {
    const isHttps = window.location.protocol === 'https:';
    return isHttps ? this.getHttpsApiBase() : this.getHttpApiBase();
  }
}

// Make it available globally and as export
window.ApiConfig = ApiConfig;
export default ApiConfig;