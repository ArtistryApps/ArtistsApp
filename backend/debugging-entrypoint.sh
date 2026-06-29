#!/bin/bash

set -e

python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m \
    uvicorn app.main:app --host 0.0.0.0 --port 8080
