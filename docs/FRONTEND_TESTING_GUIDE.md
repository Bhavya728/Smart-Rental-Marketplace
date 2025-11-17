# Frontend Testing Suite Documentation

## 🧪 **Complete Testing Framework for RentEase Frontend**

This comprehensive testing suite validates all frontend components, imports, routing, navigation, and integration functionality across the entire application.

## 📁 **Test Structure**

```
frontend/src/__tests__/
├── setupTests.js           # Test configuration and global mocks
├── imports.test.js         # Import validation tests
├── routing.test.js         # React Router tests
├── navigation.test.js      # Navbar and navigation tests  
├── components.test.js      # UI and feature component tests
├── integration.test.js     # End-to-end integration tests
├── manualTests.js         # Browser console test scripts
├── __mocks__/
│   └── fileMock.js        # Static file mocks
└── package.test.json      # Jest configuration
```

## 🚀 **Running Tests**

### **Install Testing Dependencies**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @babel/preset-env @babel/preset-react babel-jest
```

### **Test Commands**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm run test:imports      # Import validation only
npm run test:routing      # Routing tests only
npm run test:navigation   # Navigation tests only
npm run test:components   # Component tests only
npm run test:integration  # Integration tests only

# Debug mode
npm run test:debug
```

## 📋 **Test Categories**

### **1. Import Tests (`imports.test.js`)**
Validates that all files can be imported without errors:

- ✅ Main application files (App.jsx, main.jsx)
- ✅ Context providers (AuthContext)
- ✅ Route components (PrivateRoute, PublicRoute, MixedRoute)
- ✅ All page components (30+ pages)
- ✅ UI components (Alert, Button, Modal, Input, etc.)
- ✅ Feature components (Listings, Booking, Chat, Reviews, User)
- ✅ Services (auth, listing, booking, review, message)
- ✅ Hooks (useAuth, useSocket, useDebounce, etc.)
- ✅ Utilities and configuration files

### **2. Routing Tests (`routing.test.js`)**
Tests React Router configuration and behavior:

- ✅ Public routes (Home, Login, Register, Search, About)
- ✅ Private routes (Dashboard, Profile, Messages, My Bookings)
- ✅ Owner-specific routes (My Listings, Create Listing)
- ✅ Booking routes (Booking Detail, Checkout, Confirmation)
- ✅ Mixed routes (Listing Detail, Reviews - public/private)
- ✅ Authentication redirects
- ✅ 404 handling
- ✅ Route parameters
- ✅ Query parameters
- ✅ Hash routing

### **3. Navigation Tests (`navigation.test.js`)**
Tests navigation components and user interactions:

- ✅ Navbar rendering and branding
- ✅ Authentication state display
- ✅ Desktop dropdown menus
- ✅ Mobile hamburger menu
- ✅ Role-based navigation (owner vs renter)
- ✅ User avatar and profile display
- ✅ Menu interactions (click, keyboard)
- ✅ Logout functionality
- ✅ Responsive behavior
- ✅ Accessibility (ARIA labels, keyboard navigation)

### **4. Component Tests (`components.test.js`)**
Tests individual component functionality:

#### **UI Components:**
- Button (variants, states, interactions)
- Modal (open/close, keyboard events)
- Input (validation, error display)
- Card (content, hover effects)

#### **Feature Components:**
- PropertyCard (property display, navigation)
- SearchBar (search functionality)
- BookingForm (date selection, validation)
- BookingCalendar (date availability)
- ReviewCard (review display, helpful votes)
- ReviewForm (rating, validation, submission)
- MessageBubble (message display, styling)
- MessageInput (message sending)
- UserProfile (user information, editing)

### **5. Integration Tests (`integration.test.js`)**
Tests complete user workflows and feature integration:

#### **User Flows:**
- ✅ Complete registration and login flow
- ✅ Property search and filtering
- ✅ End-to-end booking process
- ✅ Review creation and interaction
- ✅ Real-time messaging
- ✅ Owner listing management

