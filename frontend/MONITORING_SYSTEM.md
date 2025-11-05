# Field Monitoring System

## Overview
The Field Monitoring System enables MAO officers to track farm visits, monitor crop growth stages, record farmer activities, and schedule follow-up visits for optimal agricultural support.

## Features

### 1. **Monitoring Form**
Comprehensive data collection for field visits:

#### Auto-Generated Fields
- **Monitoring ID**: Unique identifier (format: `MON-{timestamp}-{random}`)

#### Required Fields
- **Date of Visit**: When the monitoring was conducted
- **Monitored By**: Name/role of the person conducting the visit (e.g., High Value Coordinator)
- **Farmer/Association Name**: Who is being monitored
- **Farm Condition**: Health status (Healthy / Needs Support / Damaged)
- **Growth Stage**: Current crop development stage
- **Actions Taken**: What was done during the visit
- **Recommendations**: Advice given to the farmer
- **Next Monitoring Date**: Scheduled follow-up visit

#### Optional Fields
- **Farm Location**: Specific location details
- **Issues Observed**: Multiple selection from common issues
- **Weather Condition**: Current weather during visit
- **Estimated Yield**: Expected harvest amount (kg)
- **Additional Remarks**: Any extra notes

### 2. **Growth Stages**
Track abaca crop development through 8 stages:
1. **Land Preparation** - Initial field setup
2. **Planting** - Seedling installation
3. **Seedling** - Early growth phase
4. **Vegetative** - Active growth period
5. **Mature** - Full development
6. **Ready for Harvest** - Optimal harvest time
7. **Harvesting** - Collection period
8. **Post-Harvest** - After collection

### 3. **Farm Conditions**
Three-tier assessment system:
- **Healthy** ✅ - Farm in good condition, no immediate concerns
- **Needs Support** ⚠️ - Requires attention or assistance
- **Damaged** ❌ - Significant issues requiring urgent action

### 4. **Common Issues Tracking**
Pre-defined issue categories for quick selection:
- Pest Infestation
- Disease
- Flood Damage
- Drought
- Low Yield
- Soil Issues
- Weed Overgrowth
- Nutrient Deficiency
- Poor Drainage
- Weather Damage
- Equipment Issues
- Labor Shortage
- Other (with custom description)

### 5. **Dashboard Features**

#### Statistics Overview
- **Total Monitoring**: All recorded visits
- **Healthy Farms**: Farms in good condition
- **Needs Support**: Farms requiring assistance
- **Upcoming Visits**: Scheduled within 7 days
- **Overdue Visits**: Past scheduled date

#### Filtering & Search
- Search by farmer name, monitoring ID, or monitored by
- Filter by farm condition
- Filter by date range
- Filter by growth stage
- Filter by monitoring officer

#### Tab Views
- **All Records**: Complete monitoring history
- **Upcoming**: Visits scheduled within 7 days
- **Overdue**: Visits past their scheduled date

#### Export Functionality
- Export filtered records to CSV
- Includes all relevant monitoring data
- Timestamped filename for organization

## Technical Implementation

### Type Definitions (`types/monitoring.ts`)

```typescript
interface MonitoringRecord {
  monitoringId: string;
  dateOfVisit: string;
  monitoredBy: string;
  farmerId: string;
  farmerName: string;
  associationName?: string;
  farmCondition: FarmCondition;
  growthStage: GrowthStage;
  issuesObserved: string[];
  actionsTaken: string;
  recommendations: string;
  nextMonitoringDate: string;
  // ... additional fields
}
```

### Helper Functions (`utils/monitoringHelpers.ts`)

#### ID Generation
```typescript
generateMonitoringId(): string
// Returns: "MON-1730793600000-123"
```

#### Date Utilities
```typescript
formatDate(dateString: string): string
// Returns: "November 5, 2024"

daysUntilMonitoring(nextDate: string): number
// Returns: Number of days (negative if overdue)

isOverdue(nextDate: string): boolean
isUpcoming(nextDate: string): boolean
```

#### Statistics
```typescript
calculateStats(records: MonitoringRecord[]): MonitoringStats
// Returns comprehensive statistics object
```

#### Filtering & Sorting
```typescript
filterRecords(records, filters): MonitoringRecord[]
sortByDate(records): MonitoringRecord[]
getUpcomingMonitoring(records): MonitoringRecord[]
getOverdueMonitoring(records): MonitoringRecord[]
```

#### Validation
```typescript
validateMonitoringForm(data): { valid: boolean; errors: string[] }
// Validates all required fields and business logic
```

#### Export
```typescript
exportToCSV(records): string
downloadCSV(records, filename): void
```

### Components

#### MonitoringForm Component
**Props:**
- `onSubmit`: Callback for form submission
- `onCancel`: Callback for cancellation
- `initialData`: Pre-fill data for editing
- `farmersList`: Optional list for farmer selection

**Features:**
- Auto-fill farmer details when selected
- Multi-select issue checkboxes
- Date validation (next visit must be after current visit)
- Real-time error display
- Success message with auto-close
- Responsive design

#### MonitoringDashboard Component
**Props:**
- `records`: Array of monitoring records
- `onAddRecord`: Handler for new records
- `onUpdateRecord`: Handler for updates
- `onDeleteRecord`: Handler for deletions
- `farmersList`: Optional farmer list

