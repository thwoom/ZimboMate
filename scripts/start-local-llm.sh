#!/usr/bin/env bash
set -euo pipefail
SKIP_DEV=${SKIP_DEV_SERVER:-0}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/../infra/local-llm/docker-compose.yml"
MODELS_DIR="$SCRIPT_DIR/../infra/local-llm/models"
command -v docker >/dev/null 2>&1 || { echo "docker is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }

for model in qwen2.5-7b-instruct-q4_k_m.gguf mistral-7b-instruct-v0.2-q4_k_m.gguf; do
  if [[ ! -f "$MODELS_DIR/$model" ]]; then
    echo "Missing model file: $MODELS_DIR/$model"
    echo "Download the GGUF referenced in infra/local-llm/models/README.md before running this script."
    exit 1
  fi
done

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Cannot find docker-compose file at $COMPOSE_FILE" >&2
  exit 1
fi

echo "Starting local LLM containers via docker compose..."
docker compose -f "$COMPOSE_FILE" up -d >/dev/null

wait_for_endpoint() {
  local name=$1
  local url=$2
  local timeout=${3:-180}
  local start=$(date +%s)
  while true; do
    if curl -s "$url" >/dev/null; then
      echo "$name is ready at $url"
      return 0
    fi
    if (( $(date +%s) - start > timeout )); then
      echo "Warning: $name did not become ready within ${timeout}s" >&2
      return 1
    fi
    sleep 3
  done
}

wait_for_endpoint "Qwen tool runtime" "http://localhost:11434/v1/models" || true
wait_for_endpoint "Narration runtime" "http://localhost:11435/v1/models" || true

if [[ "$SKIP_DEV" != "1" ]]; then
  export VITE_LLM_RUNTIME=local
  export VITE_LOCAL_OPENAI_BASE_URL=http://localhost:11434/v1
  export VITE_LOCAL_RULES_MODEL=qwen2.5-7b-tools
  export VITE_LOCAL_OPENAI_VOICE_BASE_URL=http://localhost:11435/v1
  export VITE_LOCAL_VOICE_MODEL=mistral-7b-narrator
  echo "Launching Chronicle dev server with local LLM env vars..."
  npm run dev
fi
