# Harvest and Inventory Management System

## Overview

Comprehensive system for managing abaca harvests from farmers and MAO inventory tracking with distribution management.

## System Flow

```
┌──────────────────────────┐
│        FARMER            │
│ (Harvests abaca fiber)   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│   HARVEST FORM MODULE     │
│  (Farmer inputs harvest)  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│   DATABASE: HARVESTS      │
│ harvest_id, farmer_id,    │
│ date, weight, grade,      │
│ status='Pending Verify'   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│          MAO             │
│ (Verifies harvest data)  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ DATABASE: INVENTORY       │
│ inventory_id, mao_id,     │
│ harvest_id, stock_weight, │
│ grade, status='Stocked'   │
└────────────┬─────────────┘
             │
  ┌──────────┴──────────────┐
  │                         │
  ▼                         ▼
┌──────────────────┐   ┌──────────────────────┐
│ FARMER INTERFACE  │   │ MAO INVENTORY DASH   │
│ • View harvests   │   │ • View inventory     │
│ • See status      │   │ • Manage stock       │
│ • Track progress  │   │ • Distributions      │
└──────────────────┘   └──────────────────────┘
```

## Database Schema

### 1. Harvests Table

Stores all harvest submissions from farmers with comprehensive tracking information.

**Key Fields:**

#### 1) Farm / Location Identification
- `county_province`, `municipality`, `barangay`
- `gps_latitude`, `gps_longitude`, `landmark`
- `farm_name`, `farm_code`
- `area_hectares`, `plot_lot_id`

#### 2) Farmer Information
- `farmer_id` (FK to farmers table)
- `farmer_name`, `farmer_contact`, `farmer_email`
- `cooperative_name`
- `philfida_registration`, `farmer_registration_id`

#### 3) Planting and Variety Info
- `abaca_variety` (e.g., 'Maguindanao', 'Abuab', tissue-culture)
- `planting_date`, `planting_material_source`
- `planting_density_hills_per_ha`, `planting_spacing`

#### 4) Harvest Details (CORE)
- `harvest_date`, `harvest_shift`, `harvest_crew_name`
- `harvest_method` (Manual/Mechanical/MSSM)
- `stalks_harvested`, `tuxies_collected`
- `wet_weight_kg`, `dry_fiber_output_kg`
- `estimated_fiber_recovery_percent`
- `yield_per_hectare_kg`

#### 5) Quality / Grading / Processing
- `fiber_grade`, `fiber_length_cm`, `fiber_color`
- `fiber_fineness`, `fiber_cleanliness`
- `moisture_status` (Sun-dried/Semi-dried/Wet)
- `defects_noted[]`, `has_mold`, `has_discoloration`, `has_pest_damage`
- `stripper_operator_name`
- `bales_produced`, `weight_per_bale_kg`

#### 6) Inputs / Costs / Labor
- `fertilizer_applied`, `fertilizer_application_date`, `fertilizer_quantity`
- `pesticide_applied`, `pesticide_application_date`, `pesticide_quantity`
- `labor_hours`, `number_of_workers`
- `harvesting_cost_per_kg`, `harvesting_cost_per_ha`, `total_harvesting_cost`

#### 7) Pest / Disease / Remarks
- `pests_observed`, `pests_description`
- `diseases_observed`, `diseases_description`
- `remarks`, `photo_urls[]`

#### 8) Verification / Signatures
- `inspected_by`, `inspector_position`, `inspection_date`
- `farmer_signature_url`, `farmer_thumbmark_url`
- `receiving_buyer_trader`, `buyer_contact`

**Status Workflow:**
- `Pending Verification` → `Verified` → `In Inventory` → `Delivered`/`Sold`
- Or: `Pending Verification` → `Rejected`

### 2. Inventory Table

Manages verified harvests in MAO inventory.

**Key Fields:**
- `inventory_id` (UUID)
- `mao_id`, `mao_name`
- `harvest_id` (FK to harvests)
- `stock_weight_kg`, `current_stock_kg`
- `fiber_grade`, `fiber_quality_rating`
- `storage_location`, `warehouse_section`
- `storage_condition`, `storage_temperature_celsius`, `storage_humidity_percent`
- `quality_check_date`, `quality_checked_by`, `quality_notes`
- `expiry_date`
- `total_distributed_kg`, `number_of_distributions`
- `unit_price_per_kg`, `total_value`
- `status` (Stocked/Reserved/Partially Distributed/Fully Distributed/Damaged/Expired)

### 3. Inventory Distributions Table

Tracks all distributions from inventory.

**Key Fields:**
- `distribution_id` (UUID)
- `inventory_id` (FK)
- `distribution_date`
- `distributed_to`, `recipient_type` (Buyer/Trader/Processor/Government/Export)
- `distributed_weight_kg`
- `price_per_kg`, `total_amount`
- `distributed_by`, `distributor_name`
- `transport_method`, `destination`
- `delivery_receipt_number`, `invoice_number`

## API Endpoints

