#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="http://localhost/scoringsystem/backend/api/submit_score.php"

# Function to format response
format_response() {
    local test_name=$1
    local response=$2
    echo -e "\n${BLUE}Test: ${test_name}${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$response" | grep -v "Connected successfully" | jq '.' || echo "$response"
    echo "----------------------------------------"
}

# Test Cases
echo -e "${BLUE}Running Score Submission Tests${NC}"

# Test 1: Valid submission
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "judge_id": 2,
        "participant_id": 1,
        "category_id": 1,
        "points": 85,
        "comments": "Excellent performance"
    }' \
    $API_URL)
format_response "Valid Score Submission" "$response"

# Test 2: Invalid score (over 100)
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "judge_id": 2,
        "participant_id": 1,
        "category_id": 1,
        "points": 101,
        "comments": "Score too high"
    }' \
    $API_URL)
format_response "Invalid Score (>100)" "$response"

# Test 3: Missing required fields
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "judge_id": 2,
        "participant_id": 1
    }' \
    $API_URL)
format_response "Missing Required Fields" "$response"

# Test 4: Invalid judge ID
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "judge_id": 999,
        "participant_id": 1,
        "category_id": 1,
        "points": 85
    }' \
    $API_URL)
format_response "Invalid Judge ID" "$response"

# Test 5: Invalid participant ID
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "judge_id": 2,
        "participant_id": 999,
        "category_id": 1,
        "points": 85
    }' \
    $API_URL)
format_response "Invalid Participant ID" "$response"

# Test 6: Duplicate submission
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "judge_id": 2,
        "participant_id": 1,
        "category_id": 1,
        "points": 90
    }' \
    $API_URL)
format_response "Duplicate Submission" "$response"