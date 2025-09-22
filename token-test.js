// Run this in browser console to test token
console.log('=== JWT TOKEN TEST ===');

const token = localStorage.getItem('jwt');
console.log('1. Token exists:', !!token);
console.log('2. Token length:', token?.length);

if (token) {
  try {
    const parts = token.split('.');
    console.log('3. Token parts:', parts.length);
    
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      console.log('4. Token payload:', payload);
      console.log('5. Current time:', now);
      console.log('6. Token expires:', payload.exp);
      console.log('7. Token valid:', payload.exp > now);
      console.log('8. Customer ID:', payload.customerId);
      console.log('9. Role:', payload.role);
      
      // Test manual API call
      console.log('10. Testing manual API call...');
      fetch('http://localhost:8763/customer/getCustomer/1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('11. API Response status:', response.status);
        console.log('12. API Response ok:', response.ok);
        return response.text();
      })
      .then(data => {
        console.log('13. API Response data:', data);
      })
      .catch(error => {
        console.log('14. API Error:', error);
      });
    }
  } catch (error) {
    console.log('Error parsing token:', error);
  }
}