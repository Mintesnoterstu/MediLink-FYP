# **State Management Explanation: Dashboard & Disease Library Pages**

## **1. Health Dashboard Page States**

### **State Management Architecture**

The Dashboard uses a **hybrid state management approach** combining:
- **Context API** (HealthDataContext) for global health data
- **Local component state** via `useMemo` for computed/derived data
- **Props** for optional external data injection

### **Primary States**

#### **A. Loading State**
```typescript
isLoading: boolean
```
- **Source**: `HealthDataContext` or props (`propIsLoading`)
- **Priority**: Props override context
- **UI**: Shows `<LoadingSpinner>` when `true`
- **Triggers**: 
  - Initial page load
  - When `loadPatientData()`, `loadAIRecommendations()`, or `loadAppointments()` are called

#### **B. Data States**

**1. Patient Data State**
```typescript
patientData: PatientData | null
```
- **Source**: `HealthDataContext.patientData` OR `propPatientData` (props take priority)
- **Contains**:
  - `vitalSigns[]` - Latest vitals (BP, heart rate, temperature, weight)
  - `currentMedications[]` - Active medications
  - `medicalHistory[]` - Past diagnoses
  - `appointments[]` - All appointments
  - `consentRecords[]` - Provider access permissions
- **Fallback**: If null, sections show empty states

**2. Appointments State**
```typescript
appointments: Appointment[]
```
- **Source**: `HealthDataContext.appointments` OR `patientData.appointments`
- **Derived States**:
  - `upcomingAppointments` - Filtered by status='scheduled' and future dates
  - `appointmentHistory` - Filtered by status='completed', sorted by date

**3. AI Recommendations State**
```typescript
aiRecommendations: AIRecommendation[]
```
- **Source**: `HealthDataContext.aiRecommendations` OR `propAIRecommendations`
- **Display**: Shows top 3 recommendations

### **Computed/Derived States (useMemo)**

#### **1. Health Score (0-100)**
```typescript
healthScore: number
```
- **Calculation Logic**:
  - Base: 70 points
  - Blood Pressure: +10 (normal) or -15 (high)
  - Heart Rate: +10 (normal 60-100) or -5 (abnormal)
  - Temperature: +10 (normal 36.1-37.2°C) or -10 (abnormal)
  - Medication Adherence: +0 to +10 (based on average adherence %)
- **Color Coding**:
  - ≥80: Green (success)
  - 60-79: Yellow (warning)
  - <60: Red (error)

#### **2. Medication Adherence**
```typescript
medicationAdherence: MedicationAdherence[]
```
- **Computed from**: `patientData.currentMedications`
- **Mock Calculation** (currently):
  - Total doses: 30
  - Missed doses: Random 0-4
  - Adherence rate: `((total - missed) / total) * 100`
- **Visual**: Progress bars with color coding

#### **3. Health Trends**
```typescript
healthTrends: HealthTrend[]
```
- **Computed from**: `patientData.vitalSigns`
- **Currently**: Heart rate trend (last 7 days)
- **Display**: Line chart via Recharts
- **Trend indicators**: Improving (↑), Stable (—), Declining (↓)

#### **4. Active Conditions**
```typescript
activeConditions: string[]
```
- **Computed from**: `patientData.medicalHistory`
- **Filter**: Records within last 90 days
- **Display**: Chips showing diagnosis names

#### **5. Recent Activity Timeline**
```typescript
recentActivity: Array<{type, title, date, icon}>
```
- **Sources**: 
  - Upcoming appointments (first 3)
  - Current medications (first 2)
- **Sorted**: By date (newest first)
- **Display**: List with icons and dates

#### **6. Recent Lab Results** (Mock)
```typescript
recentLabResults: Array<{name, value, status, date}>
```
- **Currently**: Hardcoded mock data
- **Status**: 'normal' or 'warning'
- **Future**: Will come from API

#### **7. Vaccination Reminders** (Mock)
```typescript
vaccinationReminders: Array<{name, dueDate, status}>
```
- **Currently**: Hardcoded mock data
- **Display**: Days until due date
- **Future**: Will come from API

### **Empty States**

Each section handles empty data gracefully:

1. **No Vital Signs**: Health metrics section shows nothing
2. **No Medications**: Shows "No current medications"
3. **No Appointments**: Shows "No upcoming appointments"
4. **No AI Recommendations**: Shows "No recommendations yet"
5. **No Recent Activity**: Shows "No recent activity"
6. **No Active Conditions**: Shows "No active conditions"
7. **No Lab Results**: Shows "No lab results available"

### **State Flow Diagram**

```
User visits /dashboard
    ↓
useEffect triggers (if user.id exists)
    ↓
loadPatientData(userId) → HealthDataContext
    ↓
loadAIRecommendations(userId) → HealthDataContext
    ↓
loadAppointments(userId) → HealthDataContext
    ↓
Context updates → Component re-renders
    ↓
useMemo hooks compute derived data
    ↓
UI renders with computed values
```

---

## **2. Disease Library Page States**

### **State Management Architecture**

The Disease Library uses **local component state** with `useState` and `useMemo`:
- **No Context dependency** - Standalone page
- **Client-side filtering** - All filtering happens in browser
- **Dialog state** - Modal for disease details

### **Primary States**

