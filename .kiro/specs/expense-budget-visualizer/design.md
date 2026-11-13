# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a client-side web application built with vanilla JavaScript, HTML5, and CSS3. It uses localStorage for persistence and Chart.js for data visualization. The architecture follows a functional programming approach with clear separation between state management, DOM manipulation, and business logic.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   index.html                         │
│              (Entry Point & Structure)               │
└─────────────────────────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
    ┌──────────────┐          ┌──────────────┐
    │  style.css   │          │   app.js     │
    │  (Theming &  │          │ (Core Logic) │
    │   Layout)    │          └──────────────┘
    └──────────────┘                  │
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ State Mgmt   │  │ DOM Rendering│  │ Persistence  │
            │ (In-Memory)  │  │  (Updates)   │  │ (localStorage)│
            └──────────────┘  └──────────────┘  └──────────────┘
                                      │
                                      ▼
                              ┌──────────────┐
                              │  Chart.js    │
                              │    (CDN)     │
                              └──────────────┘
```

### Component Structure

The application uses an IIFE (Immediately Invoked Function Expression) to encapsulate all logic and avoid global namespace pollution. The main components are:

1. **State Management**: In-memory JavaScript objects tracking transactions, categories, budget, theme, and UI preferences
2. **Persistence Layer**: localStorage interface for data durability
3. **Rendering Engine**: Pure functions that transform state into DOM updates
4. **Event Handlers**: User interaction processors that modify state and trigger re-renders
5. **Validation Logic**: Input validation and business rule enforcement

## Core Components

### 1. State Management

**State Schema:**
```javascript
{
  transactions: Array<Transaction>,
  categories: Array<string>,
  budgetLimit: number,
  theme: 'light' | 'dark',
  sortBy: string,
  selectedMonth: string,
  chart: ChartInstance | null
}
```

**Transaction Schema:**
```javascript
{
  id: string,          // Unique identifier (timestamp + random)
  name: string,        // Item description
  amount: number,      // Expense amount (positive)
  category: string,    // Category name
  date: string         // ISO 8601 timestamp
}
```

### 2. Persistence Layer

**Storage Key:** `ebv_data_v1`

**Stored Data Structure:**
```javascript
{
  transactions: Transaction[],
  categories: string[],
  budgetLimit: number,
  theme: 'light' | 'dark'
}
```

**Operations:**
- `loadState()`: Restores state from localStorage on application load
- `persist()`: Saves current state to localStorage after mutations
- Error handling: Graceful fallback to default values on parse errors

### 3. Rendering Engine

**Pure Rendering Functions:**
- `renderCategorySelect()`: Populates category dropdown with current categories
- `renderMonthOptions()`: Generates month filter options from transaction dates
- `renderBalance()`: Displays total spending
- `renderList()`: Renders sorted, filtered transaction list
- `renderChart()`: Updates or creates Chart.js pie chart
- `renderSummary()`: Displays monthly summary with category breakdown
- `renderBudget()`: Shows budget progress and over-limit warnings

**Render Flow:**
```
User Action → State Update → persist() → renderAll() → DOM Updates
```

### 4. Validation Logic

**Form Validation Rules:**
- Item name: Non-empty string
- Amount: Finite number > 0
- Category: Must be selected from available options

**Category Validation Rules:**
- New category: Non-empty string
- Duplicate check: Case-insensitive comparison against existing categories

### 5. Business Logic Components

**Transaction Management:**
- Add: Validates input, generates ID, appends to array, persists
- Delete: Filters by ID, persists
- Sort: Multiple criteria (date, amount, category, ascending/descending)
- Filter: Month-based filtering

**Category Management:**
- Default categories: Food, Transport, Fun
- Custom categories: User-defined additions
- Color assignment: Deterministic mapping from palette array

**Budget Management:**
- Limit setting: User-defined threshold
- Progress calculation: (total / limit) * 100
- Over-limit detection: total >= limit
- Visual warnings: CSS class toggles and status messages

**Monthly Summary:**
- Month extraction: Derives YYYY-MM from transaction dates
- Aggregation: Groups by category, sums amounts
- Percentage calculation: (category_total / overall_total) * 100

## Data Flow

### Adding a Transaction

```
1. User submits form
   ↓
2. addTransaction(event) handler
   ↓
3. Validate inputs (name, amount, category)
   ↓
4. Create transaction object with uid()
   ↓
5. Push to transactions array
   ↓
6. persist() to localStorage
   ↓
7. Clear form fields, focus input
   ↓
8. renderAll() → updates all views
```

### Deleting a Transaction

```
1. User clicks delete button
   ↓
