import { HttpInterceptorFn } from '@angular/common/http';

// SIMPLE HTTP INTERCEPTOR - Automatically adds JWT token to all requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('jwt');
  
  // If token exists, add it to the request headers
  if (token) {
    // Clone the request and add Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Continue with the modified request
    return next(authReq);
  }
  
  // If no token, continue with original request
  return next(req);
};