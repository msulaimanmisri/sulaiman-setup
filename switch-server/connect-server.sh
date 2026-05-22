#!/bin/bash
set -e

# ───────────────────────────────────────────────────────────────
# Load env
# ───────────────────────────────────────────────────────────────
ENV_FILE="$1"
if [[ -z "$ENV_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "Usage: $0 <path-to-env-file>"
  exit 1
fi

source "$ENV_FILE"

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_REGION

# ───────────────────────────────────────────────────────────────
# Kill any existing tunnel on the same port
# ───────────────────────────────────────────────────────────────
echo "Checking for existing tunnel on port $TUNNEL_PORT..."
EXISTING_PID=$(lsof -ti tcp:"$TUNNEL_PORT" 2>/dev/null || true)
if [[ -n "$EXISTING_PID" ]]; then
  echo "Killing existing process on port $TUNNEL_PORT (PID: $EXISTING_PID)..."
  kill -9 "$EXISTING_PID"
  sleep 1
fi

# ───────────────────────────────────────────────────────────────
# Open tunnel in background
# ───────────────────────────────────────────────────────────────
echo "Opening tunnel to $AWS_EC2 on port $TUNNEL_PORT..."
aws ec2-instance-connect open-tunnel \
  --instance-connect-endpoint-id "$AWS_EICE" \
  --instance-id "$AWS_EC2" \
  --remote-port 22 \
  --local-port "$TUNNEL_PORT" \
  --max-tunnel-duration 3600 &

TUNNEL_PID=$!
echo "Tunnel started (PID: $TUNNEL_PID). Waiting for it to be ready..."
sleep 3

# ───────────────────────────────────────────────────────────────
# SSH in (bypasses known_hosts)
# ───────────────────────────────────────────────────────────────
echo "Connecting via SSH..."
ssh -i "$PEM_FILE" ubuntu@localhost \
  -p "$TUNNEL_PORT" \
  -L 3307:localhost:3306 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o LogLevel=ERROR

# ───────────────────────────────────────────────────────────────
# Cleanup tunnel after SSH exits
# ───────────────────────────────────────────────────────────────
echo "SSH session ended. Closing tunnel (PID: $TUNNEL_PID)..."
kill "$TUNNEL_PID" 2>/dev/null || true