# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan implements a client-side expense tracking application using vanilla JavaScript, HTML5, and CSS3. The implementation follows a functional architecture with clear separation between state management, DOM manipulation, and persistence. The application uses localStorage for data durability and Chart.js for pie chart visualization.

## Tasks

- [ ] 1. Set up project structure and load dependencies
  - Verify index.html contains HTML5 doctype and structure
  - Verify css/style.css exists and is linked in index.html
  - Verify js/app.js exists and is linked in index.html
  - Add Chart.js 4.4.1 CDN script tag to index.html
  - Add viewport meta tag for mobile responsiveness
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 11.1_

- [ ] 2. Build HTML structure with semantic markup
  - [ ] 2.1 Create header section with brand and theme toggle button
    - Add header element with app icon/title
    - Add theme toggle button with aria-label
    - _Requirements: 9.1, 12.3_
  
  - [ ] 2.2 Create balance display card
    - Add balance card with total display area
    - Add budget limit input field
    - _Requirements: 3.1, 8.1_
  
  - [ ] 2.3 Create expense form with validation
    - Add item name input field (text)
    - Add amount input field (number, inputmode="decimal")
    - Add category select dropdown
    - Add submit button
    - Add error message display area
    - _Requirements: 1.1, 11.4_
  
  - [ ] 2.4 Create custom category addition section
    - Add custom category input field
    - Add add category button
    - _Requirements: 5.1_
  
  - [ ] 2.5 Create chart container and controls
    - Add canvas element for pie chart with role="img"
    - Add month filter dropdown
    - Add sort criteria dropdown
    - _Requirements: 4.5, 6.1, 7.1_
  
  - [ ] 2.6 Create summary card and transaction list
    - Add summary card container
    - Add transaction list container with scrollable styling
    - _Requirements: 2.1, 6.4_

- [ ] 3. Implement CSS theming system and responsive layout
  - [ ] 3.1 Define CSS custom properties for themes
    - Define light theme variables (--bg, --text, --primary, etc.)
    - Define dark theme variables using [data-theme="dark"]
    - Add smooth transitions for theme changes
    - _Requirements: 9.3_
  
  - [ ] 3.2 Implement base layout and card styles
    - Create card component styles
    - Create container max-width (560px) and spacing
    - Implement flexbox layouts for sections
    - _Requirements: 11.2_
  
  - [ ] 3.3 Add mobile-first responsive styles
    - Define base mobile styles
    - Add media query for screens > 600px
    - Ensure touch-friendly sizes (min 42px for buttons)
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 4. Implement core state management and persistence layer
  - [ ] 4.1 Create IIFE wrapper and state variables
    - Wrap all code in IIFE to avoid global pollution
    - Define state object (transactions, categories, budgetLimit, theme, etc.)
    - Define default categories: Food, Transport, Fun
    - _Requirements: 12.5_
  
  - [ ] 4.2 Implement localStorage persistence functions
    - Implement loadState() with error handling
    - Implement persist() to save state
    - Add fallback to defaults on parse errors
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 5. Implement helper and utility functions
  - [ ] 5.1 Create formatting and ID generation helpers
    - Implement formatMoney(amount) for currency formatting
    - Implement uid() for unique transaction IDs
    - Implement escapeHtml(str) for XSS prevention
    - _Requirements: 3.4_
  
  - [ ] 5.2 Create category and date helpers
    - Implement categoryColor(category) with palette array
    - Implement monthKey(dateString) to extract YYYY-MM
    - Implement monthLabel(key) for display formatting
    - _Requirements: 4.4_
  
  - [ ] 5.3 Create filtering and sorting helpers
    - Implement filteredTransactions() based on selectedMonth
    - Implement sortedTransactions(array) with multiple criteria
    - _Requirements: 6.2, 6.3, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Implement MVP Feature: Add Transaction
  - [ ] 6.1 Create transaction addition handler
    - Implement addTransaction(event) handler
    - Validate item name (non-empty)
    - Validate amount (> 0, finite number)
    - Validate category selection
    - Display validation errors
    - Generate unique ID using uid()
    - Push transaction to state array
    - Call persist() to save
    - Clear form fields and focus item name input
    - Call renderAll() to update UI
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 6.2 Write property test for transaction addition
    - **Property 1: Transaction Addition Validity**
    - **Validates: Requirements 1.2, 1.6**
  
  - [ ]* 6.3 Write property test for input validation
    - **Property 2: Input Validation Rejection**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ]* 6.4 Write property test for form reset
    - **Property 3: Form Reset After Addition**
    - **Validates: Requirements 1.5**

