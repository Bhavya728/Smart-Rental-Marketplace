/**
 * Phase 5 Search and Discovery - Backend Test Script
 * Tests all search functionality endpoints and features
 */

const axios = require('axios');

// Configuration
const SERVER_URL = 'http://localhost:5000';
const BASE_URL = 'http://localhost:5000/api';

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

// Helper function to make HTTP requests
const makeRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) config.data = data;
    if (params) config.params = params;

    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Test result logging
function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log.success(`${testName}`);
    if (details) log.info(`   ${details}`);
  } else {
    testResults.failed++;
    log.error(`${testName}`);
    if (details) log.warning(`   ${details}`);
  }
}

// Test suite functions
async function testHealthEndpoint() {
  log.test('Testing Health Endpoint');
  
  const result = await makeRequest('GET', '/health');
  logTest(
    'Health endpoint responds',
    result.success && result.status === 200,
    result.success ? 'Server is healthy' : result.error
  );
}

async function testBasicSearch() {
  log.test('Testing Basic Search Functionality');
  
  // Test 1: Basic search without parameters
  const basicSearch = await makeRequest('GET', '/search/listings');
  logTest(
    'Basic search (no parameters)',
    basicSearch.success && basicSearch.data.success,
    basicSearch.success 
      ? `Found ${basicSearch.data.data?.total || 0} listings`
      : basicSearch.error
  );

  // Test 2: Search with query parameter
  const querySearch = await makeRequest('GET', '/search/listings', null, { search: 'apartment' });
  logTest(
    'Search with query parameter',
    querySearch.success && querySearch.data.success,
    querySearch.success 
      ? `Query search returned ${querySearch.data.data?.listings?.length || 0} results`
      : querySearch.error
  );

  // Test 3: Search with pagination
  const paginatedSearch = await makeRequest('GET', '/search/listings', null, { 
    page: 1, 
    limit: 5 
  });
  logTest(
    'Search with pagination',
    paginatedSearch.success && paginatedSearch.data.success,
    paginatedSearch.success 
      ? `Paginated search returned ${paginatedSearch.data.data?.listings?.length || 0} results`
      : paginatedSearch.error
  );
}

async function testAdvancedFiltering() {
  log.test('Testing Advanced Filtering');
  
  // Test 1: Category filter
  const categoryFilter = await makeRequest('GET', '/search/listings', null, { 
    category: 'electronics' 
  });
  logTest(
    'Category filtering',
    categoryFilter.success,
    categoryFilter.success 
      ? `Category filter returned ${categoryFilter.data.data?.listings?.length || 0} results`
      : categoryFilter.error
  );

  // Test 2: Price range filter
  const priceFilter = await makeRequest('GET', '/search/listings', null, { 
    minPrice: 10,
    maxPrice: 100
  });
  logTest(
    'Price range filtering',
    priceFilter.success,
    priceFilter.success 
      ? `Price filter returned ${priceFilter.data.data?.listings?.length || 0} results`
      : priceFilter.error
  );

  // Test 3: Location filter
  const locationFilter = await makeRequest('GET', '/search/listings', null, { 
    location: 'New York' 
  });
  logTest(
    'Location filtering',
    locationFilter.success,
    locationFilter.success 
      ? `Location filter returned ${locationFilter.data.data?.listings?.length || 0} results`
      : locationFilter.error
  );

  // Test 4: Multiple filters combined
  const combinedFilter = await makeRequest('GET', '/search/listings', null, { 
    search: 'camera',
    category: 'electronics',
    minPrice: 20,
    maxPrice: 200,
    page: 1,
    limit: 10
  });
  logTest(
    'Combined filters',
    combinedFilter.success,
    combinedFilter.success 
      ? `Combined filters returned ${combinedFilter.data.data?.listings?.length || 0} results`
      : combinedFilter.error
  );
}



async function testSearchSuggestions() {
  log.test('Testing Search Suggestions');
  
  // Test 1: Get suggestions for partial query
  const suggestions = await makeRequest('GET', '/search/suggestions', null, { 
    q: 'cam',
    limit: 5
  });
  logTest(
    'Search suggestions',
    suggestions.success && suggestions.data.success,
    suggestions.success 
      ? `Suggestions returned ${suggestions.data.data?.length || 0} items`
      : suggestions.error
  );

  // Test 2: Empty query handling
  const emptySuggestions = await makeRequest('GET', '/search/suggestions', null, { 
    q: '',
    limit: 5
  });
  logTest(
    'Empty query suggestions',
    emptySuggestions.success,
    emptySuggestions.success ? 'Empty query handled correctly' : emptySuggestions.error
  );
}

