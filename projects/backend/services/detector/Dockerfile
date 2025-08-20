FROM python:3.11-slim


ENV PYTHONDONTWRITEBYTECODE=1 \
PYTHONUNBUFFERED=1 \
PIP_NO_CACHE_DIR=1

# OS deps tối thiểu cho OpenCV-headless & Torch (CPU)
RUN apt-get update && apt-get install -y --no-install-recommends \
libglib2.0-0 libgl1 libgomp1 \
&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements vào đúng vị trí mong muốn
COPY services/detector/requirements.txt /app/services/detector/requirements.txt

# Cài pip, Torch (CPU-only) trước để thỏa phụ thuộc của ultralytics nhưng không kéo CUDA
RUN pip install --upgrade pip \
&& pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch \
&& python - <<'PY'
import torch
print('Torch version:', torch.__version__)
assert not torch.cuda.is_available(), 'CUDA build detected — expected CPU only'
print('Torch OK (CPU-only).')
PY

# Cài các thư viện còn lại 
RUN pip install --no-cache-dir \
--extra-index-url https://download.pytorch.org/whl/cpu \
-r /app/services/detector/requirements.txt

COPY services/detector/ /app/services/detector/

RUN mkdir -p /app/services/detector \
&& [ -f /app/services/__init__.py ] || touch /app/services/__init__.py \
&& [ -f /app/services/detector/__init__.py ] || touch /app/services/detector/__init__.py

EXPOSE 8100

# Chạy FastAPI app
CMD ["uvicorn", "services.detector.app:app", "--host", "0.0.0.0", "--port", "8100"]
