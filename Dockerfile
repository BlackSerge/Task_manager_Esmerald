# --- Imagen base ---
FROM python:3.12-slim

# --- Directorio de trabajo ---
WORKDIR /app

# --- Instalar dependencias del sistema ---
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# --- Copiar archivos de dependencias ---
COPY backend/pyproject.toml backend/poetry.lock* ./

# --- Instalar dependencias directamente desde requirements.txt ---
COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# --- Copiar todo el proyecto ---
COPY backend/ ./

# --- Variables de entorno ---
ENV PYTHONUNBUFFERED=1

# --- Exponer puerto para Daphne ---
EXPOSE 8000

# --- Comando por defecto ---
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
