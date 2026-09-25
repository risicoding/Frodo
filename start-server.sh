#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

: "${API_ID:?API_ID is not set}"
: "${API_HASH:?API_HASH is not set}"
: "${BOT_TOKEN:?BOT_TOKEN is not set}"

DATA_DIR="./telegram-bot-api-data"
mkdir -p "$DATA_DIR"

echo "Starting Telegram Bot API server..."
echo "API ID: $API_ID"
echo "Local API: http://127.0.0.1:8081"

docker run --rm \
    --name telegram-bot-api \
    -p 8081:8081 \
    -v "$(realpath "$DATA_DIR"):/var/lib/telegram-bot-api" \
    -e TELEGRAM_API_ID="$API_ID" \
    -e TELEGRAM_API_HASH="$API_HASH" \
    aiogram/telegram-bot-api:latest \
    --local
