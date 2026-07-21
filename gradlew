#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/Akr-final app/gradlew" -p "$SCRIPT_DIR/Akr-final app" "$@"
