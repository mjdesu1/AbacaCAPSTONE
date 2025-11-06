# Frontend Routes to Add

## Add these routes to your App.tsx or router configuration

```typescript
import HarvestSubmissionPage from './pages/HarvestSubmissionPage';
import FarmerHarvestsPage from './pages/FarmerHarvestsPage';
// Import other pages as you create them

// In your router:
<Routes>
  {/* FARMER ROUTES */}
  <Route path="/farmer/harvests" element={<FarmerHarvestsPage />} />
  <Route path="/farmer/harvest/submit" element={<HarvestSubmissionPage />} />
  <Route path="/farmer/harvest/:harvestId" element={<HarvestDetailPage />} />
  <Route path="/farmer/harvest/edit/:harvestId" element={<HarvestEditPage />} />

  {/* MAO/ADMIN ROUTES */}
  <Route path="/mao/harvests" element={<MAOHarvestVerificationPage />} />
  <Route path="/mao/harvest/:harvestId" element={<MAOHarvestDetailPage />} />
  <Route path="/mao/inventory" element={<MAOInventoryPage />} />
  <Route path="/mao/inventory/add/:harvestId" element={<MAOInventoryAddPage />} />
  <Route path="/mao/distributions" element={<MAODistributionPage />} />
  <Route path="/mao/distribution/create" element={<MAODistributionCreatePage />} />

  {/* SUPER ADMIN ROUTES */}
  <Route path="/admin/harvests" element={<SuperAdminHarvestDashboard />} />
  <Route path="/admin/inventory" element={<SuperAdminInventoryDashboard />} />
  <Route path="/admin/reports" element={<SuperAdminReportsPage />} />
</Routes>
```

## Navigation Menu Items

### Farmer Menu
```typescript
{
  label: 'My Harvests',
  path: '/farmer/harvests',
  icon: '🌾'
},
{
  label: 'Submit Harvest',
  path: '/farmer/harvest/submit',
  icon: '➕'
}
```

### MAO/Admin Menu
```typescript
{
  label: 'Verify Harvests',
  path: '/mao/harvests',
  icon: '✅'
},
{
  label: 'Inventory',
  path: '/mao/inventory',
  icon: '📦'
},
{
  label: 'Distributions',
  path: '/mao/distributions',
  icon: '🚚'
}
```

### Super Admin Menu
```typescript
{
  label: 'All Harvests',
  path: '/admin/harvests',
  icon: '🌾'
},
{
  label: 'All Inventory',
  path: '/admin/inventory',
  icon: '📦'
},
{
  label: 'Reports',
  path: '/admin/reports',
  icon: '📊'
}
```

## Protected Route Example

```typescript
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Usage:
<Route 
  path="/farmer/harvests" 
  element={
    <ProtectedRoute allowedRoles={['farmer']}>
      <FarmerHarvestsPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/mao/harvests" 
  element={
    <ProtectedRoute allowedRoles={['officer']}>
      <MAOHarvestVerificationPage />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin/harvests" 
  element={
    <ProtectedRoute allowedRoles={['officer']} requireSuperAdmin={true}>
      <SuperAdminHarvestDashboard />
    </ProtectedRoute>
  } 
/>
```

## API Helper Functions

Create a file: `frontend/src/utils/api.ts`

```typescript
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Get auth headers
  getHeaders: () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }),

  // Farmer endpoints
  farmer: {
    submitHarvest: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/harvests/farmer/harvests`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(data)
      });
      return response.json();
    },

    getMyHarvests: async (status?: string) => {
      const url = status 
        ? `${API_BASE_URL}/harvests/farmer/harvests?status=${status}`
        : `${API_BASE_URL}/harvests/farmer/harvests`;
      const response = await fetch(url, {
        headers: api.getHeaders()
      });
      return response.json();
    },

    getMyStatistics: async () => {
      const response = await fetch(`${API_BASE_URL}/harvests/farmer/harvests/statistics`, {
        headers: api.getHeaders()
      });
      return response.json();
    }
  },

  // MAO endpoints
  mao: {
    getHarvests: async (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/harvests/mao/harvests?${params}`, {
        headers: api.getHeaders()
      });
      return response.json();
    },

    verifyHarvest: async (harvestId: string, notes: string) => {
      const response = await fetch(`${API_BASE_URL}/harvests/mao/harvests/${harvestId}/verify`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ verification_notes: notes })
      });
      return response.json();
    },

    rejectHarvest: async (harvestId: string, notes: string) => {
      const response = await fetch(`${API_BASE_URL}/harvests/mao/harvests/${harvestId}/reject`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ verification_notes: notes })
      });
      return response.json();
    },

    addToInventory: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/inventory/inventory`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(data)
      });
      return response.json();
    },

    getInventory: async (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/inventory/inventory?${params}`, {
        headers: api.getHeaders()
      });
      return response.json();
    },

    createDistribution: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/inventory/distributions`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(data)
      });
      return response.json();
    }
  },

  // Super Admin endpoints
  admin: {
    getAllHarvests: async (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/harvests/admin/harvests/all?${params}`, {
        headers: api.getHeaders()
      });
      return response.json();
    },

    getAllInventory: async (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/inventory/admin/inventory/all?${params}`, {
        headers: api.getHeaders()
      });
      return response.json();
    }
  }
};
```

## Usage Example

```typescript
import { api } from '../utils/api';

// In your component:
const fetchHarvests = async () => {
  try {
    const data = await api.farmer.getMyHarvests();
    setHarvests(data.harvests);
  } catch (error) {
    console.error('Error:', error);
  }
};

const submitHarvest = async (formData) => {
  try {
    const result = await api.farmer.submitHarvest(formData);
    alert('Harvest submitted successfully!');
  } catch (error) {
    alert('Failed to submit harvest');
  }
};
```
