import { HttpInterceptorFn } from '@angular/common/http';

// HTTP INTERCEPTOR - Automatically adds JWT token to all requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  
  if (token) {
    // Add both Authorization formats for compatibility
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return next(authReq);
  }
  
  return next(req);
};