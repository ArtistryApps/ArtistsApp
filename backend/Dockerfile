FROM python:3.11-slim

ARG PRIVATE_PYPI_URL
ARG PRIVATE_PYPI_USER
ARG PRIVATE_PYPI_PASS

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install -r /app/requirements.txt --extra-index-url http://${PRIVATE_PYPI_USER}:${PRIVATE_PYPI_PASS}@${PRIVATE_PYPI_URL} --trusted-host ${PRIVATE_PYPI_URL}

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
