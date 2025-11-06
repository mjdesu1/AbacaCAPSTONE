# Harvest & Inventory API Quick Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {your_jwt_token}
```

---

## 🌾 FARMER ENDPOINTS

### Harvest Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/harvests/farmer/harvests` | Create new harvest | Farmer |
| GET | `/harvests/farmer/harvests` | Get my harvests | Farmer |
| GET | `/harvests/farmer/harvests/statistics` | Get my harvest stats | Farmer |
| GET | `/harvests/farmer/harvests/:harvestId` | Get single harvest | Farmer |
| PUT | `/harvests/farmer/harvests/:harvestId` | Update harvest (pending only) | Farmer |
| DELETE | `/harvests/farmer/harvests/:harvestId` | Delete harvest (pending only) | Farmer |

### Query Parameters for GET /harvests/farmer/harvests
- `status` - Filter by status (Pending Verification, Verified, Rejected, etc.)
- `limit` - Number of records (default: 50)
- `offset` - Pagination offset (default: 0)

---

## 👨‍💼 MAO ENDPOINTS

### Harvest Verification

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/harvests/mao/harvests` | Get all harvests | Officer |
| GET | `/harvests/mao/harvests/statistics` | Get harvest statistics | Officer |
| GET | `/harvests/mao/harvests/farmers/summary` | Get farmer summary | Officer |
| POST | `/harvests/mao/harvests/:harvestId/verify` | Verify harvest | Officer |
| POST | `/harvests/mao/harvests/:harvestId/reject` | Reject harvest | Officer |

### Query Parameters for GET /harvests/mao/harvests
- `status` - Filter by status
- `municipality` - Filter by municipality
- `barangay` - Filter by barangay
- `limit` - Number of records (default: 50)
- `offset` - Pagination offset (default: 0)

### Inventory Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/inventory/inventory` | Add harvest to inventory | Officer |
| GET | `/inventory/inventory` | Get all inventory items | Officer |
| GET | `/inventory/inventory/statistics` | Get inventory statistics | Officer |
| GET | `/inventory/inventory/dashboard` | Get dashboard summary | Officer |
| GET | `/inventory/inventory/:inventoryId` | Get single inventory item | Officer |
| PUT | `/inventory/inventory/:inventoryId` | Update inventory item | Officer |
| DELETE | `/inventory/inventory/:inventoryId` | Delete inventory item | Officer |

### Query Parameters for GET /inventory/inventory
- `status` - Filter by status (Stocked, Reserved, etc.)
- `storage_location` - Filter by storage location
- `fiber_grade` - Filter by fiber grade
- `limit` - Number of records (default: 50)
- `offset` - Pagination offset (default: 0)

### Distribution Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/inventory/distributions` | Create distribution | Officer |
| GET | `/inventory/distributions` | Get all distributions | Officer |
| GET | `/inventory/distributions/statistics` | Get distribution stats | Officer |
| GET | `/inventory/distributions/:distributionId` | Get single distribution | Officer |
| GET | `/inventory/inventory/:inventoryId/distributions` | Get inventory distributions | Officer |

### Query Parameters for GET /inventory/distributions
- `inventory_id` - Filter by inventory ID
- `recipient_type` - Filter by recipient type (Buyer, Trader, etc.)
- `limit` - Number of records (default: 50)
- `offset` - Pagination offset (default: 0)

---

## 📋 REQUEST BODY EXAMPLES