### Farmer Endpoints

#### Create Harvest
```http
POST /api/harvests/farmer/harvests
Authorization: Bearer {token}
Content-Type: application/json

{
  "county_province": "Davao del Norte",
  "municipality": "Asuncion",
  "barangay": "Poblacion",
  "area_hectares": 2.5,
  "abaca_variety": "Maguindanao",
  "planting_date": "2024-01-15",
  "planting_material_source": "Tissue Culture",
  "harvest_date": "2024-11-01",
  "harvest_method": "Manual Tuxying + Hand Stripping",
  "dry_fiber_output_kg": 250.5,
  "fiber_grade": "Grade A",
  "moisture_status": "Sun-dried"
}
```

#### Get My Harvests
```http
GET /api/harvests/farmer/harvests?status=Pending Verification&limit=50&offset=0
Authorization: Bearer {token}
```

#### Get My Harvest Statistics
```http
GET /api/harvests/farmer/harvests/statistics
Authorization: Bearer {token}
```

#### Get Single Harvest
```http
GET /api/harvests/farmer/harvests/{harvestId}
Authorization: Bearer {token}
```

#### Update Harvest (Pending Only)
```http
PUT /api/harvests/farmer/harvests/{harvestId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "dry_fiber_output_kg": 260.0,
  "remarks": "Updated weight after re-measurement"
}
```

#### Delete Harvest (Pending Only)
```http
DELETE /api/harvests/farmer/harvests/{harvestId}
Authorization: Bearer {token}
```

### MAO Endpoints - Harvest Management

#### Get All Harvests
```http
GET /api/harvests/mao/harvests?status=Pending Verification&municipality=Asuncion&limit=50
Authorization: Bearer {token}
```

#### Get Harvest Statistics
```http
GET /api/harvests/mao/harvests/statistics
Authorization: Bearer {token}
```

#### Get Farmer Harvest Summary
```http
GET /api/harvests/mao/harvests/farmers/summary
Authorization: Bearer {token}
```

#### Verify Harvest
```http
POST /api/harvests/mao/harvests/{harvestId}/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "verification_notes": "Harvest verified. Quality meets standards."
}
```

#### Reject Harvest
```http
POST /api/harvests/mao/harvests/{harvestId}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "verification_notes": "Rejected due to inconsistent weight measurements."
}
```

### MAO Endpoints - Inventory Management

#### Add to Inventory
```http
POST /api/inventory/inventory
Authorization: Bearer {token}
Content-Type: application/json

{
  "harvest_id": "uuid-here",
  "stock_weight_kg": 250.5,
  "fiber_grade": "Grade A",
  "fiber_quality_rating": "Excellent",
  "storage_location": "Warehouse A",
  "warehouse_section": "Section 1",
  "storage_condition": "Dry",
  "unit_price_per_kg": 45.00
}
```

#### Get All Inventory
```http
GET /api/inventory/inventory?status=Stocked&fiber_grade=Grade A&limit=50
Authorization: Bearer {token}
```

#### Get Inventory Statistics
```http
GET /api/inventory/inventory/statistics
Authorization: Bearer {token}
```

#### Get Dashboard Summary
```http
GET /api/inventory/inventory/dashboard
Authorization: Bearer {token}
```

#### Get Single Inventory Item
```http
GET /api/inventory/inventory/{inventoryId}
Authorization: Bearer {token}
```

#### Update Inventory
```http
PUT /api/inventory/inventory/{inventoryId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "storage_location": "Warehouse B",
  "unit_price_per_kg": 48.00,
  "quality_notes": "Quality check passed"
}
```

#### Delete Inventory
```http
DELETE /api/inventory/inventory/{inventoryId}
Authorization: Bearer {token}
```

### MAO Endpoints - Distribution Management

#### Create Distribution
```http
POST /api/inventory/distributions
Authorization: Bearer {token}
Content-Type: application/json

{
  "inventory_id": "uuid-here",
  "distributed_to": "ABC Trading Company",
  "recipient_type": "Trader",
  "distributed_weight_kg": 100.0,
  "price_per_kg": 48.00,
  "transport_method": "Truck",
  "destination": "Davao City",
  "delivery_receipt_number": "DR-2024-001",
  "invoice_number": "INV-2024-001"
}
```

#### Get All Distributions
```http
GET /api/inventory/distributions?recipient_type=Trader&limit=50
Authorization: Bearer {token}
```

#### Get Distribution Statistics
```http
GET /api/inventory/distributions/statistics
Authorization: Bearer {token}
```

#### Get Single Distribution
```http
GET /api/inventory/distributions/{distributionId}
Authorization: Bearer {token}
```

#### Get Inventory Distributions
```http
GET /api/inventory/inventory/{inventoryId}/distributions
Authorization: Bearer {token}
```

## Database Views & Statistics

### Harvest Statistics View
```sql
SELECT * FROM harvest_statistics;
```

