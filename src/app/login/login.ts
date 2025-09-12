import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule,RouterModule,RouterOutlet],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    if (this.email && this.password) {
      this.isLoading = true;
      
      const loginData = {
        email: this.email,
        password: this.password
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      this.http.post('http://localhost:8763/auth/login', loginData, { 
        headers,
        responseType: 'text'
      })
        .subscribe({
          next: (response) => {
            console.log('Raw response:', response);
            try {
              const jsonResponse = JSON.parse(response);
              if (jsonResponse.token) {
                localStorage.setItem('authToken', jsonResponse.token);
                this.router.navigate(['/dashboard']);
              } else {
                console.log('No token in response:', jsonResponse);
              }
            } catch (e) {
              // If response is just the token string
              localStorage.setItem('authToken', response);
              this.router.navigate(['/dashboard']);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials or try again later.');
            this.isLoading = false;
          }
        });
    }
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