#### **A. Data State**
```typescript
diseases: Disease[]
```
- **Source**: Props (`propDiseases`) OR `mockDiseases` (fallback)
- **Default**: 3 mock diseases (Malaria, Diabetes, Hypertension)
- **Structure**: Each disease contains:
  - Basic info (name, description, category)
  - Symptoms, causes, prevention, treatment
  - Body regions affected
  - Progression timeline (if available)
  - Regional prevalence
  - Seasonal patterns

#### **B. Filter States**

**1. Search Query State**
```typescript
searchQuery: string
```
- **Initial**: From props OR empty string
- **Updates**: On every keystroke in search field
- **Usage**: Filters diseases by name, Amharic name, description, or symptoms

**2. Category Filter State**
```typescript
categoryFilter: DiseaseCategory | 'all'
```
- **Initial**: From props OR 'all'
- **Options**: 
  - 'all'
  - 'infectious'
  - 'chronic'
  - 'respiratory'
  - 'maternal-child'
  - 'tropical'
  - 'common-ailments'
- **Updates**: When user clicks category tab

**3. Body Region Filter State**
```typescript
selectedBodyRegions: string[]
```
- **Initial**: Empty array `[]`
- **Updates**: When user clicks on BodyMap component
- **Behavior**: Toggle - clicking same region removes it
- **Usage**: Filters diseases that affect selected body regions

#### **C. UI Interaction States**

**1. Selected Disease State**
```typescript
selectedDisease: Disease | null
```
- **Initial**: `null`
- **Updates**: When user clicks a disease card
- **Usage**: Populates the detail dialog

**2. Dialog Open State**
```typescript
dialogOpen: boolean
```
- **Initial**: `false`
- **Updates**: 
  - `true` when disease card clicked
  - `false` when dialog closed
- **Usage**: Controls visibility of disease detail modal

### **Computed/Derived States (useMemo)**

#### **Filtered Diseases**
```typescript
filteredDiseases: Disease[]
```
- **Computation Logic**:
  1. Start with all diseases
  2. Apply category filter (if not 'all')
  3. Apply search query filter (if not empty)
  4. Apply body region filter (if any selected)
- **Dependencies**: `[diseases, categoryFilter, searchQuery, selectedBodyRegions]`
- **Performance**: Only recalculates when dependencies change

### **Filtering Flow**

```
User Input (Search/Category/Body Region)
    ↓
State Updates (setSearchQuery, setCategoryFilter, setSelectedBodyRegions)
    ↓
useMemo recalculates filteredDiseases
    ↓
Component re-renders with filtered results
    ↓
UI shows filtered disease cards
```

### **Empty States**

**1. No Diseases Found**
- **Condition**: `filteredDiseases.length === 0`
- **UI**: Centered message "No diseases found matching your criteria"
- **Causes**:
  - Search query doesn't match any disease
  - Category filter excludes all diseases
  - Body region filter excludes all diseases
  - Combination of filters excludes all

**2. No Diseases Available**
- **Condition**: `diseases.length === 0` (shouldn't happen with mock data)
- **UI**: Would show empty state message

### **Dialog States**

When disease is clicked:
1. `setSelectedDisease(disease)` - Stores disease data
2. `setDialogOpen(true)` - Opens modal
3. Dialog shows:
   - Disease name (English/Amharic based on language)
   - Description
   - Symptoms list
   - Causes list
   - Prevention list
   - Treatment list
   - Progression timeline (if available)
   - Affected body regions
   - Seasonal patterns (if available)
   - Regional prevalence

### **State Flow Diagram**

```
User visits /diseases
    ↓
Component mounts with mockDiseases
    ↓
User interacts (search/filter/select)
    ↓
State updates (searchQuery, categoryFilter, selectedBodyRegions)
    ↓
useMemo recalculates filteredDiseases
    ↓
UI re-renders with filtered results
    ↓
User clicks disease card
    ↓
setSelectedDisease + setDialogOpen(true)
    ↓
Dialog shows disease details
```

---

## **3. Key Differences**

| Aspect | Dashboard | Disease Library |
|--------|-----------|-----------------|
| **State Source** | Context API + Props | Local State + Props |
| **Data Loading** | Async (API calls) | Static (mock data) |
| **Loading State** | Yes (shows spinner) | No (instant) |
| **Empty States** | Multiple (per section) | Single (no results) |
| **Computed Data** | Many (health score, trends, etc.) | One (filtered diseases) |
| **User Interactions** | Navigation buttons | Search, filter, select |
| **Real-time Updates** | Yes (via context) | No (static filtering) |

---

## **4. State Management Best Practices Used**

### **Dashboard**
✅ **Props override context** - Allows parent to inject data  
✅ **useMemo for expensive calculations** - Prevents unnecessary recalculations  
✅ **Conditional rendering** - Shows sections only when data exists  
✅ **Loading state handling** - Prevents rendering with incomplete data  

### **Disease Library**
✅ **Controlled inputs** - Search and filters are controlled components  
✅ **Memoized filtering** - `useMemo` prevents filtering on every render  
✅ **Local state for UI** - Dialog state managed locally  
✅ **Fallback to mock data** - Always has data to display  

---

## **5. Future Improvements**

### **Dashboard**
- Add error state handling
- Add retry mechanism for failed API calls
- Add optimistic updates for user actions
- Cache computed values in context

### **Disease Library**
- Add loading state for API calls
- Add pagination for large disease lists
- Add error state for API failures
- Cache filtered results
- Add URL query params for filters (shareable links)

