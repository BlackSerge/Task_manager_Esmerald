FROM python:3.12-slim


ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SETTINGS_MODULE=config.settings.prod

WORKDIR /app


RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


COPY backend/requirements.txt ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt


COPY backend/ .

#
RUN mkdir -p /app/staticfiles

EXPOSE 8000


CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]