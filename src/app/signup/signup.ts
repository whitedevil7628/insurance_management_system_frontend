import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoginRegisterService } from '../Services/login-register-service';
import { JwtService } from '../Services/jwt.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  providers: [LoginRegisterService],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  signupForm: FormGroup;
  searchTerm = signal('');
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: LoginRegisterService,
    private jwtService: JwtService
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
      
      this.userService.signup(signupData).subscribe({
        next: (response) => {
          this.showNotificationMessage('Signup successful! Redirecting to login...', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Signup error:', error);
          console.log('Error status:', error.status);
          console.log('Error body:', error.error);
          let errorMessage = 'Signup failed! Please try again.';
          
          // Handle specific backend error responses
          if (error.status === 409 || error.status === 500) {
            const errorText = error.error;
            let fullErrorMessage = '';
            
            // Extract the actual error message from different response formats
            if (typeof errorText === 'string') {
              fullErrorMessage = errorText;
            } else if (typeof errorText === 'object' && errorText.message) {
              fullErrorMessage = errorText.message;
            }
            
            console.log('Full error message:', fullErrorMessage);
            
            // Check for specific error patterns (case-insensitive)
            const lowerErrorMessage = fullErrorMessage.toLowerCase();
            
            if (lowerErrorMessage.includes('email') && lowerErrorMessage.includes('already exists')) {
              errorMessage = 'Email address already exists. Please use a different email.';
            } else if (lowerErrorMessage.includes('aadhaar') && lowerErrorMessage.includes('already exists')) {
              errorMessage = 'Aadhaar number already exists. Please check your details.';
            } else if (lowerErrorMessage.includes('409 conflict')) {
              // This is a fallback for wrapped conflict errors
              if (lowerErrorMessage.includes('customer/add')) {
                errorMessage = 'Account with these details already exists.';
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