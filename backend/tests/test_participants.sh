#!/bin/bash

# test_participants.sh
API_URL="http://localhost/scoringsystem/backend/api/get_participants.php"

echo "Testing Participants API..."
response=$(curl -s $API_URL | grep -v "Connected successfully")
echo $response | jq '.'

# Validate response structure
echo -e "\nValidating response structure..."
count=$(echo $response | jq '.count')
echo "Total participants: $count"

# Check first participant data
echo -e "\nChecking first participant data..."
echo $response | jq '.participants[0]'