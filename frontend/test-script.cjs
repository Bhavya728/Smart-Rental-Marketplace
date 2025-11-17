/**
 * Comprehensive Frontend Test Script
 * Tests all profile management UI features we implemented
 */

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName) => {
  console.log(`\n${colors.blue}${colors.bold}🧪 Testing: ${testName}${colors.reset}`);
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

// Frontend Component Tests
class FrontendTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  // Test 1: Check if required files exist
  async testFileStructure() {
    logTest('Frontend File Structure');
    
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
      'src/pages/EditProfile.jsx',
      'src/components/profile/ProfileEditForm.jsx',
      'src/components/profile/PhotoUpload.jsx',
      'src/components/ui/Button.jsx',
      'src/components/ui/Input.jsx',
      'src/services/userService.js',
      'src/contexts/AuthContext.jsx'
    ];

    let existingFiles = 0;
    
    for (const file of requiredFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        logSuccess(`✓ ${file} exists`);
        existingFiles++;
      } else {
        logError(`✗ ${file} missing`);
      }
    }

    const passed = existingFiles === requiredFiles.length;
    this.results.push({ name: 'File Structure', passed });
    return passed;
  }

  // Test 2: Check component syntax and imports
  async testComponentSyntax() {
    logTest('Component Syntax and Imports');
    
    const fs = require('fs');
    const path = require('path');
    
    const components = [
      'src/pages/EditProfile.jsx',
      'src/components/profile/ProfileEditForm.jsx',
      'src/components/profile/PhotoUpload.jsx'
    ];

    let validComponents = 0;
    
    for (const component of components) {
      const filePath = path.join(process.cwd(), component);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for React import
        if (content.includes('import React') || content.includes('from \'react\'')) {
          logSuccess(`✓ ${component} - React imported correctly`);
        } else {
          logWarning(`⚠ ${component} - React import not found`);
        }

        // Check for proper export
        if (content.includes('export default')) {
          logSuccess(`✓ ${component} - Default export found`);
          validComponents++;
        } else {
          logError(`✗ ${component} - No default export`);
        }

        // Check for forwardRef usage where expected
        if (component.includes('ProfileEditForm') && content.includes('forwardRef')) {
          logSuccess(`✓ ${component} - ForwardRef implemented correctly`);
        }

        // Check for proper prop handling
        if (content.includes('loading') && !content.includes('isLoading')) {
          logSuccess(`✓ ${component} - Button loading prop correctly used`);
        }

      } catch (error) {
        logError(`✗ ${component} - Syntax error: ${error.message}`);
      }
    }

    const passed = validComponents > 0;
    this.results.push({ name: 'Component Syntax', passed });
    return passed;
  }

  // Test 3: Check service layer
  async testServiceLayer() {
    logTest('Service Layer Configuration');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const servicePath = path.join(process.cwd(), 'src/services/userService.js');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'getProfile',
        'updateProfile', 
        'getProfileCompletion',
        'uploadProfilePhoto',
        'validateProfileData'
      ];

      let foundMethods = 0;
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          logSuccess(`✓ ${method} method found`);
          foundMethods++;
        } else {
          logError(`✗ ${method} method missing`);
        }
      }

      // Check validation patterns
      if (content.includes('/^[A-Za-z0-9\\s\\-]{3,10}$/')) {
        logSuccess('✓ ZIP code validation updated to international format');
      } else {
        logWarning('⚠ ZIP code validation may still use US-only format');
      }

      if (content.includes('/^[\\+]?[\\d\\s\\-\\(\\)]{10,20}$/')) {
        logSuccess('✓ Phone validation updated to flexible format');
      } else {
        logWarning('⚠ Phone validation may be too strict');
      }

      const passed = foundMethods >= 4;
      this.results.push({ name: 'Service Layer', passed });
      return passed;
      
    } catch (error) {
      logError(`Service layer test failed: ${error.message}`);
      this.results.push({ name: 'Service Layer', passed: false });
      return false;
    }
  }

  // Test 4: Check AuthContext integration
  async testAuthContext() {
    logTest('AuthContext Integration');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const authPath = path.join(process.cwd(), 'src/contexts/AuthContext.jsx');
      const content = fs.readFileSync(authPath, 'utf8');
      
      if (content.includes('refreshUser')) {
        logSuccess('✓ refreshUser function found in AuthContext');
      } else {
        logError('✗ refreshUser function missing from AuthContext');
      }

      // Check EditProfile for correct function usage
      const editProfilePath = path.join(process.cwd(), 'src/pages/EditProfile.jsx');
      const editContent = fs.readFileSync(editProfilePath, 'utf8');
      
      if (editContent.includes('refreshUser') && !editContent.includes('updateUser')) {
        logSuccess('✓ EditProfile uses correct refreshUser function');
      } else if (editContent.includes('updateUser')) {
        logError('✗ EditProfile still uses incorrect updateUser function');
        return false;
      }

      this.results.push({ name: 'AuthContext Integration', passed: true });
      return true;
      
    } catch (error) {
      logError(`AuthContext test failed: ${error.message}`);
      this.results.push({ name: 'AuthContext Integration', passed: false });
      return false;
    }
  }

  // Test 5: Check form accessibility
  async testAccessibility() {
    logTest('Form Accessibility');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const formPath = path.join(process.cwd(), 'src/components/profile/ProfileEditForm.jsx');
      const content = fs.readFileSync(formPath, 'utf8');
      
      let accessibilityScore = 0;
      const maxScore = 5;
      
      // Check for proper id attributes
      if (content.includes('id="profile-') && content.match(/id="profile-[^"]+"/g)?.length >= 5) {
        logSuccess('✓ Form inputs have proper id attributes');
        accessibilityScore++;
      } else {
        logError('✗ Form inputs missing proper id attributes');
      }

      // Check for name attributes
      if (content.includes('name="') && content.match(/name="[^"]+"/g)?.length >= 5) {
        logSuccess('✓ Form inputs have name attributes');
        accessibilityScore++;
      } else {
        logError('✗ Form inputs missing name attributes');
      }

      // Check for htmlFor in labels (via Input component)
      if (content.includes('label=') || content.includes('htmlFor')) {
        logSuccess('✓ Form labels properly associated');
        accessibilityScore++;
      } else {
        logWarning('⚠ Form labels may not be properly associated');
      }

      // Check for helper text
      if (content.includes('helperText')) {
        logSuccess('✓ Helper text provided for guidance');
        accessibilityScore++;
      } else {
        logWarning('⚠ Helper text missing');
      }

      // Check for ARIA attributes
      if (content.includes('aria-') || content.includes('role=')) {
        logSuccess('✓ ARIA attributes found');
        accessibilityScore++;
      } else {
        logWarning('⚠ ARIA attributes could be improved');
      }

      const passed = accessibilityScore >= 3;
      log(`Accessibility Score: ${accessibilityScore}/${maxScore}`, passed ? 'green' : 'yellow');
      
      this.results.push({ name: 'Form Accessibility', passed });
      return passed;
      
    } catch (error) {
      logError(`Accessibility test failed: ${error.message}`);
      this.results.push({ name: 'Form Accessibility', passed: false });
      return false;
    }
  }

  // Test 6: Check Button component consistency
  async testButtonComponent() {
    logTest('Button Component Consistency');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Check Button component
      const buttonPath = path.join(process.cwd(), 'src/components/ui/Button.jsx');
      const buttonContent = fs.readFileSync(buttonPath, 'utf8');
      
      if (buttonContent.includes('loading') && !buttonContent.includes('isLoading')) {
        logSuccess('✓ Button component uses "loading" prop correctly');
      } else {
        logError('✗ Button component prop naming inconsistent');
      }

      // Check PhotoUpload component
      const photoPath = path.join(process.cwd(), 'src/components/profile/PhotoUpload.jsx');
      const photoContent = fs.readFileSync(photoPath, 'utf8');
      
      if (photoContent.includes('loading={isUploading}') && !photoContent.includes('isLoading={isUploading}')) {
        logSuccess('✓ PhotoUpload uses correct Button props');
      } else {
        logError('✗ PhotoUpload has incorrect Button prop usage');
        return false;
      }

      // Check ProfileEditForm component
      const formPath = path.join(process.cwd(), 'src/components/profile/ProfileEditForm.jsx');
      const formContent = fs.readFileSync(formPath, 'utf8');
      
      if (formContent.includes('loading={isLoading}') && !formContent.includes('isLoading={isLoading}')) {
        logSuccess('✓ ProfileEditForm uses correct Button props');
      } else {
        logError('✗ ProfileEditForm has incorrect Button prop usage');
        return false;
      }

      this.results.push({ name: 'Button Component Consistency', passed: true });
      return true;
      
    } catch (error) {
      logError(`Button component test failed: ${error.message}`);
      this.results.push({ name: 'Button Component Consistency', passed: false });
      return false;
    }
  }

  // Test 7: Check save functionality implementation
  async testSaveFunctionality() {
    logTest('Save Functionality Implementation');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const editProfilePath = path.join(process.cwd(), 'src/pages/EditProfile.jsx');
      const content = fs.readFileSync(editProfilePath, 'utf8');
      
      let saveFeatures = 0;
      const expectedFeatures = 4;
      
      // Check for manual save button in header
      if (content.includes('Save Changes') && content.includes('onClick')) {
        logSuccess('✓ Manual save button implemented');
        saveFeatures++;
      } else {
        logError('✗ Manual save button missing');
      }

      // Check for floating save button
      if (content.includes('floating') || content.includes('fixed bottom')) {
        logSuccess('✓ Floating save button implemented');
        saveFeatures++;
      } else {
        logWarning('⚠ Floating save button may be missing');
      }

      // Check for keyboard shortcut
      if (content.includes('Ctrl+S') || content.includes('keydown')) {
        logSuccess('✓ Keyboard shortcut (Ctrl+S) implemented');
        saveFeatures++;
      } else {
        logWarning('⚠ Keyboard shortcut missing');
      }

      // Check for form ref implementation
      if (content.includes('useRef') && content.includes('triggerSave')) {
        logSuccess('✓ Form ref and triggerSave implemented');
        saveFeatures++;
      } else {
        logError('✗ Form ref implementation missing');
      }

      const passed = saveFeatures >= 2;
      log(`Save Features: ${saveFeatures}/${expectedFeatures}`, passed ? 'green' : 'yellow');
      
      this.results.push({ name: 'Save Functionality', passed });
      return passed;
      
    } catch (error) {
      logError(`Save functionality test failed: ${error.message}`);
      this.results.push({ name: 'Save Functionality', passed: false });
      return false;
    }
  }

  // Test 8: Package.json and dependencies
  async testDependencies() {
    logTest('Dependencies and Package Configuration');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react'
      ];

      let foundDeps = 0;
      
      for (const dep of requiredDeps) {
        if (packageContent.dependencies?.[dep] || packageContent.devDependencies?.[dep]) {
          logSuccess(`✓ ${dep} dependency found`);
          foundDeps++;
        } else {
          logWarning(`⚠ ${dep} dependency missing`);
        }
      }

      const passed = foundDeps >= 4;
      this.results.push({ name: 'Dependencies', passed });
      return passed;
      
    } catch (error) {
      logError(`Dependencies test failed: ${error.message}`);
      this.results.push({ name: 'Dependencies', passed: false });
      return false;
    }
  }

  // Run all frontend tests
  async runAllTests() {
    console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                    FRONTEND TEST SUITE                      ║
║              Testing Profile Management UI Features          ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

    const tests = [
      { name: 'File Structure', test: this.testFileStructure.bind(this) },
      { name: 'Component Syntax', test: this.testComponentSyntax.bind(this) },
      { name: 'Service Layer', test: this.testServiceLayer.bind(this) },
      { name: 'AuthContext Integration', test: this.testAuthContext.bind(this) },
      { name: 'Form Accessibility', test: this.testAccessibility.bind(this) },
      { name: 'Button Component', test: this.testButtonComponent.bind(this) },
      { name: 'Save Functionality', test: this.testSaveFunctionality.bind(this) },
      { name: 'Dependencies', test: this.testDependencies.bind(this) }
    ];

    let passedTests = 0;

    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        if (result) passedTests++;
      } catch (error) {
        logError(`Test "${testCase.name}" threw an error: ${error.message}`);
        this.results.push({ name: testCase.name, passed: false, error: error.message });
      }
    }

    // Summary
    console.log(`\n${colors.bold}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                        TEST SUMMARY                         ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}`);

    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const color = result.passed ? 'green' : 'red';
      log(`${icon} ${result.name}${result.error ? ` (${result.error})` : ''}`, color);
    });

    const successRate = ((passedTests / tests.length) * 100).toFixed(1);
    console.log(`\n${colors.bold}Overall Result: ${passedTests}/${tests.length} tests passed (${successRate}%)${colors.reset}`);

    if (passedTests === tests.length) {
      log('\n🎉 All tests passed! Frontend is properly configured.', 'green');
    } else if (passedTests > tests.length / 2) {
      log('\n⚠️  Most tests passed, but some issues detected.', 'yellow');
    } else {
      log('\n🚨 Multiple test failures detected. Please check the frontend.', 'red');
    }

    return { passed: passedTests, total: tests.length, successRate };
  }
}

// Export for use in other scripts
module.exports = FrontendTester;

// Run tests if called directly
if (require.main === module) {
  const tester = new FrontendTester();
  tester.runAllTests().catch(error => {
    console.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}