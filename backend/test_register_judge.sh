#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# API URL
API_URL="http://localhost/scoringsystem/backend/api/add_judge.php"

# Function to format response
format_response() {
    local test_name=$1
    local response=$2
    echo -e "\n${BLUE}Test: ${test_name}${NC}"
    echo "$response" | grep -v "Connected successfully" | jq '.' || echo "$response"
    echo "----------------------------------------"
}

echo "Testing Add Judge API"

# Test 1: Valid judge creation
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "newjudge1",
        "display_name": "New Test Judge",
        "email": "newjudge1@example.com",
        "password": "password123",
        "role_id": 2
    }' \
    $API_URL)
format_response "Valid Judge Creation" "$response"

# Test 2: Duplicate username
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "newjudge1",
        "display_name": "Another Judge",
        "email": "another@example.com",
        "password": "password123",
        "role_id": 2
    }' \
    $API_URL)
format_response "Duplicate Username" "$response"

# Test 3: Invalid email
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "newjudge2",
        "display_name": "Invalid Email Judge",
        "email": "invalid-email",
        "password": "password123",
        "role_id": 2
    }' \
    $API_URL)
format_response "Invalid Email" "$response"

# Test 4: Short password
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "newjudge3",
        "display_name": "Short Password Judge",
        "email": "judge3@example.com",
        "password": "short",
        "role_id": 2
    }' \
    $API_URL)
format_response "Short Password" "$response"

# Test 5: Invalid role
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "newjudge4",
        "display_name": "Invalid Role Judge",
        "email": "judge4@example.com",
        "password": "password123",
        "role_id": 999
    }' \
    $API_URL)
format_response "Invalid Role ID" "$response"