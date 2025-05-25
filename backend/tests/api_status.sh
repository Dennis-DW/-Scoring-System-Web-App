#!/bin/bash

# Test script for get_stats.php
API_URL="http://localhost/scoringsystem/backend/api/get_stats.php"

# Function to check JSON values
check_json_value() {
    local json="$1"
    local path="$2"
    local expected="$3"
    
    local actual=$(echo "$json" | jq -r "$path")
    if [ "$actual" = "$expected" ]; then
        echo "✅ $path = $expected"
    else
        echo "❌ $path = $actual (expected $expected)"
    fi
}

# Get response
response=$(curl -s "$API_URL" | grep -v "Connected successfully")

# Test overview statistics
check_json_value "$response" '.stats.overview.active_participants' "5"
check_json_value "$response" '.stats.overview.active_judges' "4"
check_json_value "$response" '.stats.overview.active_categories' "4"

# Test categories
check_json_value "$response" '.stats.categories | length' "4"
check_json_value "$response" '.stats.categories[0].name' "Impact"

# Test judge activity
check_json_value "$response" '.stats.judge_activity | length' "4"