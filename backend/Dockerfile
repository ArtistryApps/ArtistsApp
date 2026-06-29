FROM ghcr.io/artistryapps/artists_api_base:latest

ARG PRIVATE_PYPI_URL
ARG PRIVATE_PYPI_USER
ARG PRIVATE_PYPI_PASS

WORKDIR /app

RUN apt update && apt install curl vim

RUN curl -fsSL https://aka.ms/install-vscode-server/setup.sh | sh

RUN code-server --install-extension ms-python.python \
    && code-server --install-extension ms-python.debugpy
RUN pip install debugpy

COPY requirements.txt .

RUN pip install -r /app/requirements.txt --extra-index-url http://${PRIVATE_PYPI_USER}:${PRIVATE_PYPI_PASS}@${PRIVATE_PYPI_URL} --trusted-host ${PRIVATE_PYPI_URL} \
    && pip uninstall -y bson

RUN pip install --force-reinstall pymongo

RUN apt-get update && apt-get install -y \
    chromium=150.* \
    chromium-driver=150.* \
    && rm -rf /var/lib/apt/lists/*

COPY . .


EXPOSE 8080 

