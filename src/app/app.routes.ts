import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { JwtService } from './Services/jwt.service';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home').then(c => c.HomeComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login').then(c => c.Login)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./signup/signup').then(c => c.SignupComponent)
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./admin/admin').then(c => c.Admin),
    canActivate: [() => inject(JwtService).hasRole('ADMIN')]
  },
  { 
    path: 'customer', 
    loadComponent: () => import('./customer/customer').then(c => c.Customer),
    canActivate: [() => inject(JwtService).hasRole('CUSTOMER')]
  },
  { 
    path: 'agent', 
    loadComponent: () => import('./agent/agent').then(c => c.Agent),
    canActivate: [() => inject(JwtService).hasRole('AGENT')]
  },
  { path: '**', redirectTo: '/home' }
];
