# Field Monitoring System - Database Documentation

## Overview
Complete database schema for recording field monitoring and updates for crop growth, production, and farmer activity tracking.

## Purpose
To systematically record and track:
- Field monitoring visits by MAO officers
- Crop growth stages and farm conditions
- Issues observed during visits
- Actions taken and recommendations provided
- Scheduled follow-up monitoring dates
- Historical changes and alerts

---

## Database Tables

### 1. **monitoring_records** (Main Table)

**Purpose**: Store all field monitoring visit records

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `monitoring_id` | VARCHAR(50) | PRIMARY KEY | Unique identifier (format: MON-{timestamp}-{random}) |
| `date_of_visit` | DATE | NOT NULL | Date when monitoring was conducted |
| `monitored_by` | VARCHAR(255) | NOT NULL | Name of person conducting visit (e.g., High Value Coordinator) |
| `monitored_by_role` | VARCHAR(100) | | Role/position of monitor |
| `farmer_id` | VARCHAR(50) | NOT NULL, FK | Reference to users table |
| `farmer_name` | VARCHAR(255) | NOT NULL | Name of farmer being monitored |
| `association_name` | VARCHAR(255) | | Farmer's association name |
| `farm_location` | TEXT | | Specific location of farm |
| `farm_condition` | VARCHAR(50) | NOT NULL, CHECK | Farm status: 'Healthy', 'Needs Support', 'Damaged' |
| `growth_stage` | VARCHAR(50) | NOT NULL, CHECK | Current crop stage (8 stages) |
| `issues_observed` | TEXT[] | | Array of observed issues |
| `other_issues` | TEXT | | Additional issues not in predefined list |
| `actions_taken` | TEXT | NOT NULL | Actions performed during visit |
| `recommendations` | TEXT | NOT NULL | Advice given to farmer |
| `next_monitoring_date` | DATE | NOT NULL | Scheduled next visit date |
| `weather_condition` | VARCHAR(100) | | Weather during visit |
| `estimated_yield` | DECIMAL(10,2) | | Expected harvest amount (kg) |
| `remarks` | TEXT | | Additional notes |
| `photo_urls` | TEXT[] | | Array of photo URLs |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| `created_by` | VARCHAR(50) | | User who created record |
| `updated_by` | VARCHAR(50) | | User who last updated record |

**Constraints**:
- `check_visit_date`: `date_of_visit <= CURRENT_DATE`
- `check_next_monitoring`: `next_monitoring_date > date_of_visit`
- Foreign key to `users(id)` with CASCADE delete

**Indexes**:
- `idx_monitoring_farmer_id` on `farmer_id`
- `idx_monitoring_date_of_visit` on `date_of_visit`
- `idx_monitoring_next_date` on `next_monitoring_date`
- `idx_monitoring_farm_condition` on `farm_condition`
- `idx_monitoring_growth_stage` on `growth_stage`
- `idx_monitoring_created_at` on `created_at`

---

### 2. **monitoring_issues**

**Purpose**: Normalized table for common monitoring issues

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `issue_id` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `issue_name` | VARCHAR(100) | UNIQUE, NOT NULL | Name of issue |
| `issue_category` | VARCHAR(50) | | Category (Pest & Disease, Weather, etc.) |
| `description` | TEXT | | Detailed description |
| `severity_level` | VARCHAR(20) | CHECK | Low, Medium, High, Critical |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether issue is still relevant |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Predefined Issues**:
1. Pest Infestation (High)
2. Disease (High)
3. Flood Damage (Critical)
4. Drought (High)
5. Low Yield (Medium)
6. Soil Issues (Medium)
7. Weed Overgrowth (Low)
8. Nutrient Deficiency (Medium)
9. Poor Drainage (Medium)
10. Weather Damage (High)
11. Equipment Issues (Low)
12. Labor Shortage (Medium)

---

### 3. **monitoring_history**

**Purpose**: Track all changes to monitoring records for audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `history_id` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `monitoring_id` | VARCHAR(50) | NOT NULL, FK | Reference to monitoring record |
| `action_type` | VARCHAR(20) | NOT NULL, CHECK | CREATE, UPDATE, DELETE |
| `changed_by` | VARCHAR(50) | NOT NULL | User who made the change |
| `changed_at` | TIMESTAMP | DEFAULT NOW() | When change occurred |
| `old_values` | JSONB | | Previous values (for UPDATE/DELETE) |
| `new_values` | JSONB | | New values (for CREATE/UPDATE) |
| `change_description` | TEXT | | Description of change |

**Indexes**:
- `idx_monitoring_history_monitoring_id` on `monitoring_id`
- `idx_monitoring_history_changed_at` on `changed_at`

---

### 4. **monitoring_alerts**

**Purpose**: Store notifications for monitoring events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `alert_id` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `monitoring_id` | VARCHAR(50) | NOT NULL, FK | Reference to monitoring record |
| `alert_type` | VARCHAR(50) | NOT NULL, CHECK | OVERDUE, UPCOMING, CRITICAL_CONDITION, ISSUE_DETECTED |
| `alert_message` | TEXT | NOT NULL | Alert message content |
| `severity` | VARCHAR(20) | CHECK | Low, Medium, High, Critical |
| `is_read` | BOOLEAN | DEFAULT FALSE | Whether alert has been read |
| `recipient_id` | VARCHAR(50) | FK | User who should receive alert |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Alert creation time |
| `read_at` | TIMESTAMP | | When alert was read |

