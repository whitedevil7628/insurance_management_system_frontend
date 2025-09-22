// Quick token check - run this in browser console
const token = localStorage.getItem('jwt');
const payload = JSON.parse(atob(token.split('.')[1]));
const now = Math.floor(Date.now() / 1000);

console.log('Token payload:', payload);
console.log('Current timestamp:', now);
console.log('Token expires at:', new Date(payload.exp * 1000));
console.log('Token issued at:', new Date(payload.iat * 1000));
console.log('Token expired?', payload.exp < now);
console.log('Token valid?', payload.iat <= now && payload.exp > now);