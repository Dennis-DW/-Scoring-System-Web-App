#!/bin/bash

# Base URL
BASE_URL="http://localhost/scoringsystem/backend/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  "${BASE_URL}/login.php")

# Remove "Connected successfully" lines from response
CLEANED_RESPONSE=$(echo "$LOGIN_RESPONSE" | grep -v "Connected successfully")

# Extract token
TOKEN=$(echo "$CLEANED_RESPONSE" | jq -r '.token')
echo -e "${GREEN}Token:${NC} $TOKEN"

echo -e "\n${GREEN}Testing protected route...${NC}"
curl -X GET -i \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:3000" \
  "${BASE_URL}/check_auth.php"

echo -e "\n${GREEN}Testing invalid credentials...${NC}"
curl -X POST -i \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"admin@example.com","password":"wrongpass"}' \
  "${BASE_URL}/login.php"

echo -e "\n${GREEN}Testing missing credentials...${NC}"
curl -X POST -i \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"admin@example.com"}' \
  "${BASE_URL}/login.php"