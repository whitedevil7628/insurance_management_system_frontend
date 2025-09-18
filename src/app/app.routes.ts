import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

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
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' }
  },
  { 
    path: 'customer', 
    loadComponent: () => import('./customer/customer').then(c => c.Customer),
    canActivate: [AuthGuard],
    data: { role: 'CUSTOMER' }
  },
  { 
    path: 'agent', 
    loadComponent: () => import('./agent/agent').then(c => c.Agent),
    canActivate: [AuthGuard],
    data: { role: 'AGENT' }
  },
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  },
  { path: '**', redirectTo: '/unauthorized' }
];
