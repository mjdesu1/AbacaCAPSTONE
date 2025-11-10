# Database Tables Summary

## Two Types of Officers

### 1. **MAO Officers** (`organization` table)
**Purpose:** Government agricultural office personnel

**Fields:**
- Officer ID (auto-generated UUID)
- Full Name
- Email (unique)
- Password Hash
- **Position** (e.g., High Value Crops Coordinator, Agricultural Technologist)
- **Office Name** (e.g., Municipal Agriculture Office, Talacogon)
- **Assigned Municipality** (e.g., Talacogon)
- **Assigned Barangay** (e.g., Barangay Poblacion, San Isidro)
- Contact Number
- Address
- Profile Picture
- Profile Completed (boolean)
- Is Active (boolean)
- Is Verified (boolean)
- Is Super Admin (boolean)
- Verification Status (pending/verified/rejected)
- Timestamps (created_at, updated_at, last_login, profile_completed_at)
- Remarks

**Access:**
- Created by Super Admin via dashboard
- Login only (no public registration)
- Must complete profile on first login if created by admin

---

### 2. **Association Officers** (`association_officers` table)
**Purpose:** Farmer association officers (President, Vice President, Treasurer, etc.)

**Fields:**
- Officer ID (auto-generated UUID)
- Full Name
- Email (unique)
- Password Hash
- **Position** (President, Vice President, Treasurer, Secretary, etc.)
- **Association Name** (Name of the farmer association)
- Contact Number
- Address
- **Term Start Date**
- **Term End Date**
- **Term Duration** (e.g., 2024-2027)
- **Farmers Under Supervision** (number of farmers)
- Profile Picture
- Valid ID Photo
- Is Active (boolean)
- Is Verified (boolean - default false)
- Verification Status (pending/verified/rejected)
- Verified By (MAO officer who verified)
- Verified At (timestamp)
- Rejection Reason
- Timestamps (created_at, updated_at, last_login)
- Remarks

**Access:**
- Public registration (self-register)
- Requires verification by MAO officer
- Can login after verification

---

## User Management Dashboard

### Tabs:
1. **Farmers** - View/manage farmer accounts
2. **Buyers** - View/manage buyer accounts  
3. **Officers** - View/manage MAO officers (organization table)
4. **Association Officers** - View/manage association officers (NEW)

### Features per tab:
- View all accounts
- Search/filter
- View details
- Verify/reject (for pending accounts)
- Edit information
- Delete accounts

---

## Authentication Flow

### MAO Officers:
1. Super Admin creates account
2. Officer logs in
3. Complete profile (if not completed)
4. Access dashboard

### Association Officers:
1. Self-register via public form
2. Account status: pending
3. MAO officer reviews and approves/rejects
4. Once approved, can login
5. Access dashboard

---

## Database Migration Files

1. `rename_association_officers_to_organization.sql` - Renames old table to organization
2. `create_association_officers_table.sql` - Creates new association_officers table
3. `create_admin_accounts.sql` - Creates super admin and admin accounts

---

## Next Steps

1. ✅ Database schema updated
2. ✅ Migration files created
3. ⏳ Backend API for association officers (register, login, CRUD)
4. ⏳ Frontend registration form for association officers
5. ⏳ User Management tab for association officers
6. ⏳ Verification workflow for association officers
