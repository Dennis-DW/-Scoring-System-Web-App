#!/bin/bash
# test_api.sh

# Colors for formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Base URL
API_URL="http://localhost/scoringsystem/backend/api"

# Function to make API request and format response
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    
    echo -e "\n${BLUE}Testing ${endpoint}${NC}"
    echo -e "${GREEN}Method: ${method}${NC}"
    
    # Make request and clean response
    response=$(curl -s -X ${method} \
        -H "Origin: http://localhost:3000" \
        -H "Content-Type: application/json" \
        "${API_URL}/${endpoint}" | grep -v "Connected successfully")
    
    # Format with jq if valid JSON
    if echo "$response" | jq '.' >/dev/null 2>&1; then
        echo -e "${GREEN}Response:${NC}"
        echo "$response" | jq '.'
    else
        echo -e "${RED}Invalid JSON response:${NC}"
        echo "$response"
    fi
    echo -e "${BLUE}----------------------------------------${NC}"
}

# Test endpoints
test_endpoint "get_stats.php"
test_endpoint "get_participants.php"
test_endpoint "get_judges.php"
test_endpoint "get_categories.php"
test_endpoint "get_recent_scores.php"