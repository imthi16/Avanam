FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential curl && rm -rf /var/lib/apt/lists/*

# Use uv for fast dependency resolution (100x faster than pip)
RUN pip install --no-cache-dir uv

COPY requirements.txt .

# Install PyTorch CPU-only first (avoids downloading ~2GB of NVIDIA CUDA packages)
# Ollama handles LLM inference separately — backend only needs CPU torch for embeddings
RUN uv pip install --no-cache-dir --system torch torchvision --index-url https://download.pytorch.org/whl/cpu

RUN uv pip install --no-cache-dir --system -r requirements.txt

COPY . .

RUN mkdir -p data/uploads data/faiss_index

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
