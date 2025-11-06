# Harvest System Updates - Auto-Population from Farmer Profile

## Changes Made

### 1. Database Schema Updates

#### Farm Location Fields - Auto-Populated
The following fields are now **automatically populated** from the farmer's profile:

- `county_province` ← `farmer.address`
- `municipality` ← `farmer.municipality`
- `barangay` ← `farmer.barangay`

#### Farmer Information Fields - Auto-Populated
- `farmer_name` ← `farmer.full_name`
- `farmer_contact` ← `farmer.contact_number`
- `cooperative_name` ← `farmer.association_name`

#### GPS Coordinates Simplified
**CHANGED:** Replaced separate `gps_latitude` and `gps_longitude` fields with:
- `farm_coordinates` (TEXT) - Can store GPS coordinates or location description

#### Foreign Key References Fixed
**REMOVED:** References to `public.users` table (which doesn't exist)
- `verified_by` - Now just UUID without foreign key
- `mao_id` - Now just UUID without foreign key
- `distributed_by` - Now just UUID without foreign key

### 2. Controller Updates

#### HarvestController.createHarvest()

**Before:** Farmers had to manually input all location and contact information
```typescript
{
  county_province: "Davao del Norte",
  municipality: "Asuncion",
  barangay: "Poblacion",
  farmer_name: "Juan Dela Cruz",
  farmer_contact: "09171234567",
  cooperative_name: "Asuncion Farmers Coop"
}
```

**After:** These fields are automatically filled from the farmer's profile
```typescript
{
  // Only need to provide:
  area_hectares: 2.5,
  farm_coordinates: "7.6298, 125.4737", // Optional
  farm_name: "Dela Cruz Farm", // Optional
  // ... rest of harvest data
}
```

The system automatically fetches and populates:
- Location: county_province, municipality, barangay
- Contact: farmer_name, farmer_contact, cooperative_name

## Benefits

### 1. **Data Consistency**
- Location and contact info always matches the farmer's registered profile
- No discrepancies between harvest records and farmer data

### 2. **Reduced Data Entry**
- Farmers don't need to repeatedly enter the same information
- Faster harvest submission process
- Less prone to typos and errors

### 3. **Simplified Forms**
- Frontend forms can be much simpler
- Only need to collect harvest-specific data
- Better user experience

### 4. **Easier Maintenance**
- If a farmer updates their profile, it doesn't affect historical harvest records
- Each harvest record has a snapshot of farmer info at submission time

## API Changes

### Create Harvest Endpoint

**Endpoint:** `POST /api/harvests/farmer/harvests`

**Minimal Required Fields:**
```json
{
  "area_hectares": 2.5,
  "abaca_variety": "Maguindanao",
  "planting_date": "2024-01-15",
  "planting_material_source": "Tissue Culture",
  "harvest_date": "2024-11-01",
  "harvest_method": "Manual Tuxying + Hand Stripping",
  "dry_fiber_output_kg": 250.5,
  "moisture_status": "Sun-dried"
}
```

**Optional Location Fields:**
```json
{
  "farm_coordinates": "7.6298, 125.4737",
  "landmark": "Near Municipal Hall",
  "farm_name": "Dela Cruz Farm",
  "farm_code": "DCF-001",
  "plot_lot_id": "Plot-A1"
}
```

**Auto-Populated (No Need to Send):**
- ❌ `county_province` - Auto-filled from farmer profile
- ❌ `municipality` - Auto-filled from farmer profile
- ❌ `barangay` - Auto-filled from farmer profile
- ❌ `farmer_name` - Auto-filled from farmer profile
- ❌ `farmer_contact` - Auto-filled from farmer profile
- ❌ `cooperative_name` - Auto-filled from farmer profile

## Database Migration

### Run This SQL in Supabase

The updated migration file is:
```
backend/database/migrations/create_harvest_inventory_system.sql
```

**Key Changes:**
1. `farm_coordinates TEXT` instead of separate lat/long
2. Removed foreign key constraints to `public.users`
3. Added comments indicating auto-populated fields

### Migration Steps

1. **Drop existing tables if testing:**
```sql
DROP TABLE IF EXISTS public.inventory_distributions CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.harvests CASCADE;
DROP VIEW IF EXISTS public.harvest_statistics;
DROP VIEW IF EXISTS public.inventory_statistics;
DROP VIEW IF EXISTS public.farmer_harvest_summary;
```

2. **Run the new migration:**
```sql
-- Run the entire create_harvest_inventory_system.sql file
```

3. **Verify tables created:**
```sql
SELECT COUNT(*) FROM public.harvests;
SELECT COUNT(*) FROM public.inventory;
```

## Frontend Implementation Guide

### Harvest Form - Simplified

```typescript
// Farmer Harvest Submission Form
interface HarvestFormData {
  // REQUIRED - Harvest Core Data
  area_hectares: number;
  abaca_variety: string;
  planting_date: string;
  planting_material_source: 'Sucker' | 'Corm' | 'Tissue Culture' | 'Other';
  harvest_date: string;
  harvest_method: string;
  dry_fiber_output_kg: number;
  moisture_status: string;
  
  // OPTIONAL - Location Details
  farm_coordinates?: string; // "lat, long" or description
  landmark?: string;
  farm_name?: string;
  farm_code?: string;
  plot_lot_id?: string;
  
  // OPTIONAL - Quality/Grading
  fiber_grade?: string;
  fiber_color?: string;
  bales_produced?: number;
  
  // OPTIONAL - Other Details
  remarks?: string;
  photo_urls?: string[];
}

// NO NEED to collect:
// - county_province (auto-filled)
// - municipality (auto-filled)
// - barangay (auto-filled)
// - farmer_name (auto-filled)
// - farmer_contact (auto-filled)
// - cooperative_name (auto-filled)
```

### Example Form Component

```tsx
function HarvestSubmissionForm() {
  const [formData, setFormData] = useState({
    area_hectares: '',
    abaca_variety: '',
    planting_date: '',
    planting_material_source: '',
    harvest_date: '',
    harvest_method: '',
    dry_fiber_output_kg: '',
    moisture_status: '',
    // Optional fields
    farm_coordinates: '',
    landmark: '',
    remarks: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/harvests/farmer/harvests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Location auto-filled - just show as read-only */}
      <div className="auto-filled-section">
        <p>Location: {farmerProfile.municipality}, {farmerProfile.barangay}</p>
        <p>Farmer: {farmerProfile.full_name}</p>
        <p>Contact: {farmerProfile.contact_number}</p>
      </div>
      
      {/* Only collect harvest-specific data */}
      <input 
        type="number" 
        name="area_hectares"
        placeholder="Area (hectares)"
        required
      />
      
      <select name="abaca_variety" required>
        <option value="Maguindanao">Maguindanao</option>
        <option value="Abuab">Abuab</option>
      </select>
      
      {/* ... rest of form fields */}
      
      <button type="submit">Submit Harvest</button>
    </form>
  );
}
```

## Testing

### Test Harvest Creation

```bash
# 1. Login as farmer
POST /api/auth/login
{
  "email": "farmer@example.com",
  "password": "password"
}

# 2. Create harvest (minimal data)
POST /api/harvests/farmer/harvests
Authorization: Bearer {token}
{
  "area_hectares": 2.5,
  "abaca_variety": "Maguindanao",
  "planting_date": "2024-01-15",
  "planting_material_source": "Tissue Culture",
  "harvest_date": "2024-11-06",
  "harvest_method": "Manual Tuxying + Hand Stripping",
  "dry_fiber_output_kg": 250.5,
  "moisture_status": "Sun-dried"
}

# 3. Verify auto-populated fields
GET /api/harvests/farmer/harvests
# Check that municipality, barangay, farmer_name are filled
```

## Migration Checklist

- [x] Update database schema
- [x] Remove GPS lat/long, add farm_coordinates
- [x] Remove foreign key to public.users
- [x] Update HarvestController
- [x] Auto-populate from farmer profile
- [x] Update documentation
- [ ] Test in Supabase
- [ ] Update frontend forms
- [ ] Test end-to-end flow

## Notes

1. **Historical Data:** Existing harvest records store a snapshot of farmer info at submission time
2. **Profile Updates:** If farmer updates their profile, new harvests will use the new info
3. **Data Integrity:** Each harvest maintains its own copy of location/contact data
4. **Flexibility:** Farmers can still override auto-filled data if needed (future enhancement)

---

**Updated:** November 6, 2024  
**Version:** 2.0  
**Status:** Ready for Testing