2. Click event bubbles to transactionList
   ↓
3. deleteTransaction(id) handler
   ↓
4. Filter transactions array (remove by id)
   ↓
5. persist() to localStorage
   ↓
6. renderAll() → updates all views
```

### Filtering by Month

```
1. User selects month from dropdown
   ↓
2. monthSelect change event
   ↓
3. Update selectedMonth state
   ↓
4. renderAll() calls filteredTransactions()
   ↓
5. List, chart, and summary show filtered data
```

## User Interface Design

### Layout Structure

```
Header
  ├── Brand (icon + title)
  └── Theme Toggle Button

Main Container
  ├── Balance Card (total + budget input)
  ├── Add Expense Form
  ├── Pie Chart Card
  ├── Controls (month filter + sort)
  ├── Summary Card (totals + breakdown + progress)
  └── Transaction List
```

### Theming

**Theme System:**
- CSS custom properties (CSS variables) for all colors
- Two theme datasets: `[data-theme="light"]` and `[data-theme="dark"]`
- Theme toggle updates `data-theme` attribute on root element
- Transitions for smooth color changes

**Theme Variables:**
```css
--bg, --card-bg, --text, --muted, --border,
--input-bg, --primary, --primary-ink, --danger,
--success, --warn, --chip-bg, --chip-ink, --shadow
```

### Responsive Design

**Breakpoints:**
- Mobile-first approach (base styles for narrow screens)
- Media query at 600px for larger screens
- Flexible layouts using flexbox
- Max-width container (560px) for optimal readability

**Mobile Optimizations:**
- Touch-friendly button sizes (min 42px)
- `inputmode="decimal"` for numeric keyboards
- Scrollable transaction list with max-height
- Adaptive font sizes

## Error Handling

### Input Validation Errors
- Display inline error messages below form
- Red background with error text
- Auto-clear on successful submission
- Prevent form submission until valid

### localStorage Errors
- Try-catch blocks around all storage operations
- Console warnings for debugging
- Fallback to default values on load failure
- Application remains functional without persistence

### Chart.js Loading Errors
- Check for `Chart` global before instantiation
- Display fallback message if CDN fails
- Application remains functional without chart

### Data Integrity
- Type validation on localStorage restore
- Array.isArray() checks for collections
- isFinite() checks for numeric values
- Graceful fallback to defaults on invalid data

## Security Considerations

### XSS Prevention
- `escapeHtml()` function for all user-generated content
- Escapes: `&`, `<`, `>`, `"`, `'`
- Applied before inserting into innerHTML
- Protects against script injection in transaction names

### Data Sanitization
- Input trimming for text fields
- parseFloat() for amount values
- Type coercion and validation before storage
- No eval() or dangerous dynamic code execution

## Performance Considerations

### Rendering Optimization
- DOM fragment building for list rendering (reduces reflows)
- Chart.js update() method instead of full recreation
- Conditional rendering (hide empty states when not needed)
- CSS transitions for smooth visual updates

### Storage Optimization
- Single localStorage key for all data
- JSON serialization for efficient storage
- Only persist after state changes
- No unnecessary writes

### Memory Management
- Chart instance cleanup before recreation
- Event delegation for delete buttons (single listener)
- No memory leaks from unclosed event listeners

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus management (auto-focus input after add)
- Visible focus indicators (outline on focus-visible)

### Screen Reader Support
- ARIA labels on buttons (`aria-label="Delete transaction"`)
- Role attributes (`role="alert"` on error messages)
- `role="img"` on chart canvas
- Semantic HTML (header, main, section)

### Visual Accessibility
- High contrast text colors
- Sufficient font sizes (minimum 13px)
- Color not used as sole indicator (text + color for warnings)
- Touch target sizes meet WCAG guidelines (42px+)

## Technology Stack

### Core Technologies
- **HTML5**: Semantic structure, modern form inputs
- **CSS3**: Custom properties, flexbox, transitions, media queries
- **Vanilla JavaScript (ES5+)**: No transpilation, runs in modern browsers

### External Dependencies
- **Chart.js 4.4.1**: Pie chart visualization, loaded via CDN
- **localStorage API**: Browser-native persistence

### Browser Compatibility
- Target: Modern evergreen browsers (Chrome, Firefox, Edge, Safari)
- Features used: ES5+ JavaScript, CSS custom properties, flexbox
- No polyfills required for target browsers

## File Organization

