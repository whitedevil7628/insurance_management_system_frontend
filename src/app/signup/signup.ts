import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './signup.html'
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['', Validators.required],
      date: ['', Validators.required],
      aadharnumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
    });
  }

  onSubmitSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const signupData = { ...this.signupForm.value, role: 'CUSTOMER' };

      this.http.post('http://localhost:8763/auth/register', signupData, { responseType: 'text' }).subscribe({
        next: (response: string) => {
          this.showNotificationMessage('Signup successful! Redirecting to login...', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Signup error:', error);
          let errorMessage = 'Signup failed! Please try again.';

          if (error.status === 409 || error.status === 500) {
            const errorText = error.error;
            if (typeof errorText === 'string') {
              if (errorText.includes('Customer already exist With this email ID')) {
                errorMessage = 'This email is already registered. Please use a different email address.';
              } else if (errorText.includes('Customer already exist With this Aadhar number')) {
                errorMessage = 'This Aadhaar number is already registered. Please verify your Aadhaar number.';
              }
            }
          }

          this.showNotificationMessage(errorMessage, 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.showNotificationMessage('Please fill all required fields correctly.', 'error');
      this.signupForm.markAllAsTouched();
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Enter valid 10-digit phone number';
        if (fieldName === 'aadharnumber') return 'Enter valid 12-digit Aadhaar number';
      }
    }
    return '';
  }
}