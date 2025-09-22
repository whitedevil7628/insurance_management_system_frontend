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
  templateUrl: './signup.html',
  styleUrl: './signup.css'
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
      address: ['', Validators.required]
    });
    

  }

  onSubmitSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const signupData = { ...this.signupForm.value, role: 'CUSTOMER' };

      this.http.post('http://localhost:8763/auth/register', signupData, { responseType: 'text' }).subscribe({
        next: (response: string) => {
          this.showNotificationMessage('Account created successfully! Redirecting to login...', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Signup error:', error);
          let errorMessage = 'Registration failed! Please try again.';

          if (error.status === 409 || error.status === 400 || error.status === 500) {
            const errorText = (error.error || error.message || '').toLowerCase();
            console.log('Full error object:', error);
            console.log('Error text for matching:', errorText);
            
            if (errorText.includes('customer with this email already exists') || 
                errorText.includes('customer already exist with this email id') ||
                errorText.includes('email already exists') ||
                errorText.includes('email')) {
              errorMessage = 'Email Already Registered!';
            } 
            else if (errorText.includes('customer with this aadhaar number already exists') || 
                     errorText.includes('customer already exist with this aadhar number') ||
                     errorText.includes('aadhaar number already exists') ||
                     errorText.includes('aadhar already exists') ||
                     errorText.includes('aadhaar') ||
                     errorText.includes('aadhar')) {
              errorMessage = 'Aadhaar Already Registered!';
            }
            else if (errorText.includes('aadhaar number must be a 12-digit number') ||
                     errorText.includes('invalid aadhaar')) {
              errorMessage = 'Please enter a valid 12-digit Aadhaar number';
            }
            else if (errorText.includes('invalid email')) {
              errorMessage = 'Invalid Email Format!.';
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
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'Full Name',
          'email': 'Email Address', 
          'password': 'Password',
          'gender': 'Gender',
          'date': 'Date of Birth',
          'phone': 'Phone Number',
          'aadharnumber': 'Aadhaar Number',
          'address': 'Address'
        };
        return `${fieldLabels[fieldName] || fieldName} is required`;
      }
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) {
        if (fieldName === 'password') return 'Password must be at least 6 characters';
        return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Please enter a valid 10-digit phone number';
        if (fieldName === 'aadharnumber') return 'Please enter a valid 12-digit Aadhaar number';
      }
    }
    return '';
  }

  // Real-time validation for email and Aadhaar
  onEmailBlur() {
    const email = this.signupForm.get('email')?.value;
    if (email && this.signupForm.get('email')?.valid) {
      // Optional: Add real-time email check here if needed
    }
  }

  onAadhaarBlur() {
    const aadhaar = this.signupForm.get('aadharnumber')?.value;
    if (aadhaar && this.signupForm.get('aadharnumber')?.valid) {
      // Optional: Add real-time Aadhaar check here if needed
    }
  }
  

}