### Create Harvest (Farmer)
```json
{
  "county_province": "Davao del Norte",
  "municipality": "Asuncion",
  "barangay": "Poblacion",
  "gps_latitude": 7.6298,
  "gps_longitude": 125.4737,
  "landmark": "Near Municipal Hall",
  "farm_name": "Dela Cruz Farm",
  "farm_code": "DCF-001",
  "area_hectares": 2.5,
  "plot_lot_id": "Plot-A1",
  
  "farmer_contact": "09171234567",
  "farmer_email": "juan@example.com",
  "cooperative_name": "Asuncion Farmers Cooperative",
  "philfida_registration": "PHIL-2024-001",
  
  "abaca_variety": "Maguindanao",
  "planting_date": "2024-01-15",
  "planting_material_source": "Tissue Culture",
  "planting_density_hills_per_ha": 1600,
  "planting_spacing": "2m x 2m",
  
  "harvest_date": "2024-11-01",
  "harvest_shift": "Morning",
  "harvest_crew_name": "Team Alpha",
  "harvest_crew_id": "CREW-001",
  "harvest_method": "Manual Tuxying + Hand Stripping",
  "stalks_harvested": 150,
  "tuxies_collected": 150,
  "wet_weight_kg": 500.0,
  "dry_fiber_output_kg": 250.5,
  "estimated_fiber_recovery_percent": 50.1,
  "yield_per_hectare_kg": 100.2,
  
  "fiber_grade": "Grade A",
  "fiber_length_cm": 180.0,
  "fiber_color": "White",
  "fiber_fineness": "Fine",
  "fiber_cleanliness": "Clean",
  "moisture_status": "Sun-dried",
  "defects_noted": [],
  "has_mold": false,
  "has_discoloration": false,
  "has_pest_damage": false,
  "stripper_operator_name": "Pedro Santos",
  "bales_produced": 5,
  "weight_per_bale_kg": 50.0,
  
  "fertilizer_applied": "Organic Compost",
  "fertilizer_application_date": "2024-03-15",
  "fertilizer_quantity": "500 kg",
  "labor_hours": 40.0,
  "number_of_workers": 5,
  "harvesting_cost_per_kg": 5.0,
  
  "pests_observed": false,
  "diseases_observed": false,
  "remarks": "Good quality harvest",
  "photo_urls": ["https://example.com/photo1.jpg"],
  
  "inspected_by": "Maria Garcia",
  "inspector_position": "Agricultural Technician",
  "inspection_date": "2024-11-02"
}
```

### Verify Harvest (MAO)
```json
{
  "verification_notes": "Harvest verified. Quality meets Grade A standards. Weight measurements confirmed."
}
```

### Reject Harvest (MAO)
```json
{
  "verification_notes": "Rejected due to inconsistent weight measurements. Please re-submit with accurate data."
}
```

### Add to Inventory (MAO)
```json
{
  "harvest_id": "550e8400-e29b-41d4-a716-446655440000",
  "stock_weight_kg": 250.5,
  "fiber_grade": "Grade A",
  "fiber_quality_rating": "Excellent",
  "storage_location": "Warehouse A",
  "warehouse_section": "Section 1",
  "storage_condition": "Dry",
  "storage_temperature_celsius": 25.0,
  "storage_humidity_percent": 60.0,
  "quality_check_date": "2024-11-03",
  "quality_checked_by": "Quality Control Team",
  "quality_notes": "Excellent fiber quality. No defects observed.",
  "expiry_date": "2025-11-03",
  "unit_price_per_kg": 45.00,
  "remarks": "Premium quality abaca fiber"
}
```

### Update Inventory (MAO)
```json
{
  "storage_location": "Warehouse B",
  "warehouse_section": "Section 2",
  "unit_price_per_kg": 48.00,
  "quality_notes": "Re-inspected. Quality maintained.",
  "status": "Stocked"
}
```

### Create Distribution (MAO)
```json
{
  "inventory_id": "660e8400-e29b-41d4-a716-446655440000",
  "distribution_date": "2024-11-05",
  "distributed_to": "ABC Trading Company",
  "recipient_type": "Trader",
  "distributed_weight_kg": 100.0,
  "price_per_kg": 48.00,
  "transport_method": "Truck",
  "destination": "Davao City",
  "delivery_receipt_number": "DR-2024-001",
  "invoice_number": "INV-2024-001",
  "remarks": "First batch delivery"
}
```

---

## 📊 RESPONSE EXAMPLES

### Success Response - Create Harvest
```json
{
  "message": "Harvest submitted successfully",
  "harvest": {
    "harvest_id": "550e8400-e29b-41d4-a716-446655440000",
    "farmer_id": "770e8400-e29b-41d4-a716-446655440000",
    "farmer_name": "Juan Dela Cruz",
    "municipality": "Asuncion",
    "barangay": "Poblacion",
    "harvest_date": "2024-11-01",
    "dry_fiber_output_kg": 250.5,
    "fiber_grade": "Grade A",
    "status": "Pending Verification",
    "created_at": "2024-11-06T02:45:00.000Z"
  }
}
```

### Success Response - Get Harvests
```json
{
  "harvests": [
    {
      "harvest_id": "550e8400-e29b-41d4-a716-446655440000",
      "farmer_name": "Juan Dela Cruz",
      "municipality": "Asuncion",
      "harvest_date": "2024-11-01",
      "dry_fiber_output_kg": 250.5,
      "fiber_grade": "Grade A",
      "status": "Pending Verification"
    }
  ]
}
```

