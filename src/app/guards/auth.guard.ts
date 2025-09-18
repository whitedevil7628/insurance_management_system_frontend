import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtService } from '../Services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = this.jwtService.getToken();
    const userRole = this.jwtService.getUserRole();
    
    if (!token || !userRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const requiredRole = route.data['role'];
    if (requiredRole && userRole.toUpperCase() !== requiredRole.toUpperCase()) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}