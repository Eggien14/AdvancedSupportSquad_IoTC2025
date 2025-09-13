# nginx Reverse Proxy - HTTPS Support

## Mục đích
Thêm HTTPS endpoint để giải quyết Mixed Content error khi website HTTPS gọi API HTTP.

## Endpoints
- **HTTP** (như cũ): `http://192.168.108.45:8136`
- **HTTPS** (mới): `https://192.168.108.45:8118`

## Cách dùng

### 1. Thay đổi IP
Sửa 1 chỗ trong `docker-compose.yaml`:
```yaml
- SERVER_IP=${SERVER_IP:-192.168.108.45}  # IP mới ở đây
```

### 2. Chạy
```bash
docker-compose up -d
```

## Cấu hình thiết bị

### Home Assistant
```yaml
# Giữ nguyên (recommended)
input_text:
  api_base:
    initial: "http://192.168.108.45:8136"

# Hoặc cả 2
input_text:
  api_base_http:
    initial: "http://192.168.108.45:8136"
  api_base_https:
    initial: "https://192.168.108.45:8118"
```

### JavaScript
```javascript
// HTTP - bị block nếu website HTTPS
const API_BASE = "http://192.168.108.45:8136";

// HTTPS - cho website HTTPS  
const API_BASE = "https://192.168.108.45:8118";

// Gọi API (GET/POST đều ok)
fetch(`${API_BASE}/products?name=keo&limit=50`)
```

## GET và POST

✅ **Đã test**: GET requests hoạt động cả HTTP và HTTPS
✅ **POST support**: CORS headers đã được fix
✅ **Không thay đổi**: FastAPI server vẫn nguyên bản

### Test POST:
```bash
# HTTP
curl -X POST "http://192.168.108.45:8136/cart/add" -d '{"product_id": 1}'

# HTTPS
curl -X POST "https://192.168.108.45:8118/cart/add" -d '{"product_id": 1}' -k
```

## Ảnh hưởng nginx container

### ✅ Không ảnh hưởng:
- FastAPI server: Chạy nguyên bản
- Database: Không đổi
- API logic: Hoàn toàn giống nhau

### 📊 Tác động:
- Memory: +50MB (nginx nhẹ)
- Latency: +1-2ms (thêm 1 hop)
- Security: SSL termination tại nginx

## SSL Certificate
- **Tự động tạo**: Self-signed certificate
- **Browser warning**: Bình thường, click "Proceed"
- **Valid**: 365 ngày

## API Documentation
Chi tiết xem: `/services/api/README.MD` và `api_endpoint.txt`
docker-compose up --build -d
```

### 3. Verify
```bash
# Load environment variables
source .env

# Test HTTP (existing)
curl http://${SERVER_IP}:${HTTP_PORT}/healthz

# Test HTTPS (new)
curl -k https://${SERVER_IP}:${HTTPS_PORT}/healthz

# Test nginx health
curl http://${SERVER_IP}:${HTTP_PORT}/nginx-health
curl -k https://${SERVER_IP}:${HTTPS_PORT}/nginx-health

# Test server info
curl http://${SERVER_IP}:${HTTP_PORT}/server-info
```

## Frontend Usage

### Option 1: Use ApiConfig Utility (Recommended)
```javascript
// Include the utility
<script src="frontend/api-config.js"></script>

// Auto-detect API base URL
const apiConfig = new ApiConfig();
const API_BASE = apiConfig.getApiBaseAuto();

// Specific protocol
const API_HTTP = apiConfig.getHttpApiBase();
const API_HTTPS = apiConfig.getHttpsApiBase();

// Example API call
fetch(`${API_BASE}/products?name=ke&limit=50`)
    .then(response => response.json())
    .then(data => console.log(data));
```

### Option 2: Manual Detection
```javascript
// Read configuration from environment or detect automatically
const SERVER_CONFIG = {
    ip: window.API_SERVER_IP || '192.168.108.45',
    httpPort: window.API_HTTP_PORT || '8136',
    httpsPort: window.API_HTTPS_PORT || '8118'
};

const API_BASE = window.location.protocol === 'https:' 
    ? `https://${SERVER_CONFIG.ip}:${SERVER_CONFIG.httpsPort}`
    : `http://${SERVER_CONFIG.ip}:${SERVER_CONFIG.httpPort}`;
```

## Architecture

```
Client Request
    ↓
Nginx Container (nginx-proxy)
    ↓ (proxy_pass)
FastAPI Container (api)
    ↓ (database calls)
MySQL Container (db)
```

## Security Notes
- Uses self-signed certificate (browsers will show warning)
- CORS enabled for all origins (development only)
- For production: use proper SSL certificate and restrict CORS

## Troubleshooting

### SSL Certificate Issues
```bash
# Regenerate certificate
rm -rf nginx/certs/*
./generate_ssl.sh  # or generate_ssl.bat on Windows
docker-compose restart nginx-proxy
```

### Check Logs
```bash
# Nginx logs
docker-compose logs nginx-proxy

# API logs
docker-compose logs api
```

### Port Conflicts
- HTTP 8136: Ensure not used by other services
- HTTPS 8118: Ensure not used by other services
