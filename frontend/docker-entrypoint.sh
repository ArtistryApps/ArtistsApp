#!/bin/sh
set -e

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