**Features:**
- Real-time statistics calculation
- Advanced filtering and search
- Tab-based navigation
- Responsive card layout
- Modal forms for add/edit
- Detail view modal
- CSV export

## Performance Optimizations

### 1. **Memoization**
```typescript
const stats = useMemo(() => calculateStats(records), [records]);
const filteredRecords = useMemo(() => {
  // Complex filtering logic
}, [records, filters, searchQuery, activeTab]);
```

### 2. **Efficient Filtering**
- Single-pass filtering algorithm
- Early return optimization
- Indexed lookups where possible

### 3. **Lazy Loading**
- Forms load only when needed
- Modals render conditionally
- Images lazy-loaded (if implemented)

### 4. **Optimized Rendering**
- Key-based list rendering
- Conditional component mounting
- Minimal re-renders with proper dependencies

### 5. **Data Caching**
Integration with cookie manager for caching:
```typescript
import { cacheData, getCachedData } from '../utils/cookieManager';

// Cache monitoring records
cacheData('monitoring_records', records, 30); // 30 minutes

// Retrieve cached data
const cached = getCachedData('monitoring_records');
```

## Usage Examples

### Basic Implementation

```typescript
import MonitoringDashboard from './components/MAO/MonitoringDashboard';

function MAOPage() {
  const [records, setRecords] = useState<MonitoringRecord[]>([]);

  const handleAddRecord = async (data) => {
    const newRecord = {
      ...data,
      monitoringId: generateMonitoringId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to backend
    await api.post('/monitoring', newRecord);
    setRecords([...records, newRecord]);
  };

  const handleUpdateRecord = async (id, data) => {
    await api.put(`/monitoring/${id}`, data);
    setRecords(records.map(r => r.monitoringId === id ? { ...r, ...data } : r));
  };

  const handleDeleteRecord = async (id) => {
    await api.delete(`/monitoring/${id}`);
    setRecords(records.filter(r => r.monitoringId !== id));
  };

  return (
    <MonitoringDashboard
      records={records}
      onAddRecord={handleAddRecord}
      onUpdateRecord={handleUpdateRecord}
      onDeleteRecord={handleDeleteRecord}
      farmersList={farmers}
    />
  );
}
```

### Standalone Form Usage

```typescript
import MonitoringForm from './components/MAO/MonitoringForm';

function AddMonitoringPage() {
  const handleSubmit = async (data) => {
    await api.post('/monitoring', data);
    navigate('/monitoring');
  };

  return (
    <div className="p-4">
      <MonitoringForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/monitoring')}
        farmersList={farmers}
      />
    </div>
  );
}
```

## Best Practices

### For MAO Officers

1. **Timely Recording**: Enter monitoring data immediately after field visits
2. **Complete Information**: Fill all required fields thoroughly
3. **Accurate Assessment**: Be honest about farm conditions
4. **Specific Issues**: Select all relevant issues observed
5. **Actionable Recommendations**: Provide clear, practical advice
6. **Schedule Follow-ups**: Set realistic next monitoring dates (7-14 days recommended)

### For Developers

1. **Validation**: Always validate form data before submission
2. **Error Handling**: Implement proper error messages and recovery
3. **Loading States**: Show loading indicators during async operations
4. **Confirmation**: Require confirmation for destructive actions
5. **Caching**: Use cookie manager for performance optimization
6. **Accessibility**: Ensure forms are keyboard-navigable
7. **Responsive**: Test on various screen sizes

## Data Flow

```
User Action → Form Validation → API Call → State Update → UI Refresh
     ↓              ↓               ↓            ↓            ↓
  Input      Check Required    POST/PUT    Update Array   Re-render
  Change      Fields & Logic   /DELETE     with New Data   Dashboard
```

## API Integration

### Expected Endpoints

```typescript
// Create monitoring record
POST /api/monitoring
Body: MonitoringFormData
Response: MonitoringRecord

// Get all monitoring records
GET /api/monitoring
Query: ?farmerId=xxx&dateFrom=xxx&dateTo=xxx
Response: MonitoringRecord[]

// Get single record
GET /api/monitoring/:id
Response: MonitoringRecord

// Update record
PUT /api/monitoring/:id
Body: Partial<MonitoringFormData>
Response: MonitoringRecord

// Delete record
DELETE /api/monitoring/:id
Response: { success: boolean }

// Get statistics
GET /api/monitoring/stats
Response: MonitoringStats
```

## Future Enhancements

Planned improvements:
- Photo upload for farm conditions
- GPS location tracking
- Offline mode with sync
- Push notifications for upcoming visits
- Weather API integration
- Yield prediction analytics
- Mobile app version
- QR code scanning for farmer identification
- Voice-to-text for notes
- Multi-language support

## Troubleshooting

### Common Issues

**Form won't submit**
- Check all required fields are filled
- Verify next monitoring date is after visit date
- Check network connection

**Records not showing**
- Clear filters and search
- Check date range filters
- Refresh the page

**Export not working**
- Check browser allows downloads
- Ensure records are loaded
- Try different browser

## Support

For questions or issues:
- Email: mao.culiram@talacogon.gov.ph
- Phone: (085) 123-4567
- Address: Barangay Culiram, Talacogon, Agusan del Sur

---

**Last Updated**: November 5, 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
