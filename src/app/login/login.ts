import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../Services/jwt.service';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  constructor(private router: Router, private http: HttpClient, private jwtService: JwtService) {}

  onLogin() {
    // Validate inputs
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    if (this.email.trim() === '' || this.password.trim() === '') {
      alert('Email and password cannot be empty.');
      return;
    }

    this.isLoading = true;
    
    // Clear any existing tokens before login
    this.jwtService.cleanupTokens();
    localStorage.removeItem('jwt');

    const loginData = {
      email: this.email.trim(),
      password: this.password.trim(),
    };

    console.log('Sending login data:', { email: loginData.email, password: '***' });

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      this.http
        .post('http://localhost:8763/auth/login', loginData, {
          headers,
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            localStorage.setItem('jwt', response.trim());
            this.jwtService.redirectBasedOnRole();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Login failed:', error);
            let errorMessage = 'Login failed. Please check your credentials.';
            
            if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            } else if (error.status === 401) {
              errorMessage = 'Invalid email or password.';
            }
            
            alert(errorMessage);
            this.isLoading = false;
          },
        });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