**Indexes**:
- `idx_monitoring_alerts_recipient` on `recipient_id`
- `idx_monitoring_alerts_is_read` on `is_read`
- `idx_monitoring_alerts_created_at` on `created_at`

---

## Database Views

### 1. **monitoring_statistics**

**Purpose**: Quick access to monitoring statistics

```sql
SELECT 
    COUNT(*) as total_monitoring,
    COUNT(*) FILTER (WHERE farm_condition = 'Healthy') as healthy_farms,
    COUNT(*) FILTER (WHERE farm_condition = 'Needs Support') as needs_support,
    COUNT(*) FILTER (WHERE farm_condition = 'Damaged') as damaged_farms,
    COUNT(*) FILTER (WHERE next_monitoring_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) as upcoming_monitoring,
    COUNT(*) FILTER (WHERE next_monitoring_date < CURRENT_DATE) as overdue_monitoring,
    AVG(estimated_yield) as average_estimated_yield,
    COUNT(DISTINCT farmer_id) as total_farmers_monitored
FROM monitoring_records;
```

### 2. **farmer_monitoring_summary**

**Purpose**: Summary view for farmer dashboard

```sql
SELECT 
    farmer_id,
    farmer_name,
    COUNT(*) as total_visits,
    MAX(date_of_visit) as last_visit_date,
    MIN(next_monitoring_date) as next_visit_date,
    farm_condition as current_condition,
    growth_stage as current_growth_stage,
    AVG(estimated_yield) as average_yield,
    COUNT(*) FILTER (WHERE farm_condition = 'Healthy') as healthy_count,
    COUNT(*) FILTER (WHERE farm_condition = 'Needs Support') as needs_support_count,
    COUNT(*) FILTER (WHERE farm_condition = 'Damaged') as damaged_count
FROM monitoring_records
GROUP BY farmer_id, farmer_name, farm_condition, growth_stage;
```

---

## Database Functions

### 1. **update_monitoring_updated_at()**

**Purpose**: Automatically update `updated_at` timestamp on record modification

**Trigger**: `trigger_monitoring_updated_at` (BEFORE UPDATE)

### 2. **log_monitoring_changes()**

**Purpose**: Automatically log all changes to monitoring_history table

**Trigger**: `trigger_log_monitoring_changes` (AFTER INSERT/UPDATE/DELETE)

### 3. **generate_overdue_alerts()**

**Purpose**: Generate alerts for overdue monitoring visits

**Usage**: Call daily via cron job
```sql
SELECT generate_overdue_alerts();
```

### 4. **generate_upcoming_alerts()**

**Purpose**: Generate alerts for upcoming monitoring visits (within 7 days)

**Usage**: Call daily via cron job
```sql
SELECT generate_upcoming_alerts();
```

### 5. **get_farmer_monitoring_records(p_farmer_id VARCHAR)**

**Purpose**: Get all monitoring records for a specific farmer

**Returns**: Table with monitoring record details

**Usage**:
```sql
SELECT * FROM get_farmer_monitoring_records('F001');
```

### 6. **get_monitoring_stats_by_date(p_start_date DATE, p_end_date DATE)**

**Purpose**: Get monitoring statistics for a date range

**Returns**: Statistics table

**Usage**:
```sql
SELECT * FROM get_monitoring_stats_by_date('2024-01-01', '2024-12-31');
```

---

## Growth Stages

The system tracks 8 distinct growth stages:

1. **Land Preparation** - Initial field setup
2. **Planting** - Seedling installation
3. **Seedling** - Early growth phase (0-3 months)
4. **Vegetative** - Active growth period (3-6 months)
5. **Mature** - Full development (6-12 months)
6. **Ready for Harvest** - Optimal harvest time
7. **Harvesting** - Collection period
8. **Post-Harvest** - After collection

---

## Farm Conditions

Three-tier assessment system:

1. **Healthy** ✅
   - Farm in good condition
   - No immediate concerns
   - Following best practices

2. **Needs Support** ⚠️
   - Requires attention or assistance
   - Minor issues present
   - Preventive action needed

3. **Damaged** ❌
   - Significant issues present
   - Urgent action required
   - May need financial assistance

---

## API Endpoints

### GET Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/monitoring` | ✓ | Get all monitoring records (with filters) |
| `GET /api/monitoring/stats` | ✓ | Get monitoring statistics |
| `GET /api/monitoring/farmer/:farmerId` | ✓ | Get specific farmer's records |
| `GET /api/monitoring/:id` | ✓ | Get single monitoring record |
| `GET /api/monitoring/alerts/my` | ✓ | Get user's alerts |
| `GET /api/monitoring/issues/list` | ✓ | Get all monitoring issues |

### POST Endpoints

| Endpoint | Auth | Role | Description |
|----------|------|------|-------------|
| `POST /api/monitoring` | ✓ | Officer/Admin | Create new monitoring record |