Returns:
- `total_harvests`
- `pending_verification`
- `verified_harvests`
- `rejected_harvests`
- `in_inventory`
- `total_farmers`
- `total_fiber_kg`
- `avg_fiber_per_harvest`
- `avg_yield_per_hectare`
- `total_area_harvested`
- `harvests_last_30_days`
- `harvests_last_7_days`

### Inventory Statistics View
```sql
SELECT * FROM inventory_statistics;
```

Returns:
- `total_inventory_items`
- `total_stock_kg`
- `total_distributed_kg`
- `stocked_items`
- `reserved_items`
- `distributed_items`
- `damaged_items`
- `avg_stock_per_item`
- `total_inventory_value`
- `total_maos_managing`

### Farmer Harvest Summary View
```sql
SELECT * FROM farmer_harvest_summary;
```

Returns per farmer:
- `farmer_id`, `farmer_name`
- `municipality`, `barangay`
- `total_harvests`
- `total_fiber_produced_kg`
- `avg_yield_per_hectare`
- `last_harvest_date`
- `pending_harvests`
- `verified_harvests`

## Automated Triggers

### 1. Auto-update Timestamps
- Automatically updates `updated_at` on harvest/inventory changes

### 2. Auto-update Stock on Distribution
- Reduces `current_stock_kg` when distribution is created
- Updates `total_distributed_kg` and `number_of_distributions`
- Changes status to `Partially Distributed` or `Fully Distributed`

### 3. Auto-update Harvest Status
- Changes harvest status to `In Inventory` when added to inventory

## Installation & Setup

### 1. Run Database Migration
```bash
# In Supabase SQL Editor, run:
backend/database/migrations/create_harvest_inventory_system.sql
```

### 2. Verify Tables Created
```sql
-- Check harvests table
SELECT COUNT(*) FROM harvests;

-- Check inventory table
SELECT COUNT(*) FROM inventory;

-- Check distributions table
SELECT COUNT(*) FROM inventory_distributions;
```

### 3. Test API Endpoints
```bash
# Start backend server
cd backend
npm run dev

# Server should show new routes:
# /api/harvests/...
# /api/inventory/...
```

## Usage Examples

### Farmer Workflow

1. **Submit Harvest**
   - Farmer fills out comprehensive harvest form
   - System creates record with status `Pending Verification`

2. **Track Status**
   - Farmer views their harvests
   - Checks verification status
   - Views statistics

3. **Update if Needed**
   - Can update pending harvests
   - Cannot modify verified/rejected harvests

### MAO Workflow

1. **Review Harvests**
   - View all pending harvests
   - Filter by location, farmer, date

2. **Verify/Reject**
   - Verify valid harvests
   - Reject with notes for invalid ones

3. **Add to Inventory**
   - Add verified harvests to inventory
   - Set storage location, pricing
   - Track quality metrics

4. **Manage Distributions**
   - Create distributions to buyers/traders
   - Track stock levels automatically
   - Generate reports

## Security & Permissions

### Farmer Role
- ✅ Create own harvests
- ✅ View own harvests
- ✅ Update pending harvests
- ✅ Delete pending harvests
- ❌ Cannot verify harvests
- ❌ Cannot access inventory

### Officer (MAO) Role
- ✅ View all harvests
- ✅ Verify/reject harvests
- ✅ Manage inventory
- ✅ Create distributions
- ✅ View all statistics
- ✅ Generate reports

## Best Practices

### For Farmers
1. Fill all required fields accurately
2. Include photos when possible
3. Record GPS coordinates for precise location
4. Submit harvests promptly after harvest date
5. Keep records of planting dates and inputs

### For MAO Officers
1. Verify harvests within 48 hours
2. Provide clear rejection notes
3. Maintain accurate inventory records
4. Regular quality checks on stored fiber
5. Update pricing based on market rates
6. Track distributions for accountability

## Troubleshooting

### Harvest Creation Fails
- Check all required fields are provided
- Verify planting_date is before harvest_date
- Ensure area_hectares is positive
- Check harvest_method is valid enum value

### Cannot Add to Inventory
- Verify harvest status is `Verified`
- Check harvest not already in inventory
- Ensure stock_weight_kg is positive

### Distribution Creation Fails
- Check sufficient stock available
- Verify inventory_id exists
- Ensure distributed_weight_kg ≤ current_stock_kg

## Future Enhancements

- [ ] Mobile app for field data entry
- [ ] QR code generation for harvest tracking
- [ ] Automated quality grading using ML
- [ ] Integration with PhilFIDA systems
- [ ] Export reports to Excel/PDF
- [ ] SMS notifications for farmers
- [ ] Blockchain integration for traceability
- [ ] Weather data integration
- [ ] Predictive yield analytics

## Support

For issues or questions:
- Check API documentation
- Review database schema
- Contact system administrator
- Submit bug reports

---

**System Version:** 1.0.0  
**Last Updated:** November 6, 2024  
**Database:** PostgreSQL (Supabase)  
**Backend:** Node.js + Express + TypeScript