### Success Response - Harvest Statistics
```json
{
  "statistics": {
    "total_harvests": 45,
    "pending": 12,
    "verified": 28,
    "rejected": 3,
    "in_inventory": 25,
    "total_fiber_kg": 11250.5,
    "total_area_hectares": 112.5,
    "avg_yield_per_hectare": 100.0
  }
}
```

### Success Response - Inventory Statistics
```json
{
  "statistics": {
    "total_inventory_items": 25,
    "total_stock_kg": 6250.5,
    "total_distributed_kg": 2500.0,
    "stocked_items": 15,
    "reserved_items": 5,
    "distributed_items": 3,
    "damaged_items": 0,
    "avg_stock_per_item": 250.02,
    "total_inventory_value": 281272.5,
    "total_maos_managing": 3
  }
}
```

### Success Response - Dashboard Summary
```json
{
  "inventory": {
    "total_inventory_items": 25,
    "total_stock_kg": 6250.5,
    "total_distributed_kg": 2500.0
  },
  "harvests": {
    "total_harvests": 45,
    "pending_verification": 12,
    "verified_harvests": 28,
    "total_fiber_kg": 11250.5
  },
  "distributions_last_30_days": {
    "count": 15,
    "total_weight_kg": 1500.0,
    "total_revenue": 72000.0
  }
}
```

### Error Response - Unauthorized
```json
{
  "error": "Authentication required. Please provide a valid access token."
}
```

### Error Response - Forbidden
```json
{
  "error": "Access denied. This resource is only available to: farmer."
}
```

### Error Response - Validation Error
```json
{
  "error": "Only verified harvests can be added to inventory"
}
```

### Error Response - Not Found
```json
{
  "error": "Harvest not found"
}
```

### Error Response - Insufficient Stock
```json
{
  "error": "Insufficient stock",
  "available": 50.0,
  "requested": 100.0
}
```

---

## 🔑 ENUMS & CONSTANTS

### Harvest Status
- `Pending Verification`
- `Verified`
- `Rejected`
- `In Inventory`
- `Delivered`
- `Sold`

### Planting Material Source
- `Sucker`
- `Corm`
- `Tissue Culture`
- `Other`

### Harvest Method
- `Manual Tuxying + Hand Stripping`
- `Mechanical Stripping`
- `MSSM`
- `Other`

### Moisture Status
- `Sun-dried`
- `Semi-dried`
- `Wet`
- `Other`

### Inventory Status
- `Stocked`
- `Reserved`
- `Partially Distributed`
- `Fully Distributed`
- `Damaged`
- `Expired`
- `Under Inspection`

### Storage Condition
- `Dry`
- `Humid`
- `Controlled`
- `Open Air`

### Fiber Quality Rating
- `Excellent`
- `Good`
- `Fair`
- `Poor`

### Recipient Type (Distribution)
- `Buyer`
- `Trader`
- `Processor`
- `Government`
- `Export`
- `Other`

---

## 🧪 TESTING WITH CURL

### Create Harvest
```bash
curl -X POST http://localhost:5000/api/harvests/farmer/harvests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Get My Harvests
```bash
curl -X GET "http://localhost:5000/api/harvests/farmer/harvests?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Harvest
```bash
curl -X POST http://localhost:5000/api/harvests/mao/harvests/HARVEST_ID/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verification_notes": "Harvest verified successfully"
  }'
```

### Add to Inventory
```bash
curl -X POST http://localhost:5000/api/inventory/inventory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "harvest_id": "HARVEST_ID",
    "stock_weight_kg": 250.5,
    "fiber_grade": "Grade A",
    "storage_location": "Warehouse A",
    "unit_price_per_kg": 45.00
  }'
```

### Create Distribution
```bash
curl -X POST http://localhost:5000/api/inventory/distributions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_id": "INVENTORY_ID",
    "distributed_to": "ABC Trading",
    "recipient_type": "Trader",
    "distributed_weight_kg": 100.0,
    "price_per_kg": 48.00
  }'
```

---

## 📝 NOTES

1. **Required Fields**: Check the database schema for required fields
2. **Date Format**: Use ISO 8601 format (YYYY-MM-DD)
3. **Decimal Precision**: Use up to 2 decimal places for weights and prices
4. **Arrays**: Use JSON array format for `defects_noted` and `photo_urls`
5. **UUIDs**: All IDs are UUIDs (v4 format)
6. **Pagination**: Use `limit` and `offset` for large datasets
7. **Filtering**: Combine multiple query parameters for precise filtering

---

**Last Updated:** November 6, 2024
