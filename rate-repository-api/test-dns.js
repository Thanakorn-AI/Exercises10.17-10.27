// Exercises10.17-10.27/rate-repository-api/test-dns.js
const dns = require('dns').promises;

async function testDNS() {
  try {
    const addresses = await dns.resolve('api.github.com');
    console.log('DNS Resolution Successful:', addresses);
  } catch (error) {
    console.error('DNS Resolution Failed:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
  }
}

testDNS();
