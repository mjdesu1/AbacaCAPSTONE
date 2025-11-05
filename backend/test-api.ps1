# PowerShell script to test the Authentication API
# Run this after starting the server with: npm run dev

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MAO Culiram Abaca - API Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api/auth"
$testEmail = "test.farmer.$(Get-Random)@example.com"

# Test 1: Register Farmer
Write-Host "Test 1: Registering a new farmer..." -ForegroundColor Yellow
$farmerData = @{
    fullName = "Test Farmer"
    email = $testEmail
    password = "TestPass123!"
    contactNumber = "09171234567"
    municipality = "Prosperidad"
    associationName = "CuSAFA"
    farmAreaHectares = 2.5
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/register/farmer" -Method Post -Body $farmerData -ContentType "application/json"
    Write-Host "✓ Farmer registered successfully!" -ForegroundColor Green
    Write-Host "  Farmer ID: $($registerResponse.data.farmerId)" -ForegroundColor Gray
    Write-Host "  Email: $($registerResponse.data.email)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 2: Login
Write-Host "Test 2: Logging in as farmer..." -ForegroundColor Yellow
$loginData = @{
    email = $testEmail
    password = "TestPass123!"
    userType = "farmer"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.data.user.fullName)" -ForegroundColor Gray
    Write-Host "  Access Token: $($loginResponse.data.tokens.accessToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
    
    $accessToken = $loginResponse.data.tokens.accessToken
    $refreshToken = $loginResponse.data.tokens.refreshToken
    $userId = $loginResponse.data.user.farmerId
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Test 3: Get Current User
Write-Host "Test 3: Getting current user profile..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/me" -Method Get -Headers $headers
    Write-Host "✓ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host "  User ID: $($meResponse.data.userId)" -ForegroundColor Gray
    Write-Host "  Email: $($meResponse.data.email)" -ForegroundColor Gray
    Write-Host "  Type: $($meResponse.data.userType)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get profile: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Refresh Token
Write-Host "Test 4: Refreshing access token..." -ForegroundColor Yellow
$refreshData = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/refresh" -Method Post -Body $refreshData -ContentType "application/json"
    Write-Host "✓ Token refreshed successfully!" -ForegroundColor Green
    Write-Host "  New Access Token: $($refreshResponse.data.accessToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Token refresh failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Logout
Write-Host "Test 5: Logging out..." -ForegroundColor Yellow
$logoutData = @{
    userId = $userId
    userType = "farmer"
} | ConvertTo-Json

try {
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/logout" -Method Post -Body $logoutData -ContentType "application/json"
    Write-Host "✓ Logout successful!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Logout failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Supabase Table Editor to see the new farmer" -ForegroundColor White
Write-Host "2. Check auth_audit_log table for login events" -ForegroundColor White
Write-Host "3. Try the other registration endpoints (buyer, officer)" -ForegroundColor White
Write-Host ""
Write-Host "Test email used: $testEmail" -ForegroundColor Gray
Write-Host ""
