# 🔧 FIX 401 UNAUTHORIZED ERROR

## ❌ Error: 401 Unauthorized

**Meaning:** Token is missing, invalid, or expired

---

## 🔍 HOW TO FIX

### Solution 1: LOGOUT AND LOGIN AGAIN (Easiest!)

1. **Logout** from your current session
2. **Login again** as Farmer
3. Try to submit harvest again
4. Should work! ✅

---

### Solution 2: Check Token in Browser

1. Press **F12** to open Developer Tools
2. Go to **Application** tab (or Storage in Firefox)
3. Click **Local Storage** → `http://localhost:5173`
4. Look for key: **`token`**

**If token is missing:**
- Logout and login again

**If token exists:**
- Check console for error details
- Token might be expired
- Logout and login again

---

### Solution 3: Check Backend Authentication

The backend expects:
```
Authorization: Bearer <your-token>
```

**Check in Network Tab:**
1. Press **F12**
2. Go to **Network** tab
3. Try to submit harvest
4. Click on the request: `farmer/harvests`
5. Go to **Headers** section
6. Look for **Request Headers**
7. Should see: `Authorization: Bearer eyJhbGc...`

**If Authorization header is missing:**
- Token not in localStorage
- Logout and login again

---

## 🚀 QUICK FIX STEPS

### Step 1: Logout
Click logout button in dashboard

### Step 2: Login Again
```
Email: your_farmer_email@example.com
Password: your_password
```

### Step 3: Check Token Saved
1. Press F12
2. Application → Local Storage
3. Should see `token` key with long string value

### Step 4: Try Submit Again
1. Go to Harvest Records
2. Submit New Harvest
3. Fill form
4. Submit
5. Should work now! ✅

---

## 🐛 If Still Getting 401

### Check Backend Logs

Look at your backend terminal for errors like:
```
❌ Invalid token
❌ Token expired
❌ No token provided
❌ User not found
```

### Common Causes:

1. **Token Expired**
   - Solution: Login again

2. **Wrong User Role**
   - Logged in as MAO but trying farmer endpoint
   - Solution: Login with correct farmer account

3. **Token Not Sent**
   - localStorage doesn't have token
   - Solution: Login again

4. **Backend Auth Middleware Issue**
   - Check backend `auth.ts` middleware
   - Check if JWT secret is correct

---

## 📊 Debug Info

### Check Console Logs:

After adding the fix, you'll see:
```javascript
Token exists: true  // or false
Submitting payload: { ... }
Response status: 401
Backend error: { error: "..." }
```

**If "Token exists: false":**
- You're not logged in
- Login again!

**If "Token exists: true" but still 401:**
- Token is invalid or expired
- Logout and login again

---

## ✅ EXPECTED FLOW

### Correct Authentication Flow:

1. **User logs in**
   ```
   POST /api/auth/login
   Response: { token: "eyJhbGc..." }
   ```

2. **Token saved to localStorage**
   ```javascript
   localStorage.setItem('token', token)
   ```

3. **Subsequent requests include token**
   ```
   Headers: {
     Authorization: Bearer eyJhbGc...
   }
   ```

4. **Backend validates token**
   ```
   ✅ Valid → Allow request
   ❌ Invalid → 401 Unauthorized
   ```

---

## 🎯 SOLUTION SUMMARY

### Most Common Fix:
```
1. Logout
2. Login again as Farmer
3. Try submit harvest
4. ✅ Should work!
```

### If that doesn't work:
```
1. Clear browser cache
2. Clear localStorage (F12 → Application → Clear)
3. Refresh page
4. Login again
5. Try submit
```

### If STILL doesn't work:
```
1. Check backend is running on port 3001
2. Check backend logs for auth errors
3. Verify farmer account exists in database
4. Check JWT secret in backend .env
```

---

## 📝 Updated Error Messages

Now when you get 401, you'll see:
```
Authentication failed. Your session may have expired. 
Please logout and login again.
```

Much clearer! ✅

---

**Last Updated:** November 6, 2024  
**Status:** 🔧 DEBUGGING 401  
**Quick Fix:** LOGOUT → LOGIN → TRY AGAIN
