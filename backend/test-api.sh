#!/bin/bash

# Test script for TradeTrakR Signup API
# Usage: ./test-api.sh [backend_url]

BACKEND_URL=${1:-http://localhost:3000}

echo "🧪 Testing TradeTrakR Signup API at: $BACKEND_URL"
echo ""

# Test health endpoint
echo "1. Testing /health endpoint..."
curl -s "$BACKEND_URL/health" | jq .
echo ""

# Test signup with valid email
echo "2. Testing POST /api/signup (valid email)..."
curl -s -X POST "$BACKEND_URL/api/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq .
echo ""

# Test duplicate email (should return 409)
echo "3. Testing duplicate email (should fail)..."
curl -s -X POST "$BACKEND_URL/api/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq .
echo ""

# Test invalid email
echo "4. Testing invalid email format..."
curl -s -X POST "$BACKEND_URL/api/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}' | jq .
echo ""

# Test admin endpoint
echo "5. Testing GET /api/list (admin)..."
curl -s -X GET "$BACKEND_URL/api/list" \
  -H "x-admin-secret: dev-secret-key-12345" | jq .
echo ""

echo "✅ Tests complete!"