```
project-root/
├── index.html              (Entry point, HTML structure)
├── css/
│   └── style.css          (All styles, theming, responsive design)
├── js/
│   └── app.js             (All application logic, single file)
└── .kiro/
    └── specs/
        └── expense-budget-visualizer/
            ├── .config.kiro
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Transaction Addition Validity

*For any* valid transaction input (non-empty name, amount > 0, selected category), submitting the form should add exactly one transaction to the list and persist it to localStorage.

**Validates: Requirements 1.2, 1.6**

### Property 2: Input Validation Rejection

*For any* transaction submission with empty name, invalid amount (≤ 0 or non-numeric), or missing category, the system should reject the submission and display an error message.

**Validates: Requirements 1.3, 1.4**

### Property 3: Form Reset After Addition

*For any* successful transaction addition, the form should clear all input fields and maintain focus on the item name field.

**Validates: Requirements 1.5**

### Property 4: Transaction Rendering Completeness

*For any* transaction in the system, the rendered list item should contain the transaction's name, formatted amount, category badge, date, and a delete button.

**Validates: Requirements 2.2, 2.4**

### Property 5: Transaction Deletion

*For any* transaction in the list, clicking its delete button should remove it from both the displayed list and localStorage.

**Validates: Requirements 2.5**

### Property 6: Balance Calculation Correctness

*For any* set of transactions, the displayed balance should equal the sum of all transaction amounts.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 7: Currency Formatting Consistency

*For any* numeric amount value, the formatted display should follow currency format (e.g., "$1,234.56").

**Validates: Requirements 3.4**

### Property 8: Chart Data Accuracy

*For any* set of transactions, the pie chart data should accurately reflect the sum of amounts grouped by category.

**Validates: Requirements 4.1, 4.2**

### Property 9: Category Color Uniqueness

*For any* list of categories, each category should be assigned a distinct color from the palette.

**Validates: Requirements 4.4**

### Property 10: Custom Category Addition

*For any* non-empty, non-duplicate category name, submitting it should add the category to the available options and persist to localStorage.

**Validates: Requirements 5.2, 5.4**

### Property 11: Duplicate Category Prevention

*For any* category name that already exists (case-insensitive), attempting to add it should be rejected with an error message.

**Validates: Requirements 5.3**

### Property 12: Month Filter Availability

*For any* set of transactions, the month dropdown should contain exactly the distinct months present in the transaction dates plus "All Months".

**Validates: Requirements 6.1**

### Property 13: Month Filter Application

*For any* selected month, all displayed data (list, chart, summary) should show only transactions from that month.

**Validates: Requirements 6.2**

### Property 14: Summary Calculation Correctness

*For any* filtered set of transactions, the summary card should display the correct total and per-category breakdown.

**Validates: Requirements 6.4**

### Property 15: Percentage Calculation Accuracy

*For any* category breakdown, the displayed percentage should equal (category_amount / total_amount) × 100, rounded to nearest integer.

**Validates: Requirements 6.5**

### Property 16: Transaction Sorting Correctness

*For any* transaction list and sort criterion (date, amount, category, ascending/descending), the displayed list should be ordered according to the selected criterion.

**Validates: Requirements 7.1-7.5**

### Property 17: Budget Limit Persistence

*For any* budget limit value entered by the user, it should be stored in localStorage and restored on page load.

**Validates: Requirements 8.2**

### Property 18: Budget Exceeded Warning

*For any* spending total that meets or exceeds the budget limit, the system should display visual warnings (status message, highlighted card, red progress bar).

**Validates: Requirements 8.3, 8.4**

### Property 19: Budget Progress Accuracy

*For any* budget limit > 0 and spending total, the progress bar width should equal min(100, (total / limit) × 100).

**Validates: Requirements 8.5**

### Property 20: Theme Toggle Idempotence

*For any* current theme state, clicking the toggle button twice should return to the original theme (light → dark → light).

**Validates: Requirements 9.2**

### Property 21: Data Persistence Round Trip

*For any* application state (transactions, categories, budget limit, theme), saving to localStorage and reloading should restore the exact same state.

**Validates: Requirements 10.1-10.6**

## Future Enhancements

### Potential Features
- Export transactions to CSV
- Import transactions from file
- Multiple budget limits (per-category budgets)
- Recurring transaction templates
- Search/filter by item name
- Date range selection (beyond monthly)
- Undo/redo functionality
- Transaction editing (currently delete + re-add)

### Technical Improvements
- Progressive Web App (PWA) with offline support
- IndexedDB for larger datasets
- Web Workers for heavy calculations
- Virtual scrolling for large transaction lists
- Unit test coverage with property-based testing
- End-to-end testing with Playwright/Cypress