- [ ] 7. Implement MVP Feature: Transaction List Display
  - [ ] 7.1 Create list rendering function
    - Implement renderList() function
    - Build transaction items using filteredTransactions() and sortedTransactions()
    - Display name, formatted amount, category badge, date, delete button
    - Handle empty state message
    - Use escapeHtml() for user-generated content
    - Render to DOM using innerHTML or fragment
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 7.2 Implement transaction deletion
    - Add event delegation on transaction list container
    - Implement deleteTransaction(id) handler
    - Filter transactions array to remove by id
    - Call persist() and renderAll()
    - _Requirements: 2.4, 2.5_
  
  - [ ]* 7.3 Write property test for transaction rendering
    - **Property 4: Transaction Rendering Completeness**
    - **Validates: Requirements 2.2, 2.4**
  
  - [ ]* 7.4 Write property test for transaction deletion
    - **Property 5: Transaction Deletion**
    - **Validates: Requirements 2.5**

- [ ] 8. Implement MVP Feature: Total Balance Display
  - [ ] 8.1 Create balance calculation and display
    - Implement renderBalance() function
    - Calculate sum of all transaction amounts (or filtered amounts)
    - Format using formatMoney()
    - Update balance display element
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 8.2 Write property test for balance calculation
    - **Property 6: Balance Calculation Correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  
  - [ ]* 8.3 Write property test for currency formatting
    - **Property 7: Currency Formatting Consistency**
    - **Validates: Requirements 3.4**

- [ ] 9. Implement MVP Feature: Pie Chart Visualization
  - [ ] 9.1 Create chart rendering function
    - Implement renderChart() function
    - Calculate category totals from filtered transactions
    - Create labels and data arrays for Chart.js
    - Assign colors using categoryColor()
    - Check if chart instance exists (update vs create)
    - Use Chart.destroy() before recreating
    - Handle empty data state (display message)
    - Update chart colors on theme change
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.4_
  
  - [ ]* 9.2 Write property test for chart data accuracy
    - **Property 8: Chart Data Accuracy**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 9.3 Write property test for category colors
    - **Property 9: Category Color Uniqueness**
    - **Validates: Requirements 4.4**

- [ ] 10. Checkpoint - Ensure MVP features work correctly
  - Manually test adding transactions
  - Verify list displays correctly
  - Verify balance updates correctly
  - Verify chart displays correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 11. Implement Optional Feature: Custom Categories
  - [ ] 11.1 Create custom category addition handler
    - Implement addCustomCategory() handler
    - Validate non-empty input
    - Check for duplicates (case-insensitive)
    - Add to categories array
    - Call persist() to save
    - Update category dropdown with renderCategorySelect()
    - Display error message on duplicate
    - Clear input field on success
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 11.2 Write property test for category addition
    - **Property 10: Custom Category Addition**
    - **Validates: Requirements 5.2, 5.4**
  
  - [ ]* 11.3 Write property test for duplicate prevention
    - **Property 11: Duplicate Category Prevention**
    - **Validates: Requirements 5.3**

