import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { Login } from './login/login';
import { SignupComponent } from './signup/signup';
import { Customer } from './customer/customer';
import { Agent } from './agent/agent';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'signup', component: SignupComponent },
  { path: 'customer', component: Customer },
  { path: 'agent', component: Agent },
  { path: '**', redirectTo: '/home' }
];