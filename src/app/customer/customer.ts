import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JwtService } from '../Services/jwt.service';
import { CustomerService } from '../Services/customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  providers: [CustomerService],
  templateUrl: './customer.html',
  styleUrl: './customer.css'
})
export class Customer implements OnInit {
  activeSection = 'policies';
  customerName = '';
  customerInitials = '';
  customerId: number | null = null;
  policies: any[] = [];
  myPolicies: any[] = [];
  profileForm: FormGroup;
  isLoading = false;
  searchTerm = '';
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showClaimForm = false;
  selectedPolicy: any = null;
  claimForm: FormGroup;
  customerClaims: any[] = [];

  constructor(
    private jwtService: JwtService,
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
      gender: ['', Validators.required],
      date: ['', Validators.required],
      aadharnumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required]
    });
    
    this.claimForm = this.fb.group({
      policyId: [{value: '', disabled: true}],
      policyName: [{value: '', disabled: true}],
      customerId: [{value: '', disabled: true}],
      customerName: [{value: '', disabled: true}],
      claimAmount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadPolicies();
    this.loadProfile();
    this.loadClaims();
  }

  loadUserData() {
    const name = this.jwtService.getUserName();
    this.customerId = this.jwtService.getCustomerId();
    if (name) {
      this.customerName = name;
      this.customerInitials = this.jwtService.getInitials(name);
    }
    console.log('Customer ID from JWT:', this.customerId);
  }

  loadPolicies() {
    this.isLoading = true;
    this.customerService.getAllPolicies().subscribe({
      next: (data) => {
        this.policies = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
    
    // Load customer-specific policies
    this.customerService.getCustomerPolicies().subscribe({
      next: (data) => {
        // Handle single policy object or array
        this.myPolicies = Array.isArray(data) ? data : [data];
      },
      error: () => {
        this.myPolicies = [];
      }
    });
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.customerService.updateProfile(this.profileForm.value).subscribe({
        next: (response) => {
          console.log('Profile update response:', response);
          this.showNotificationMessage('Profile updated successfully!', 'success');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          this.showNotificationMessage('Failed to update profile. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.showNotificationMessage('Please fill all required fields correctly.', 'error');
    }
  }

  logout() {
    this.jwtService.logout();
  }

  loadProfile() {
    this.customerService.getCustomerProfile().subscribe({
      next: (data) => {
        this.profileForm.patchValue({
          name: data.name,
          email: data.email,
          gender: data.gender,
          date: data.date,
          aadharnumber: data.aadharnumber,
          phone: data.phone,
          address: data.address
        });
      },
      error: () => {
        console.log('Failed to load profile');
      }
    });
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  getFilteredPolicies() {
    return this.policies.filter(policy => 
      policy.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openClaimForm(policy: any) {
    this.selectedPolicy = policy;
    this.claimForm.patchValue({
      policyId: policy.policyId || policy.id,
      policyName: policy.name || 'No Name',
      customerId: this.customerId,
      customerName: this.customerName,
      claimAmount: ''
    });
    this.showClaimForm = true;
  }

  closeClaimForm() {
    this.showClaimForm = false;
    this.selectedPolicy = null;
    this.claimForm.reset();
  }

  submitClaim() {
    if (this.claimForm.valid && this.selectedPolicy) {
      const claimData = {
        policyId: this.selectedPolicy.policyId || this.selectedPolicy.id,
        customerId: this.customerId,
        agentId: this.selectedPolicy.agentId || 17,
        claimAmount: this.claimForm.get('claimAmount')?.value
      };

      this.isLoading = true;
      this.customerService.fileClaim(claimData).subscribe({
        next: (response) => {
          this.showNotificationMessage('Claim filed successfully!', 'success');
          this.closeClaimForm();
          this.loadClaims();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Claim filing error:', error);
          this.showNotificationMessage('Failed to file claim. Please try again.', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  loadClaims() {
    this.customerService.getCustomerClaims().subscribe({
      next: (data) => {
        this.customerClaims = Array.isArray(data) ? data : [data];
      },
      error: () => {
        this.customerClaims = [];
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'FILED': return '#007bff';
      case 'UNDER_REVIEW': return '#ffc107';
      case 'APPROVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'FILED': return 'fas fa-file-alt';
      case 'UNDER_REVIEW': return 'fas fa-search';
      case 'APPROVED': return 'fas fa-check-circle';
      case 'REJECTED': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  buyPolicy(policy: any) {
    if (!this.customerId) {
      this.showNotificationMessage('Customer ID not found. Please login again.', 'error');
      return;
    }

    const policyData = {
      customerId: this.customerId,
      name: policy.name || 'No Name',
      policyType: policy.policy_type || 'N/A',
      premiumAmount: policy.premium_amount || 0,
      coverageAmount: policy.coverageamount || 0,
      coverageDetails: policy.coverage_details || 'No Description',
      validityPeriod: 1
    };

    this.isLoading = true;
    this.customerService.buyPolicy(policyData).subscribe({
      next: (response) => {
        this.showNotificationMessage('Policy selected successfully!', 'success');
        this.loadPolicies();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Policy selection error:', error);
        this.showNotificationMessage('Failed to select policy. Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }
}