- [ ] 12. Implement Optional Feature: Monthly Summary View
  - [ ] 12.1 Create month filter functionality
    - Implement renderMonthOptions() function
    - Extract unique YYYY-MM values from transactions
    - Populate month dropdown with options + "All Months"
    - Add change event handler to update selectedMonth
    - Call renderAll() on selection change
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 12.2 Create summary card rendering
    - Implement renderSummary() function
    - Calculate total for filtered transactions
    - Calculate per-category totals
    - Calculate percentage for each category
    - Display breakdown with category names, amounts, percentages
    - _Requirements: 6.4, 6.5_
  
  - [ ]* 12.3 Write property test for month filter availability
    - **Property 12: Month Filter Availability**
    - **Validates: Requirements 6.1**
  
  - [ ]* 12.4 Write property test for month filter application
    - **Property 13: Month Filter Application**
    - **Validates: Requirements 6.2**
  
  - [ ]* 12.5 Write property test for summary calculations
    - **Property 14: Summary Calculation Correctness**
    - **Property 15: Percentage Calculation Accuracy**
    - **Validates: Requirements 6.4, 6.5**

- [ ] 13. Implement Optional Feature: Sort Transactions
  - [ ] 13.1 Create sort functionality
    - Implement sort dropdown with options (date, amount, category)
    - Add change event handler to update sortBy state
    - Extend sortedTransactions() helper with sort logic
    - Support ascending/descending for each criterion
    - Call renderAll() on sort change
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 13.2 Write property test for sorting correctness
    - **Property 16: Transaction Sorting Correctness**
    - **Validates: Requirements 7.1-7.5**

- [ ] 14. Implement Optional Feature: Budget Limit and Warnings
  - [ ] 14.1 Create budget tracking functionality
    - Add input handler for budget limit field
    - Parse and validate budget input (number, > 0)
    - Update budgetLimit in state
    - Call persist() to save
    - _Requirements: 8.1, 8.2_
  
  - [ ] 14.2 Create budget display and warnings
    - Implement renderBudget() function
    - Calculate progress percentage: (total / limit) * 100
    - Display progress bar with calculated width
    - Check if total >= limit (over budget)
    - Display visual warning (status message, red bar, highlighted card)
    - Show "set a budget" message when no limit set
    - _Requirements: 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 14.3 Write property test for budget persistence
    - **Property 17: Budget Limit Persistence**
    - **Validates: Requirements 8.2**
  
  - [ ]* 14.4 Write property test for budget warnings
    - **Property 18: Budget Exceeded Warning**
    - **Validates: Requirements 8.3, 8.4**
  
  - [ ]* 14.5 Write property test for progress accuracy
    - **Property 19: Budget Progress Accuracy**
    - **Validates: Requirements 8.5**

- [ ] 15. Implement Optional Feature: Dark/Light Mode Toggle
  - [ ] 15.1 Create theme toggle functionality
    - Implement applyTheme(themeName) function
    - Set [data-theme] attribute on document root
    - Implement toggleTheme() handler for button click
    - Switch between 'light' and 'dark'
    - Update chart colors when theme changes (call renderChart)
    - Call persist() to save theme preference
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 15.2 Restore theme on page load
    - Call applyTheme() in init() with loaded theme
    - _Requirements: 9.6_
  
  - [ ]* 15.3 Write property test for theme toggle
    - **Property 20: Theme Toggle Idempotence**
    - **Validates: Requirements 9.2**

- [ ] 16. Implement accessibility enhancements
  - [ ] 16.1 Add ARIA labels and semantic HTML
    - Add aria-label to theme toggle button
    - Add aria-label to delete buttons
    - Add role="alert" to error message containers
    - Add role="img" and aria-label to chart canvas
    - Verify semantic HTML (header, main, section elements)
    - _Requirements: 11.5_
  
  - [ ] 16.2 Implement keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators using :focus-visible
    - Verify tab order is logical
    - Test focus management (auto-focus on input after add)
    - _Requirements: 11.5_

