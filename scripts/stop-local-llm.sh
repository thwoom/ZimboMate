#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/../infra/local-llm/docker-compose.yml"
command -v docker >/dev/null 2>&1 || { echo "docker is required"; exit 1; }
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Cannot find docker-compose file at $COMPOSE_FILE" >&2
  exit 1
fi
echo "Stopping local LLM containers..."
docker compose -f "$COMPOSE_FILE" down
