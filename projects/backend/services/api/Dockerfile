# services/api/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    UVICORN_WORKERS=2

WORKDIR /app

# Cài deps
COPY ./services/api/requirements.txt /app/services/api/requirements.txt
RUN pip install --no-cache-dir -r /app/services/api/requirements.txt

# Copy code
COPY services/api /app/services/api
COPY services/shared /app/services/shared

RUN mkdir -p /app/services/api/schemas \
&& [ -f /app/services/__init__.py ] || touch /app/services/__init__.py \
&& [ -f /app/services/api/__init__.py ] || touch /app/services/api/__init__.py \
&& [ -f /app/services/api/schemas/__init__.py ] || touch /app/services/api/schemas/__init__.py \
&& [ -f /app/services/shared/__init__.py ] || touch /app/services/shared/__init__.py

ENV API_PORT=8136
EXPOSE 8136
CMD ["bash", "-lc", "uvicorn services.api.server:app --host 0.0.0.0 --port ${API_PORT} --workers ${UVICORN_WORKERS}"]