/* eslint-disable indent */
/* eslint-disable prettier/prettier */

/**
 * Test both legacy positional and new object-based constructor patterns
 */

import SDK from './index.js';

console.log('Testing SDK Constructor Patterns...\n');

// Test 1: Legacy positional parameters (backwards compatibility)
console.log('✅ Testing legacy positional parameters:');
try {
  const legacySDK = new SDK(
    'test-namespace',
    'call-123',
    'jwt-token',
    'request-456',
  );
  console.log(`  - namespace: ${legacySDK.namespace}`);
  console.log(`  - callId: ${legacySDK.callId}`);
  console.log(`  - token: ${legacySDK.token}`);
  console.log(`  - fwRequestId: ${legacySDK.fwRequestId}`);
  console.log('  ✅ Legacy positional constructor works!\n');
} catch (error) {
  console.error('  ❌ Legacy constructor failed:', error.message);
}

// Test 2: New object-based parameters
console.log('✅ Testing new object-based parameters:');
try {
  const modernSDK = new SDK({
    namespace: 'test-namespace',
    callId: 'call-123',
    token: 'jwt-token',
    fwRequestId: 'request-456',
    url: 'api.example.com',
    socketStore: null,
  });
  console.log(`  - namespace: ${modernSDK.namespace}`);
  console.log(`  - callId: ${modernSDK.callId}`);
  console.log(`  - token: ${modernSDK.token}`);
  console.log(`  - fwRequestId: ${modernSDK.fwRequestId}`);
  console.log('  ✅ Object-based constructor works!\n');
} catch (error) {
  console.error('  ❌ Object constructor failed:', error.message);
}

// Test 3: Partial object parameters
console.log('✅ Testing partial object parameters:');
try {
  const partialSDK = new SDK({
    namespace: 'test-namespace',
    token: 'jwt-token',
    // callId and fwRequestId are optional
  });
  console.log(`  - namespace: ${partialSDK.namespace}`);
  console.log(`  - callId: ${partialSDK.callId || 'undefined'}`);
  console.log(`  - token: ${partialSDK.token}`);
  console.log(`  - fwRequestId: ${partialSDK.fwRequestId || 'undefined'}`);
  console.log('  ✅ Partial object constructor works!\n');
} catch (error) {
  console.error('  ❌ Partial object constructor failed:', error.message);
}

// Test 4: Empty constructor
console.log('✅ Testing empty constructor:');
try {
  const emptySDK = new SDK();
  console.log(`  - namespace: ${emptySDK.namespace || 'undefined'}`);
  console.log(`  - callId: ${emptySDK.callId || 'undefined'}`);
  console.log(`  - token: ${emptySDK.token || 'undefined'}`);
  console.log(`  - fwRequestId: ${emptySDK.fwRequestId || 'undefined'}`);
  console.log('  ✅ Empty constructor works!\n');
} catch (error) {
  console.error('  ❌ Empty constructor failed:', error.message);
}

// Test 5: Factory function
console.log('✅ Testing factory function:');
try {
  const { createSDK } = await import('./index.js');
  const factorySDK = createSDK({
    namespace: 'factory-test',
    token: 'factory-token',
  });
  console.log(`  - namespace: ${factorySDK.namespace}`);
  console.log(`  - token: ${factorySDK.token}`);
  console.log('  ✅ Factory function works!\n');
} catch (error) {
  console.error('  ❌ Factory function failed:', error.message);
}

console.log('🎉 All constructor pattern tests completed!');

// Test that services are still available
console.log('\n✅ Verifying services are available:');
const testSDK = new SDK({ namespace: 'test' });
const services = [
  'login',
  'objects',
  'messaging',
  'video',
  'voice',
  'ai',
  'lookup',
  'layouts',
  'subscriptions',
  'workflows',
  'notes',
  'storage',
  'verification',
  'portals',
  'sipEndpoints',
  'externalOAuth',
  'googleCalendar',
  'drive',
  'enroll',
  'phoneNumbers',
  'recordTypes',
  'generateId',
];

services.forEach((service) => {
  if (testSDK[service]) {
    console.log(`  ✅ ${service}`);
  } else {
    console.log(`  ❌ ${service} - MISSING!`);
  }
});

console.log('\n🚀 Constructor pattern upgrade complete!');