#### **Error Handling:**
- ✅ Network error scenarios
- ✅ Authentication failures
- ✅ Invalid route parameters
- ✅ Service unavailability

#### **Performance:**
- ✅ Loading states
- ✅ Pagination
- ✅ Async operations

### **6. Manual Tests (`manualTests.js`)**
Browser console scripts for manual testing:

```javascript
// Run in browser console
frontendTests.runAllTests()           // Complete test suite
frontendTests.testUserAuthFlow()      // Auth flow
frontendTests.testBookingFlow()       // Booking process
frontendTests.testReviewSystem()      // Review functionality
frontendTests.testNavigation()        // Route testing
frontendTests.testAPIEndpoints()      // API validation
frontendTests.testWebSocketConnection() // Real-time features
```

## 🔧 **Test Configuration**

### **Jest Setup (`setupTests.js`)**
- Polyfills for jsdom environment
- Mock window methods (matchMedia, scrollTo)
- Local/session storage mocks
- Intersection/Resize Observer mocks
- WebSocket mocks
- File upload mocks
- Global test utilities

### **Coverage Thresholds**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🎯 **Testing Scenarios**

### **Authentication Testing**
```javascript
// Tests login, registration, logout flows
// Validates token handling and redirects
// Tests role-based access control
```

### **Booking System Testing**
```javascript
// Tests complete booking workflow
// Validates date selection and availability
// Tests payment integration
// Validates booking confirmation
```

### **Review System Testing**
```javascript
// Tests review creation and display
// Validates rating functionality
// Tests helpful vote system
// Validates owner responses
```

### **Navigation Testing**
```javascript
// Tests all route definitions
// Validates navigation menu functionality
// Tests responsive behavior
// Validates accessibility features
```

## 🚨 **Common Test Scenarios**

### **Error Handling Tests**
- Network failures
- API errors
- Validation errors
- Authentication failures
- Invalid data scenarios

### **Edge Case Tests**
- Empty state handling
- Large dataset pagination
- File upload limits
- Date boundary conditions
- Browser compatibility

### **Performance Tests**
- Loading state management
- Async operation handling
- Memory leak prevention
- Component re-rendering optimization

## 📊 **Coverage Report**

After running `npm run test:coverage`, view the HTML report:
```bash
open coverage/lcov-report/index.html
```

## 🔍 **Debugging Tests**

### **Common Issues and Solutions**

1. **Import Errors**: Check file paths and export/import statements
2. **Mock Issues**: Ensure all external dependencies are mocked
3. **Async Test Failures**: Use waitFor() for async operations
4. **Component Not Found**: Add data-testid attributes for easier selection
5. **Context Errors**: Wrap components in proper providers

### **Debug Commands**
```bash
# Run specific test file
npm test imports.test.js

# Run with verbose output
npm test -- --verbose

# Run single test case
npm test -- --testNamePattern="should render navbar"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 🎉 **Test Results Summary**

### **Expected Test Counts:**
- Import Tests: ~50 test cases
- Routing Tests: ~25 test cases  
- Navigation Tests: ~20 test cases
- Component Tests: ~40 test cases
- Integration Tests: ~30 test cases

### **Total Coverage:**
- **165+ automated test cases**
- **All major user workflows**
- **Complete component validation**
- **Comprehensive error scenarios**

## 🔄 **Continuous Integration**

Add to your CI/CD pipeline:
```yaml
# .github/workflows/test.yml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm install
    npm run test:ci
```

## 📝 **Test Maintenance**

### **When to Update Tests:**
- New components added
- Route changes
- API endpoint changes
- UI/UX modifications
- Bug fixes

### **Best Practices:**
- Keep tests focused and isolated
- Use descriptive test names
- Mock external dependencies
- Test user behavior, not implementation
- Maintain high coverage for critical paths

This comprehensive testing suite ensures your RentEase frontend is robust, reliable, and ready for production deployment! 🚀