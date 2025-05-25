#!/bin/bash

# Store API base URL
API_URL="http://localhost/scoringsystem/backend/api"

# Colors for better readability
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Getting auth token...${NC}"
TOKEN=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  "${API_URL}/login.php" | grep -v "Connected successfully" | jq -r '.token')

echo "Token: ${TOKEN}"

echo -e "\n${GREEN}Testing protected route...${NC}"
curl -v -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  "${API_URL}/check_auth.php"