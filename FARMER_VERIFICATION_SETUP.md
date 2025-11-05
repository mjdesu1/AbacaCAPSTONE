# 🌾 FARMER VERIFICATION SYSTEM - SETUP COMPLETE

## ✅ Changes Made

### 1. Database Migration
**File:** `backend/database/migrations/add_farmer_verification_fields.sql`

**New Fields Added to `farmers` table:**
- `profile_photo` TEXT - Farmer's profile photo (base64 or URL)
- `valid_id_photo` TEXT - Valid ID for verification (base64 or URL)
- `verification_status` VARCHAR(20) - Status: 'pending', 'verified', 'rejected'
- `verified_by` UUID - Officer who verified/rejected
- `verified_at` TIMESTAMP - When verification was done
- `rejection_reason` TEXT - Reason if rejected

**Run this SQL in Supabase:**
```sql
-- Copy entire content from:
backend/database/migrations/add_farmer_verification_fields.sql
```

---

### 2. Backend Updates

#### Types Updated (`backend/src/types/index.ts`):
```typescript
export interface FarmerRegistration {
  // ... existing fields ...
  profilePhoto?: string; // NEW
  validIdPhoto?: string; // NEW
}

export interface Farmer {
  // ... existing fields ...
  verificationStatus?: 'pending' | 'verified' | 'rejected'; // NEW
  verifiedBy?: string; // NEW
  verifiedAt?: string; // NEW
  rejectionReason?: string; // NEW
}
```

#### AuthService Updated:
- ✅ Farmer registration now saves photos
- ✅ Sets `verification_status` to 'pending' by default
- ✅ Sets `is_verified` to false until admin approves

#### UserManagementController Updated:
- ✅ `verifyFarmer()` - Now tracks who verified and when
- ✅ `rejectFarmer()` - Requires rejection reason
- ✅ Both update verification_status properly

---

### 3. Verification Workflow

```
┌─────────────────────────────────────────────────────────┐
│                  FARMER REGISTRATION                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Farmer fills form + uploads: │
          │  • Profile Photo              │
          │  • Valid ID Photo             │
          └───────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Status: PENDING              │
          │  is_verified: false           │
          │  Can't login yet ❌           │
          └───────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Show Success Message:        │
          │  "Wait for verification"      │
          │  "We'll contact you"          │
          └───────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │  ADMIN REVIEWS APPLICATION    │
          │  • Views profile photo        │
          │  • Views valid ID             │
          │  • Checks information         │
          └───────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
    ┌─────────────────┐    ┌─────────────────┐
    │   VERIFY ✅     │    │   REJECT ❌     │
    └─────────────────┘    └─────────────────┘
              │                       │
              ▼                       ▼
    ┌─────────────────┐    ┌─────────────────┐
    │ Status: verified│    │ Status: rejected│
    │ is_verified:true│    │ is_verified:false│
    │ Can login! ✅   │    │ Can't login ❌  │
    │                 │    │ + Reason shown  │
    └─────────────────┘    └─────────────────┘
```

---

## 🎯 Frontend Implementation Needed

### 1. Registration Form (Add Photo Upload)
**File:** `frontend/src/pages/FarmerRegistration.tsx` (or similar)

```tsx
// Add these states
const [profilePhoto, setProfilePhoto] = useState<string>('');
const [validIdPhoto, setValidIdPhoto] = useState<string>('');

// Add file upload handlers
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'id') => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'profile') {
        setProfilePhoto(base64);
      } else {
        setValidIdPhoto(base64);
      }
    };
    reader.readAsDataURL(file);
  }
};

// Add to registration form
<div>
  <label>Profile Photo *</label>
  <input 
    type="file" 
    accept="image/*"
    onChange={(e) => handlePhotoUpload(e, 'profile')}
    required
  />
  {profilePhoto && <img src={profilePhoto} alt="Preview" className="w-32 h-32" />}
</div>

<div>
  <label>Valid ID Photo *</label>
  <input 
    type="file" 
    accept="image/*"
    onChange={(e) => handlePhotoUpload(e, 'id')}
    required
  />
  {validIdPhoto && <img src={validIdPhoto} alt="Preview" className="w-32 h-32" />}
</div>

// Include in registration payload
const response = await fetch('/api/auth/register/farmer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...formData,
    profilePhoto,
    validIdPhoto,
  }),
});
```

