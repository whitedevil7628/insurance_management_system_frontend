import { HttpInterceptorFn } from '@angular/common/http';

// HTTP INTERCEPTOR - Automatically adds JWT token to all requests
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  
  if (token && token.trim()) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  
  return next(req);
};