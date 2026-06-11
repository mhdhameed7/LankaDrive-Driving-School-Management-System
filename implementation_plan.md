# Batches Module UI Redesign

Match the reference design: split-panel inline form + batch cards + custom weekly calendar grid.

---

## Summary of Changes

Replace the current full-page `react-big-calendar` layout with a three-section design:
1. **Left panel** — inline "Create New Batch" form (no modal)
2. **Right panel** — "Active Batches" card list with filter tabs
3. **Bottom** — custom weekly session calendar grid (replacing react-big-calendar)

---

## New Batch Fields Required

The current `Batches` table is missing these fields needed by the new design:

| New Column | Type | Purpose |
|---|---|---|
| `sessionType` | TEXT | `Theory` / `Practical` / `Simulation` |
| `timeSlot` | TEXT | `Morning` / `Afternoon` / `Evening` / `Weekend` |
| `sessionDays` | TEXT | Comma-separated: `"Mon,Wed,Fri"` |
| `instructorId` | TEXT | FK to Instructors — stored at batch level |
| `vehicleId` | TEXT | FK to Vehicles — stored at batch level |

---

## Proposed Changes

### Database Layer

#### [MODIFY] [database.js](file:///c:/xampp/htdocs/finalyear%20project/database.js)
- Add 5x `ALTER TABLE Batches ADD COLUMN` statements (after existing ones at line 183)
- Update `add-batch` IPC handler to accept and store the 5 new fields
- Update `update-batch` IPC handler to accept and store the 5 new fields

---

### Frontend

#### [MODIFY] [Batches.jsx](file:///c:/xampp/htdocs/finalyear%20project/src/pages/Batches.jsx)

**Remove:**
- All `react-big-calendar` imports and `withDragAndDrop` setup
- `DnDCalendar` component and event drag/resize handlers
- `handleSelectSlot`, `handleSelectEvent`, `handleDeleteSession`
- The "Add Session" modal (`showSessionModal`, `sessionForm`)
- The "Calendar / List view" toggle
- The old `<style dangerouslySetInnerHTML>` RBC CSS block

**Add — Constants & Helpers:**
- `SESSION_TYPE_CONFIG` — colors, icons, default capacity per session type
- `TIME_SLOT_CONFIG` — emoji, label, display for each time slot
- `DAYS_OF_WEEK` array, `CALENDAR_ROWS` array
- `getMonday()`, `getWeekDays()`, `formatMonthYear()`, `isToday()`
- `getShortBatchCode()` — derives a short display code from batch name
- `generateBatchName()` — auto-generates names like `EVE-2026-01`

**Add — Sub-components:**
- `SessionTypeBadge` — colored pill for Theory/Practical/Simulation
- `StatusBadge` — colored dot badge for Active/Full/Upcoming/etc.
- `BatchCard` — rich card with: code badge, type badge, status badge, instructor, time, days, vehicle, progress bar, Manage Enrollees link
- `WeeklyCalendar` — custom grid: rows = time slots (Morning/Afternoon/Evening), cols = Mon–Sun; cells show colored batch code chips

**Redesigned state:**
```js
const [batchForm, setBatchForm] = useState({
  id: null, name: '', licenseCategory: 'B - Light Vehicle',
  maxCapacity: 15, sessionType: 'Theory', timeSlot: 'Morning',
  sessionDays: ['Mon', 'Wed', 'Fri'], startDate: '', endDate: '',
  instructorId: '', vehicleId: '', status: 'Active'
});
const [batchFilter, setBatchFilter] = useState('All');
const [calWeekStart, setCalWeekStart] = useState(() => getMonday(new Date()));
```

**Real-time conflict check (client-side via `useMemo`):**
- When instructor + days + timeSlot are all set, scan existing batches for same instructor on same days+slot
- Show green alert: "✓ No scheduling conflicts. Mr. Amal is free Mon/Wed/Fri 6-9AM."
- Show red alert: "✗ Conflict! [name] is already scheduled on [overlapping days] in batch [code]."

**Capacity warning (via `useMemo`):**
- Theory → "Max 15 students for Theory."
- Practical → "Max 5 students for Practical (road safety rule)."

**Preserved from current implementation:**
- `showManageModal` + Manage Enrollees modal
- `showAddCandidateModal` + Add Candidate modal
- `showSmartModal` + Smart Batching modal + all smart batching logic
- `assignCandidateToBatch`, `removeCandidate`, `handleStatusChange`, `handleDeleteBatch`
- All existing `window.api.*` calls

**New page layout structure:**
```
<div class="min-h-screen flex flex-col gap-4 p-6 bg-[#f0f4ff]">
  
  {/* Header row */}
  <header> ... Smart Batching button ... </header>
  
  {/* Split panel — fixed height so both sides scroll internally */}
  <div class="flex gap-4 h-[calc(100vh-180px)]">
    <div class="w-80 flex-shrink-0"> {/* LEFT: inline form */} </div>
    <div class="flex-1"> {/* RIGHT: batch cards */} </div>
  </div>
  
  {/* Weekly calendar — appears below on scroll */}
  <WeeklyCalendar />
  
  {/* Modals (Manage, AddCandidate, Smart) — unchanged */}
</div>
```

---

## Verification Plan

### Manual Verification
1. Create a new batch — verify it saves with all new fields and appears as a card
2. Auto-generate name — verify it follows `EVE-2026-01` pattern
3. Select same instructor on overlapping days → verify red conflict alert appears
4. Change session type → verify capacity auto-updates and Vehicle field disables for Theory
5. Weekly calendar — verify batch appears in correct day × timeSlot cell
6. Edit a batch — verify form pre-fills, card updates after save
7. Manage Enrollees, Add Candidate, Smart Batching — verify all still work

### No Breaking Changes
- Existing batches (created with old form) display gracefully with fallback values
- All existing API calls are preserved; only `add-batch` and `update-batch` receive extra optional fields
