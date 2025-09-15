import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { Login } from './login/login';
import { SignupComponent } from './signup/signup';
import { Customer } from './customer/customer';
import { Admin } from './admin/admin';
import { AuthGuard, AdminGuard } from './Services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'signup', component: SignupComponent },
  { path: 'customer', component: Customer, canActivate: [AuthGuard] },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: '/home' }
];