- [ ] 17. Integration and initialization
  - [ ] 17.1 Create main rendering orchestrator
    - Implement renderAll() function
    - Call renderCategorySelect()
    - Call renderMonthOptions()
    - Call renderBalance()
    - Call renderList()
    - Call renderChart()
    - Call renderSummary()
    - Call renderBudget()
    - _Requirements: All_
  
  - [ ] 17.2 Wire up all event handlers
    - Implement bindEvents() function
    - Bind form submit to addTransaction
    - Bind add category button to addCustomCategory
    - Bind transaction list clicks to deleteTransaction (delegation)
    - Bind theme toggle to toggleTheme
    - Bind month select to filter handler
    - Bind sort select to sort handler
    - Bind budget input to budget handler
    - _Requirements: All_
  
  - [ ] 17.3 Initialize application on load
    - Implement init() function
    - Call loadState() to restore data
    - Call applyTheme() to set initial theme
    - Call bindEvents() to attach handlers
    - Call renderAll() for initial render
    - Add DOMContentLoaded event listener calling init()
    - _Requirements: All_

- [ ] 18. Error handling and edge cases
  - [ ] 18.1 Add comprehensive error handling
    - Wrap localStorage operations in try-catch
    - Add fallback logic for localStorage failures
    - Check for Chart global before chart operations
    - Validate data types on state restoration (Array.isArray, isFinite)
    - Add console warnings for debugging
    - Display user-friendly error messages
    - _Requirements: 10.6_
  
  - [ ]* 18.2 Write integration tests for edge cases
    - Test empty transaction list
    - Test corrupted localStorage data
    - Test Chart.js CDN failure
    - Test invalid numeric inputs
    - Test XSS prevention in transaction names

- [ ] 19. Final checkpoint and validation
  - [ ]* 19.1 Write property test for persistence round trip
    - **Property 21: Data Persistence Round Trip**
    - **Validates: Requirements 10.1-10.6**
  
  - [ ] 19.2 Final manual testing
    - Test all MVP features work end-to-end
    - Test all optional features work correctly
    - Test on mobile device or browser device mode
    - Test keyboard navigation
    - Test theme switching
    - Verify localStorage persistence across page reloads
    - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Integration tests validate end-to-end flows and edge cases
- The application is built incrementally with two checkpoints for validation
- All state-changing operations must call persist() followed by renderAll()
- Use escapeHtml() for all user-generated content to prevent XSS
- Event delegation should be used for dynamically created elements (delete buttons)

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2.1"]
    },
    {
      "id": 1,
      "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "3.1"]
    },
    {
      "id": 2,
      "tasks": ["3.2", "3.3", "4.1"]
    },
    {
      "id": 3,
      "tasks": ["4.2", "5.1", "5.2"]
    },
    {
      "id": 4,
      "tasks": ["5.3", "6.1"]
    },
    {
      "id": 5,
      "tasks": ["6.2", "6.3", "6.4", "7.1"]
    },
    {
      "id": 6,
      "tasks": ["7.2", "8.1"]
    },
    {
      "id": 7,
      "tasks": ["7.3", "7.4", "8.2", "8.3", "9.1"]
    },
    {
      "id": 8,
      "tasks": ["9.2", "9.3"]
    },
    {
      "id": 9,
      "tasks": ["11.1", "12.1"]
    },
    {
      "id": 10,
      "tasks": ["11.2", "11.3", "12.2", "13.1"]
    },
    {
      "id": 11,
      "tasks": ["12.3", "12.4", "12.5", "13.2", "14.1"]
    },
    {
      "id": 12,
      "tasks": ["14.2"]
    },
    {
      "id": 13,
      "tasks": ["14.3", "14.4", "14.5", "15.1"]
    },
    {
      "id": 14,
      "tasks": ["15.2", "16.1"]
    },
    {
      "id": 15,
      "tasks": ["15.3", "16.2", "17.1"]
    },
    {
      "id": 16,
      "tasks": ["17.2"]
    },
    {
      "id": 17,
      "tasks": ["17.3", "18.1"]
    },
    {
      "id": 18,
      "tasks": ["18.2", "19.1"]
    },
    {
      "id": 19,
      "tasks": ["19.2"]
    }
  ]
}
```
