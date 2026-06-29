FROM ghcr.io/artistryapps/artists_api_base:latest

ARG PRIVATE_PYPI_URL
ARG PRIVATE_PYPI_USER
ARG PRIVATE_PYPI_PASS

WORKDIR /app

COPY requirements.txt .

RUN pip install -r /app/requirements.txt --extra-index-url http://${PRIVATE_PYPI_USER}:${PRIVATE_PYPI_PASS}@${PRIVATE_PYPI_URL} --trusted-host ${PRIVATE_PYPI_URL} \
    && pip uninstall -y bson

RUN pip install --force-reinstall pymongo

COPY . .

RUN pip install debugpy

EXPOSE 8080 

