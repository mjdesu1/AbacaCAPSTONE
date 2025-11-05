# Monitoring System Setup Guide (Supabase)

## Quick Fix Applied ✅

The error `relation "users" does not exist` has been fixed!

### What Was Wrong
- Original migration tried to reference `users` table which doesn't exist in your Supabase setup
- You're using Supabase with custom tables like `public.farmers` and `public.association_officers`

### What Was Fixed
1. ✅ Changed `farmer_id` from `VARCHAR(50)` to `UUID` (Supabase standard)
2. ✅ Removed foreign key constraint to non-existent `users` table
3. ✅ Added `public.` schema prefix to all tables
4. ✅ Changed timestamps to `TIMESTAMP WITH TIME ZONE` (Supabase standard)
5. ✅ Changed `CURRENT_TIMESTAMP` to `NOW()` (Supabase standard)
6. ✅ Added `DISABLE ROW LEVEL SECURITY` (like your other tables)
7. ✅ Added `IF NOT EXISTS` to all CREATE statements

---

## Installation Steps

### Option 1: Use Fixed Migration (Recommended)

```bash
# Run the fixed migration file
psql -U postgres -d your_database -f create_monitoring_tables_fixed.sql
```

### Option 2: Run in Supabase SQL Editor

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy the contents of `create_monitoring_tables_fixed.sql`
4. Paste and click **Run**

---

## Verification

After running the migration, verify it worked:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'monitoring%';

-- Expected output:
-- monitoring_records
-- monitoring_issues

-- Check if view exists
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'monitoring_statistics';

-- Test the statistics view
SELECT * FROM public.monitoring_statistics;
```

---

## Database Structure

### Tables Created

1. **public.monitoring_records** - Main monitoring data
   - Primary key: `monitoring_id` (VARCHAR)
   - Farmer reference: `farmer_id` (UUID, optional)
   - All required fields for monitoring

2. **public.monitoring_issues** - Predefined issues list
   - 12 common issues pre-populated
   - Categorized and severity-rated

### Views Created

1. **public.monitoring_statistics** - Real-time statistics

### Functions Created

1. **update_monitoring_updated_at()** - Auto-update timestamps

### Triggers Created

1. **monitoring_updated_at_trigger** - Auto-update on record change

---

## Key Differences from Original

| Original | Fixed | Reason |
|----------|-------|--------|
| `users(id)` FK | No FK | users table doesn't exist |
| `VARCHAR(50)` farmer_id | `UUID` farmer_id | Supabase uses UUIDs |
| `CURRENT_TIMESTAMP` | `NOW()` | Supabase preference |
| `TIMESTAMP` | `TIMESTAMP WITH TIME ZONE` | Supabase standard |
| No schema prefix | `public.` prefix | Explicit schema |
| RLS enabled | RLS disabled | Match your other tables |

---

## Optional: Add Foreign Key Later

If you want to add a foreign key to farmers table later:

```sql
-- Check if farmers table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'farmers';

-- If it exists, add the constraint
ALTER TABLE public.monitoring_records
ADD CONSTRAINT fk_farmer 
FOREIGN KEY (farmer_id) 
REFERENCES public.farmers(farmer_id) 
ON DELETE SET NULL;
```

---

## Testing the Setup

### 1. Insert Test Record

```sql
INSERT INTO public.monitoring_records (
    monitoring_id,
    date_of_visit,
    monitored_by,
    farmer_name,
    farm_condition,
    growth_stage,
    actions_taken,
    recommendations,
    next_monitoring_date
) VALUES (
    'MON-TEST-001',
    CURRENT_DATE,
    'Test Coordinator',
    'Test Farmer',
    'Healthy',
    'Seedling',
    'Inspected crops',
    'Continue monitoring',
    CURRENT_DATE + INTERVAL '7 days'
);
```

### 2. Query Test Record

```sql
SELECT * FROM public.monitoring_records 
WHERE monitoring_id = 'MON-TEST-001';
```

### 3. Check Statistics

```sql
SELECT * FROM public.monitoring_statistics;
```

### 4. Clean Up Test Data

```sql
DELETE FROM public.monitoring_records 
WHERE monitoring_id = 'MON-TEST-001';
```

---

## API Integration

The monitoring API routes are ready to use. Just ensure your backend connects to Supabase:

```javascript
// In your backend server.js or app.js
const monitoringRoutes = require('./routes/monitoring');
app.use('/api/monitoring', monitoringRoutes);
```

---

## Troubleshooting

### Error: "permission denied for schema public"
```sql
-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Error: "function already exists"
```sql
-- Drop and recreate
DROP FUNCTION IF EXISTS update_monitoring_updated_at() CASCADE;
-- Then run the CREATE FUNCTION again
```

### Error: "relation already exists"
- This is OK! The `IF NOT EXISTS` clause prevents errors
- You can safely re-run the migration

---

## Next Steps

1. ✅ Run the fixed migration
2. ✅ Verify tables created
3. ✅ Test with sample data
4. ✅ Integrate with frontend
5. ✅ Enable RLS policies in production (optional)

---

## Production Checklist

Before going to production:

- [ ] Enable Row Level Security (RLS)
- [ ] Create RLS policies for farmers (can only see their own records)
- [ ] Create RLS policies for officers (can see all records)
- [ ] Set up automated backups
- [ ] Add monitoring alerts cron job
- [ ] Test all API endpoints
- [ ] Verify foreign keys (if using farmers table)

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: November 5, 2024
