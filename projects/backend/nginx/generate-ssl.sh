#!/bin/sh
set -e

CERT_DIR="/etc/nginx/certs"
SERVER_IP="${SERVER_IP:-192.168.0.103}"

echo "=== SSL Certificate Generator ==="
echo "Using Server IP: $SERVER_IP"
echo "================================="

# Create certs directory if not exists
mkdir -p ${CERT_DIR}

# Check if certificate already exists and is valid for the current IP
if [ -f "${CERT_DIR}/cert.pem" ] && [ -f "${CERT_DIR}/key.pem" ]; then
    # Extract CN from existing certificate
    EXISTING_CN=$(openssl x509 -in "${CERT_DIR}/cert.pem" -noout -subject 2>/dev/null | sed -n 's/.*CN=\([^,]*\).*/\1/p' || echo "")
    
    # Check if certificate is still valid and matches current IP
    if [ "$EXISTING_CN" = "$SERVER_IP" ] && openssl x509 -in "${CERT_DIR}/cert.pem" -checkend 86400 -noout > /dev/null 2>&1; then
        echo "✅ SSL certificate already exists and is valid for IP: $SERVER_IP"
        echo "Certificate info:"
        echo "   - Certificate: ${CERT_DIR}/cert.pem" 
        echo "   - Private Key: ${CERT_DIR}/key.pem"
        echo "   - Domain: ${SERVER_IP}"
        echo "   - Status: Valid"
        exit 0
    else
        if [ "$EXISTING_CN" != "$SERVER_IP" ]; then
            echo "🔄 IP changed from $EXISTING_CN to $SERVER_IP, regenerating certificate..."
        else
            echo "🔄 SSL certificate exists but expired, regenerating..."
        fi
    fi
fi

# Generate self-signed certificate for 1 year
echo "🔐 Generating new SSL certificate for IP: $SERVER_IP"
openssl req -x509 -newkey rsa:4096 \
    -keyout "${CERT_DIR}/key.pem" \
    -out "${CERT_DIR}/cert.pem" \
    -days 365 -nodes \
    -subj "/C=VN/ST=HCM/L=HoChiMinh/O=IoTC25/OU=AdvancedSupportSquad/CN=${SERVER_IP}"

echo ""
echo "✅ SSL certificate generated successfully!"
echo "Certificate info:"
echo "   - Certificate: ${CERT_DIR}/cert.pem"
echo "   - Private Key: ${CERT_DIR}/key.pem" 
echo "   - Domain: ${SERVER_IP}"
echo "   - Valid for: 365 days"
echo ""
echo "🌐 Server endpoints:"
echo "   - HTTP:  http://${SERVER_IP}:8136"
echo "   - HTTPS: https://${SERVER_IP}:8118"
echo "   - Docs:  http://${SERVER_IP}:8136/docs"