### PUT Endpoints

| Endpoint | Auth | Role | Description |
|----------|------|------|-------------|
| `PUT /api/monitoring/:id` | ✓ | Officer/Admin | Update monitoring record |
| `PUT /api/monitoring/alerts/:alertId/read` | ✓ | Any | Mark alert as read |

### DELETE Endpoints

| Endpoint | Auth | Role | Description |
|----------|------|------|-------------|
| `DELETE /api/monitoring/:id` | ✓ | Officer/Admin | Delete monitoring record |

---

## Query Parameters

### GET /api/monitoring

| Parameter | Type | Description |
|-----------|------|-------------|
| `farmerId` | string | Filter by farmer ID |
| `dateFrom` | date | Filter from date |
| `dateTo` | date | Filter to date |
| `farmCondition` | string | Filter by condition |
| `growthStage` | string | Filter by growth stage |
| `monitoredBy` | string | Filter by monitor name |
| `limit` | number | Results limit (default: 100) |
| `offset` | number | Results offset (default: 0) |

---

## Data Flow

```
MAO Officer Visit → Create Monitoring Record → Database Storage
                                                      ↓
                                            Trigger: Log History
                                                      ↓
                                            Trigger: Update Timestamp
                                                      ↓
                                            Generate Alerts (if needed)
                                                      ↓
                                            Farmer Views Record
```

---

## Security & Permissions

### Role-Based Access

**Super Admin / MAO Officers**:
- ✅ Create monitoring records
- ✅ Update monitoring records
- ✅ Delete monitoring records
- ✅ View all monitoring records
- ✅ View statistics
- ✅ Export data

**Farmers**:
- ✅ View own monitoring records only
- ✅ View own alerts
- ❌ Cannot create/update/delete records

### Data Protection

1. **Foreign Key Constraints**: Ensure data integrity
2. **Check Constraints**: Validate data values
3. **Audit Trail**: All changes logged in history table
4. **Soft Deletes**: History preserved even after deletion
5. **Row-Level Security**: Farmers can only access their own data

---

## Maintenance Tasks

### Daily Tasks (Cron Jobs)

```sql
-- Generate overdue alerts (run at 8:00 AM)
SELECT generate_overdue_alerts();

-- Generate upcoming alerts (run at 8:00 AM)
SELECT generate_upcoming_alerts();
```

### Weekly Tasks

```sql
-- Clean old read alerts (older than 30 days)
DELETE FROM monitoring_alerts 
WHERE is_read = TRUE 
AND read_at < CURRENT_DATE - INTERVAL '30 days';
```

### Monthly Tasks

```sql
-- Archive old monitoring records (older than 2 years)
-- Move to archive table if needed
```

---

## Performance Optimization

### Indexes
- All frequently queried columns are indexed
- Composite indexes for common filter combinations
- Partial indexes for specific conditions

### Caching Strategy
- Statistics view can be materialized for better performance
- Frontend caching for 30 minutes
- API response caching for read-only endpoints

### Query Optimization
- Use prepared statements
- Limit result sets with pagination
- Use views for complex aggregations
- Avoid N+1 queries with JOINs

---

## Backup & Recovery

### Backup Strategy
```bash
# Daily backup
pg_dump -U postgres -d abaca_db -t monitoring_records > monitoring_backup_$(date +%Y%m%d).sql

# Weekly full backup
pg_dump -U postgres -d abaca_db > full_backup_$(date +%Y%m%d).sql
```

### Recovery
```bash
# Restore monitoring records
psql -U postgres -d abaca_db < monitoring_backup_20241105.sql
```

---

## Migration Instructions

### 1. Run Migration
```bash
psql -U postgres -d abaca_db -f create_monitoring_tables.sql
```

### 2. Verify Tables
```sql
\dt monitoring_*
```

### 3. Check Functions
```sql
\df *monitoring*
```

### 4. Test Queries
```sql
SELECT * FROM monitoring_statistics;
SELECT * FROM monitoring_issues;
```

---

## Troubleshooting

### Common Issues

**Issue**: Foreign key constraint violation
```sql
-- Check if farmer exists
SELECT id FROM users WHERE id = 'F001';
```

**Issue**: Date constraint violation
```sql
-- Ensure next_monitoring_date > date_of_visit
SELECT monitoring_id, date_of_visit, next_monitoring_date 
FROM monitoring_records 
WHERE next_monitoring_date <= date_of_visit;
```

**Issue**: Slow queries
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM monitoring_records WHERE farmer_id = 'F001';

-- Rebuild indexes if needed
REINDEX TABLE monitoring_records;
```

---

## Future Enhancements

Planned improvements:
- [ ] GPS coordinates for farm locations
- [ ] Photo upload and storage integration
- [ ] Mobile app sync support
- [ ] Weather API integration
- [ ] Predictive analytics for yield estimation
- [ ] Multi-language support
- [ ] Export to PDF reports
- [ ] SMS/Email notifications
- [ ] Integration with IoT sensors

---

**Version**: 1.0.0  
**Last Updated**: November 5, 2024  
**Status**: Production Ready ✅