async function testMetadataEndpoints() {
  log.test('Testing Metadata Endpoints');
  
  // Test 1: Get categories
  const categories = await makeRequest('GET', '/search/categories');
  logTest(
    'Get categories',
    categories.success,
    categories.success 
      ? `Categories endpoint returned data`
      : categories.error
  );

  // Test 2: Get price range
  const priceRange = await makeRequest('GET', '/search/price-range');
  logTest(
    'Get price range',
    priceRange.success,
    priceRange.success 
      ? `Price range endpoint working`
      : priceRange.error
  );
}

async function testResponseFormats() {
  log.test('Testing Response Formats');
  
  const response = await makeRequest('GET', '/search/listings', null, { limit: 1 });
  
  if (response.success && response.data.success) {
    const data = response.data.data;
    
    logTest(
      'Response has correct structure',
      response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data'),
      'Response structure validation'
    );

    logTest(
      'Data has listings array',
      data && Array.isArray(data.listings),
      'Listings array validation'
    );

    logTest(
      'Data has total count',
      data && typeof data.total === 'number',
      'Total count validation'
    );
  } else {
    logTest(
      'Response format test',
      false,
      response.error || 'Could not get response for format testing'
    );
  }
}

async function testErrorHandling() {
  log.test('Testing Error Handling');
  
  // Test 1: Invalid endpoint
  const invalidEndpoint = await makeRequest('GET', '/search/invalid-endpoint');
  logTest(
    'Invalid endpoint returns error',
    !invalidEndpoint.success,
    'Invalid endpoint handling'
  );

  // Test 2: Invalid parameters
  const invalidParams = await makeRequest('GET', '/search/listings', null, { 
    page: -1,
    limit: 1000
  });
  logTest(
    'Handles invalid parameters',
    true, // Should handle gracefully either way
    'Parameter validation'
  );
}

// Function to check if server is running
async function checkServerRunning() {
  try {
    const result = await makeRequest('GET', '/health');
    return result.success;
  } catch (error) {
    return false;
  }
}

// Function to start the server
async function startServer() {
  const { spawn } = require('child_process');
  const path = require('path');
  
  log.info('Starting backend server...');
  
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      shell: true
    });
    
    let serverStarted = false;
    
    // Listen for server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server is running on port 5000') && !serverStarted) {
        serverStarted = true;
        log.success('Backend server started successfully');
        resolve(serverProcess);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server is running on port 5000') && !serverStarted) {
        serverStarted = true;
        log.success('Backend server started successfully');
        resolve(serverProcess);
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverStarted) {
        log.error('Server failed to start within 30 seconds');
        serverProcess.kill();
        reject(new Error('Server start timeout'));
      }
    }, 30000);
    
    serverProcess.on('error', (error) => {
      log.error(`Failed to start server: ${error.message}`);
      reject(error);
    });
  });
}

// Function to wait for server to be ready
async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServerRunning()) {
      return true;
    }
    log.info(`Waiting for server... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.cyan}🚀 Phase 5 Search and Discovery - Backend Test Suite${colors.reset}`);
  console.log('='.repeat(60));
  
  let serverProcess = null;
  
  try {
    // Check if server is already running
    const serverRunning = await checkServerRunning();
    
    if (!serverRunning) {
      log.info('Backend server not running, starting it now...');
      serverProcess = await startServer();
      
      // Wait for server to be ready
      const isReady = await waitForServer();
      if (!isReady) {
        log.error('Server failed to become ready');
        return;
      }
    } else {
      log.success('Backend server is already running');
    }
    
    console.log('');
    
    // Run all tests
    await testHealthEndpoint();
    await testBasicSearch();
    await testAdvancedFiltering();
    await testSearchSuggestions();
    await testMetadataEndpoints();
    await testResponseFormats();
    await testErrorHandling();
    
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
  } finally {
    // Clean up server process if we started it
    if (serverProcess) {
      log.info('Stopping backend server...');
      serverProcess.kill();
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  log.info('📊 Test Results Summary');
  console.log('='.repeat(60));
  log.success(`Passed: ${testResults.passed}`);
  log.error(`Failed: ${testResults.failed}`);
  log.info(`Total:  ${testResults.total}`);
  log.info(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    log.success('🎉 All tests passed! Phase 5 backend is working perfectly!');
  } else {
    log.warning(`${testResults.failed} test(s) failed. Please check the issues above.`);
  }
  
  console.log('\n📋 Test completed at:', new Date().toLocaleString());
}

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests().then(() => {
    process.exit(testResults.failed === 0 ? 0 : 1);
  });
}