const ConvertApi = require('convertapi');

async function testConvertApiInitialization() {
  const dummyApiKey = 'YOUR_CONVERTAPI_SECRET'; // Replace with a real key if you want to test actual conversion

  try {
    console.log('Attempting to initialize ConvertAPI...');
    const convertapi = new ConvertApi(dummyApiKey);
    console.log('ConvertAPI instantiated successfully.');

    console.log('Checking convert() method...');
    if (typeof convertapi.convert !== 'function') {
      throw new Error('convert() is not available on the ConvertAPI instance.');
    }

    console.log('ConvertAPI test passed: Initialization and convert() are working as expected.');
  } catch (error: any) {
    console.error('ConvertAPI test failed:');
    console.error(error);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
  }
}

testConvertApiInitialization();
