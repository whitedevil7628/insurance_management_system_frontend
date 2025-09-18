import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #f0f4f8, #d6e7f0);">
      <div class="text-center">
        <div class="mb-4">
          <i class="fas fa-shield-alt" style="font-size: 5rem; color: #dc3545;"></i>
        </div>
        <h1 class="display-4 fw-bold text-danger mb-3">Access Denied</h1>
        <p class="lead text-muted mb-4">You are not authorized to access this page.</p>
        <div class="d-flex gap-3 justify-content-center">
          <button class="btn btn-primary" (click)="goToLogin()">
            <i class="fas fa-sign-in-alt me-2"></i>Login
          </button>
          <button class="btn btn-outline-secondary" (click)="goToHome()">
            <i class="fas fa-home me-2"></i>Home
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}