### 2. Success Message After Registration
```tsx
// After successful registration
if (response.ok) {
  // Show success modal/page
  setShowSuccessModal(true);
}

// Success Modal Component
<div className="modal">
  <div className="success-icon">✅</div>
  <h2>Registration Submitted!</h2>
  <p>Your application is now pending verification.</p>
  <div className="info-box">
    <p>📧 We'll contact you via email or phone once your account is verified.</p>
    <p>⏱️ Verification usually takes 1-3 business days.</p>
    <p>📞 For urgent concerns, contact: support@mao.gov.ph</p>
  </div>
  <button onClick={() => navigate('/')}>Go to Homepage</button>
</div>
```

### 3. Admin Farmer Management (View Photos)
**File:** `frontend/src/components/MAO/FarmerManagement.tsx`

```tsx
// In farmer details modal, add photo display
<div className="verification-photos">
  <div>
    <h4>Profile Photo</h4>
    {farmer.profilePhoto ? (
      <img src={farmer.profilePhoto} alt="Profile" className="w-48 h-48 object-cover" />
    ) : (
      <p>No photo uploaded</p>
    )}
  </div>
  
  <div>
    <h4>Valid ID</h4>
    {farmer.validIdPhoto ? (
      <img src={farmer.validIdPhoto} alt="Valid ID" className="w-full max-w-md" />
    ) : (
      <p>No ID uploaded</p>
    )}
  </div>
</div>

// Verification status badge
<span className={`badge ${
  farmer.verificationStatus === 'verified' ? 'bg-green-500' :
  farmer.verificationStatus === 'rejected' ? 'bg-red-500' :
  'bg-yellow-500'
}`}>
  {farmer.verificationStatus?.toUpperCase()}
</span>

// Reject modal with reason input
<div className="reject-modal">
  <h3>Reject Application</h3>
  <textarea
    placeholder="Enter rejection reason (required)"
    value={rejectionReason}
    onChange={(e) => setRejectionReason(e.target.value)}
    required
  />
  <button onClick={handleReject}>Confirm Rejection</button>
</div>

// Reject handler
const handleReject = async () => {
  const response = await fetch(`/api/mao/farmers/${farmerId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: rejectionReason }),
  });
  
  if (response.ok) {
    alert('Farmer application rejected');
    fetchFarmers(); // Refresh list
  }
};
```

---

## 📋 Testing Checklist

### Backend:
- [ ] Run migration SQL in Supabase
- [ ] Verify new columns exist in farmers table
- [ ] Test farmer registration with photos
- [ ] Test verify endpoint
- [ ] Test reject endpoint with reason

### Frontend:
- [ ] Add photo upload to registration form
- [ ] Show success message after registration
- [ ] Display verification status in farmer list
- [ ] Show photos in admin farmer details
- [ ] Add reject modal with reason input
- [ ] Test full verification workflow

---

## 🔔 Notification System (Future Enhancement)

### Email Notifications:
```typescript
// When verified
sendEmail({
  to: farmer.email,
  subject: 'Account Verified - MAO Culiram',
  body: `
    Congratulations! Your farmer account has been verified.
    You can now login at: https://mao-culiram.com/login
  `
});

// When rejected
sendEmail({
  to: farmer.email,
  subject: 'Account Application - Action Required',
  body: `
    Your application was not approved.
    Reason: ${rejectionReason}
    Please contact us for more information.
  `
});
```

### SMS Notifications (Optional):
- Use Semaphore or similar SMS API
- Send verification status updates

---

## 🎉 Summary

**What's Working:**
- ✅ Database schema updated
- ✅ Backend handles photo upload
- ✅ Verification workflow implemented
- ✅ Admin can verify/reject with tracking

**What's Needed:**
- 📝 Frontend photo upload UI
- 📝 Success message after registration
- 📝 Admin UI to view photos
- 📝 Rejection reason modal

**Next Steps:**
1. Run the migration SQL
2. Implement frontend photo upload
3. Add success message
4. Update admin farmer management UI
5. Test complete workflow

---

**Estimated Time:** 2-3 hours for frontend implementation
