# 🔧 HARVEST SUBMISSION DEBUG GUIDE

## ✅ FIXED: Added console logging for debugging

---

## 🐛 Current Issue

**Error:** "Failed to submit harvest. Please make sure the backend server is running"

**Possible Causes:**
1. Backend not running
2. Backend running on wrong port
3. Database connection issue
4. Missing required fields
5. Data type mismatch

---

## 🔍 HOW TO DEBUG

### Step 1: Check Backend is Running

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
Database connected successfully
```

**If you see errors:**
- Check database connection in `.env`
- Make sure PostgreSQL/Supabase is accessible

---

### Step 2: Check Browser Console

1. Open browser (Chrome/Edge)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try to submit harvest
5. Look for these logs:

```javascript
Submitting payload: {
  farm_coordinates: "...",
  area_hectares: 1.5,
  abaca_variety: "Maguindanao",
  ...
}

Response status: 200  // or 400, 500, etc.
```

---

### Step 3: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Try to submit harvest
3. Look for request to: `http://localhost:5000/api/harvests/farmer/harvests`

**If you see:**
- ❌ **Failed** or **Red** = Backend not running
- ✅ **200 OK** = Success!
- ⚠️ **400 Bad Request** = Missing/invalid data
- ⚠️ **401 Unauthorized** = Token issue
- ⚠️ **500 Server Error** = Backend error

**Click on the request to see:**
- **Request Headers** - Check Authorization token
- **Request Payload** - See what data was sent
- **Response** - See error message from backend

---

## 📋 REQUIRED FIELDS (Must be filled!)

### Form Fields vs Database Schema:

| Form Field | Database Column | Type | Required |
|------------|----------------|------|----------|
| `area_hectares` | `area_hectares` | number | ✅ YES |
| `abaca_variety` | `abaca_variety` | string | ✅ YES |
| `planting_date` | `planting_date` | date | ✅ YES |
| `planting_material_source` | `planting_material_source` | string | ✅ YES |
| `harvest_date` | `harvest_date` | date | ✅ YES |
| `harvest_method` | `harvest_method` | string | ✅ YES |
| `wet_weight_kg` | `wet_weight_kg` | number | ❌ Optional |
| `dry_fiber_output_kg` | `dry_fiber_output_kg` | number | ❌ Optional |
| `fiber_grade` | `fiber_grade` | string | ❌ Optional |

---

## 🔧 VALIDATION CHECKS

### Database Constraints:

1. **`area_hectares > 0`** - Must be positive number
2. **`harvest_date <= CURRENT_DATE`** - Cannot be future date
3. **`planting_date <= harvest_date`** - Planting must be before harvest
4. **`harvest_method`** - Must be one of:
   - "Manual Tuxying + Hand Stripping"
   - "Mechanical Stripping"
   - "MSSM"
   - "Other"
5. **`planting_material_source`** - Must be one of:
   - "Sucker"
   - "Corm"
   - "Tissue Culture"
   - "Other"
6. **`moisture_status`** - Must be one of:
   - "Sun-dried"
   - "Semi-dried"
   - "Wet"
   - "Other"

---

## 🚀 TESTING STEPS

### 1. Start Backend
```bash
cd backend
npm run dev
```

Wait for: "Server running on port 5000"

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Login as Farmer
- Use valid farmer credentials
- Check that token is saved in localStorage

### 4. Fill Harvest Form

**Minimum Required Fields:**
```
Area (Hectares): 1.5
Abaca Variety: Maguindanao
Planting Date: 2024-01-01
Planting Material Source: Tissue Culture
Harvest Date: 2024-11-06
Harvest Method: Manual Tuxying + Hand Stripping
```

### 5. Submit and Check Console

**Look for:**
```javascript
// 1. Payload being sent
Submitting payload: { ... }

// 2. Response status
Response status: 200

// 3. Success or error
✅ Success: "Harvest submitted successfully!"
❌ Error: "Error: [specific error message]"
```

---

## 🐛 COMMON ERRORS & FIXES

### Error 1: "Failed to fetch"
**Cause:** Backend not running
**Fix:** 
```bash
cd backend
npm run dev
```

### Error 2: "401 Unauthorized"
**Cause:** No auth token or invalid token
**Fix:** 
- Logout and login again
- Check localStorage has 'token' key

### Error 3: "400 Bad Request - Missing required field"
**Cause:** Required field not filled
**Fix:** 
- Check console log for which field is missing
- Fill all required fields (marked with *)

### Error 4: "500 Internal Server Error"
**Cause:** Backend/database error
**Fix:**
- Check backend console for error message
- Check database connection
- Check if `harvests` table exists

### Error 5: "Check constraint violation"
**Cause:** Data doesn't meet validation rules
**Fix:**
- `area_hectares` must be > 0
- `harvest_date` cannot be in future
- `planting_date` must be before `harvest_date`

---

## 📊 EXAMPLE VALID PAYLOAD

```json
{
  "farm_coordinates": "7.6298, 125.4737",
  "landmark": "Near school",
  "farm_name": "My Farm",
  "farm_code": "FARM001",
  "area_hectares": 1.5,
  "plot_lot_id": "LOT-A1",
  "abaca_variety": "Maguindanao",
  "planting_date": "2024-01-15",
  "planting_material_source": "Tissue Culture",
  "planting_density_hills_per_ha": 10000,
  "planting_spacing": "2m x 2m",
  "harvest_date": "2024-11-06",
  "harvest_shift": "Morning",
  "harvest_crew_name": "Team A",
  "harvest_method": "Manual Tuxying + Hand Stripping",
  "stalks_harvested": 500,
  "wet_weight_kg": 1000,
  "dry_fiber_output_kg": 150,
  "yield_per_hectare_kg": 100,
  "fiber_grade": "Grade A",
  "fiber_color": "White",
  "moisture_status": "Sun-dried",
  "bales_produced": 3,
  "weight_per_bale_kg": 50,
  "pests_observed": false,
  "pests_description": "",
  "diseases_observed": false,
  "diseases_description": "",
  "remarks": "Good harvest"
}
```

---

## ✅ CHECKLIST

Before submitting, verify:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] Logged in as farmer
- [ ] Token exists in localStorage
- [ ] All required fields filled:
  - [ ] Area (Hectares)
  - [ ] Abaca Variety
  - [ ] Planting Date
  - [ ] Planting Material Source
  - [ ] Harvest Date
  - [ ] Harvest Method
- [ ] Browser console is open (F12)
- [ ] Network tab is open
- [ ] Ready to check logs

---

## 🎯 NEXT STEPS

1. **Start backend** - Must see "Server running on port 5000"
2. **Open browser console** - Press F12
3. **Try to submit** - Fill minimum required fields
4. **Check console logs** - See "Submitting payload" and "Response status"
5. **If error** - Read error message carefully
6. **Report back** - Share the console logs and error message

---

**Last Updated:** November 6, 2024  
**Status:** 🔍 DEBUGGING MODE  
**Console Logging:** ✅ ENABLED
