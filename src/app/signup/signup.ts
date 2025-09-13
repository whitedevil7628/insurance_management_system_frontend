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
          alert('Signup successful!');
          this.userService.getJwt(signupData.email, signupData.password).subscribe({
            next: (jwtResponse: any) => {
              localStorage.setItem('jwt', jwtResponse);
              this.jwtService.redirectBasedOnRole();
              this.isLoading = false;
            },
            error: () => {
              alert('Could not get JWT after signup.');
              this.router.navigate(['/login']);
              this.isLoading = false;
            }
          });
        },
        error: () => {
          alert('Signup failed!');
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form is invalid.');
      this.signupForm.markAllAsTouched();
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
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