import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtService } from '../Services/jwt.service';
import { CustomerService } from '../Services/customer.service';


@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  providers: [CustomerService],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer implements OnInit, OnDestroy {
  activeSection = 'policies';
  customerName = '';
  customerInitials = '';
  customerId: number | null = null;
  policies: any[] = [];
  myPolicies: any[] = [];
  profileForm: FormGroup;
  isLoading = false;
  isPolicyLoading = false;
  isClaimLoading = false;
  isProfileLoading = false;
  searchTerm = '';
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showClaimForm = false;
  showPolicyDetails = false;
  selectedPolicy: any = null;
  selectedPolicyForDetails: any = null;
  claimForm: FormGroup;
  queryForm: FormGroup;
  customerClaims: any[] = [];
  isQueryLoading = false;

  // Notifications
  notifications: any[] = [];
  showNotificationPanel = false;
  notificationInterval: any;



  constructor(
    private jwtService: JwtService,
    private customerService: CustomerService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(6)],
      gender: ['', Validators.required],
      date: ['', Validators.required],
      aadharnumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
    });

    this.claimForm = this.fb.group({
      policyId: [{ value: '', disabled: true }],
      policyName: [{ value: '', disabled: true }],
      customerId: [{ value: '', disabled: true }],
      customerName: [{ value: '', disabled: true }],
      coverageAmount: [{ value: '', disabled: true }],
      claimAmount: ['', [Validators.required, Validators.min(1)]],
    });

    // Add real-time validation for claim amount
    this.claimForm.get('claimAmount')?.valueChanges.subscribe((value) => {
      if (value && this.selectedPolicy) {
        const coverageAmount =
          this.selectedPolicy.coverageAmount ||
          this.selectedPolicy.coverage ||
          parseFloat(this.selectedPolicy[0]) ||
          0;

        if (parseFloat(value) > coverageAmount) {
          this.showNotificationMessage(
            `Claim amount cannot exceed coverage limit of ₹${coverageAmount}`,
            'error'
          );
        }
      }
    });

    this.queryForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      service: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (!this.jwtService.getToken() || this.jwtService.getUserRole() !== 'CUSTOMER') {
      this.showNotificationMessage('Not authorized to access this page', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserData();
    this.loadPolicies();
    this.loadProfile();
    this.loadClaims();
    this.loadNotifications();
    this.startNotificationPolling();

  }

  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
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
        console.log('Policies data received:', data);
        this.policies = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading policies:', error);
        this.policies = [];
        this.isLoading = false;
        this.showNotificationMessage('Failed to load policies', 'error');
      },
    });

    // Load customer-specific policies
    this.customerService.getCustomerPolicies().subscribe({
      next: (data) => {
        // Handle single policy object or array
        this.myPolicies = Array.isArray(data) ? data : [data];
      },
      error: (error) => {
        this.myPolicies = [];
        const errorMsg = error.error?.message || error.message;
        if (errorMsg && errorMsg.includes('not found')) {
          console.log('No policies found for customer');
        } else {
          this.showNotificationMessage('Failed to load your policies', 'error');
        }
      },
    });
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.isProfileLoading = true;
      this.customerService.updateProfile(this.profileForm.value).subscribe({
        next: (response) => {
          console.log('Profile update response:', response);
          this.showNotificationMessage('Profile updated successfully!', 'success');
          this.isProfileLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          const errorMsg = error.error?.message || error.message || 'Failed to update profile';
          if (errorMsg.includes('not found')) {
            this.showNotificationMessage('Profile not found', 'error');
          } else {
            this.showNotificationMessage('Update failed. Try again', 'error');
          }
          this.isProfileLoading = false;
        },
      });
    } else {
      this.showNotificationMessage('Please fill all required fields', 'error');
    }
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      if (this.notificationInterval) {
        clearInterval(this.notificationInterval);
      }
      this.jwtService.logout();
      this.router.navigate(['/login']);
    }
  }

  startNotificationPolling() {
    this.notificationInterval = setInterval(() => {
      this.loadNotifications();
    }, 10000); // Check every 10 seconds
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
          address: data.address,
        });

        // Update navbar display name from profile data
        if (data.name) {
          this.customerName = data.name;
          this.customerInitials = this.jwtService.getInitials(data.name);
        }
      },
      error: (error) => {
        console.log('Failed to load profile');
        const errorMsg = error.error?.message || error.message;
        if (errorMsg && errorMsg.includes('not found')) {
          this.showNotificationMessage('Profile not found', 'error');
        }
      },
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
    if (!this.policies || this.policies.length === 0) {
      console.log('No policies available');
      return [];
    }

    if (!this.searchTerm.trim()) {
      return this.policies;
    }

    console.log('Filtering policies:', this.policies);
    return this.policies.filter((policy) => {
      const name = (policy.name || policy[4] || '').toLowerCase();
      const type = (policy[5] || policy.policyType || '').toLowerCase();
      return (
        name.includes(this.searchTerm.toLowerCase()) || type.includes(this.searchTerm.toLowerCase())
      );
    });
  }

  getFilteredMyPolicies() {
    if (!this.myPolicies || this.myPolicies.length === 0) {
      return [];
    }

    if (!this.searchTerm.trim()) {
      return this.myPolicies;
    }

    return this.myPolicies.filter((policy) => {
      const name = (policy.name || '').toLowerCase();
      const type = (policy.policyType || '').toLowerCase();
      return (
        name.includes(this.searchTerm.toLowerCase()) || type.includes(this.searchTerm.toLowerCase())
      );
    });
  }

  getFilteredClaims() {
    if (!this.customerClaims || this.customerClaims.length === 0) {
      return [];
    }

    if (!this.searchTerm.trim()) {
      return this.customerClaims;
    }

    return this.customerClaims.filter((claim) => {
      const claimId = (claim.claimId?.toString() || '').toLowerCase();
      const status = (claim.status || '').toLowerCase();
      return (
        claimId.includes(this.searchTerm.toLowerCase()) ||
        status.includes(this.searchTerm.toLowerCase())
      );
    });
  }

  getFilteredNotifications() {
    if (!this.notifications || this.notifications.length === 0) {
      return [];
    }

    if (!this.searchTerm.trim()) {
      return this.notifications;
    }

    return this.notifications.filter((notification) => {
      const title = (notification.title || notification.type || '').toLowerCase();
      const message = (notification.message || notification.content || '').toLowerCase();
      return (
        title.includes(this.searchTerm.toLowerCase()) ||
        message.includes(this.searchTerm.toLowerCase())
      );
    });
  }

  isPolicyClaimed(policy: any): boolean {
    const policyId = policy.policyId || policy.id;
    return this.customerClaims.some((claim) => claim.policyId === policyId);
  }

  openClaimForm(policy: any) {
    if (this.isPolicyClaimed(policy)) {
      this.showNotificationMessage('This policy has already been claimed', 'error');
      return;
    }

    this.selectedPolicy = policy;
    const coverageAmount = policy.coverageAmount || policy.coverage || parseFloat(policy[0]) || 0;

    this.claimForm.patchValue({
      policyId: policy.policyId || policy.id,
      policyName: policy.name || 'No Name',
      customerId: this.customerId,
      customerName: this.customerName,
      coverageAmount: coverageAmount,
      claimAmount: '',
    });
    this.showClaimForm = true;
  }

  closeClaimForm() {
    this.showClaimForm = false;
    this.selectedPolicy = null;
    this.claimForm.reset();
  }

  submitClaim() {
    const claimAmount = this.claimForm.get('claimAmount')?.value;

    if (!claimAmount) {
      this.showNotificationMessage('Please enter claim amount', 'error');
      return;
    }

    if (this.selectedPolicy) {
      // Get coverage amount from policy
      const coverageAmount =
        this.selectedPolicy.coverageAmount ||
        this.selectedPolicy.coverage ||
        parseFloat(this.selectedPolicy[0]) ||
        0;

      // Validate claim amount against coverage amount
      if (parseFloat(claimAmount) > coverageAmount) {
        this.showNotificationMessage(
          `Claim amount (₹${claimAmount}) cannot exceed policy coverage amount (₹${coverageAmount})`,
          'error'
        );
        return;
      }

      const claimData = {
        policyId: this.selectedPolicy.policyId || this.selectedPolicy.id,
        customerId: this.customerId,
        agentId: this.selectedPolicy.agentId || 17,
        claimAmount: claimAmount,
      };

      console.log('Filing claim with data:', claimData);
      this.isClaimLoading = true;

      this.customerService.fileClaim(claimData).subscribe({
        next: (response) => {
          console.log('Claim filed successfully:', response);
          this.showNotificationMessage('Claim filed successfully!', 'success');
          this.closeClaimForm();
          this.loadClaims();
          this.loadPolicies(); // Reload policies to update claim status
          this.isClaimLoading = false;
        },
        error: (error) => {
          console.error('Claim filing error:', error);
          const errorMsg = error.error?.message || error.message || 'Failed to file claim';
          if (errorMsg.includes('External service')) {
            this.showNotificationMessage('Service unavailable. Try later', 'error');
          } else {
            this.showNotificationMessage('Claim filing failed', 'error');
          }
          this.isClaimLoading = false;
        },
      });
    }
  }

  loadClaims() {
    this.customerService.getCustomerClaims().subscribe({
      next: (data) => {
        this.customerClaims = Array.isArray(data) ? data : [data];
      },
      error: (error) => {
        this.customerClaims = [];
        const errorMsg = error.error?.message || error.message;
        if (errorMsg && errorMsg.includes('not found')) {
          console.log('No claims found for customer');
        }
      },
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'FILED':
        return '#007bff';
      case 'UNDER_REVIEW':
        return '#ffc107';
      case 'APPROVED':
        return '#28a745';
      case 'REJECTED':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'FILED':
        return 'fas fa-file-alt';
      case 'UNDER_REVIEW':
        return 'fas fa-search';
      case 'APPROVED':
        return 'fas fa-check-circle';
      case 'REJECTED':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  buyPolicy(policy: any) {
    if (!this.customerId) {
      this.showNotificationMessage('Please login again', 'error');
      return;
    }

    console.log('Policy data before processing:', policy);
    console.log('Policy array values:', {
      index0: policy[0],
      index1: policy[1],
      index2: policy[2],
      index3: policy[3],
      index4: policy[4],
      index5: policy[5],
    });

    // Extract values with proper type conversion
    const name = policy[4] || policy.name || 'No Name';
    const policyType = policy[5] || policy.policyType || policy.policy_type || policy.type || 'N/A';
    const premiumAmount =
      parseFloat(policy[2]) ||
      parseFloat(policy.premium_amount) ||
      parseFloat(policy.premiumAmount) ||
      parseFloat(policy.premium) ||
      0;
    const coverageAmount =
      parseFloat(policy[0]) ||
      parseFloat(policy.coverageamount) ||
      parseFloat(policy.coverageAmount) ||
      parseFloat(policy.coverage) ||
      0;
    const coverageDetails =
      policy[3] ||
      policy.coverage_details ||
      policy.coverageDetails ||
      policy.description ||
      'No Description';

    const policyData = {
      customerId: this.customerId,
      name: name,
      policyType: policyType,
      premiumAmount: premiumAmount,
      coverageAmount: coverageAmount,
      coverageDetails: coverageDetails,
      validityPeriod: 1,
    };

    console.log('Extracted values:', {
      name,
      policyType,
      premiumAmount,
      coverageAmount,
      coverageDetails,
    });
    console.log('Sending policy data:', policyData);

    this.isPolicyLoading = true;
    this.customerService.buyPolicy(policyData).subscribe({
      next: (response) => {
        console.log('Policy creation response:', response);
        this.showNotificationMessage(`${name} policy added successfully!`, 'success');
        this.loadPolicies();
        this.isPolicyLoading = false;
      },
      error: (error) => {
        console.error('Policy selection error:', error);
        const errorMsg = error.error?.message || error.message || 'Failed to select policy';
        if (errorMsg.includes('not found')) {
          this.showNotificationMessage('Policy not found', 'error');
        } else if (errorMsg.includes('External service')) {
          this.showNotificationMessage('Service unavailable. Try later', 'error');
        } else {
          this.showNotificationMessage('Policy purchase failed', 'error');
        }
        this.isPolicyLoading = false;
      },
    });
  }

  openPolicyDetails(policy: any) {
    this.selectedPolicyForDetails = policy;
    this.showPolicyDetails = true;
  }

  closePolicyDetails() {
    this.showPolicyDetails = false;
    this.selectedPolicyForDetails = null;
  }

  getPolicyDetailValue(policy: any, field: string): any {
    switch (field) {
      case 'name':
        return policy[4] || policy.name || 'No Name';
      case 'type':
        return policy[5] || policy.policyType || policy.policy_type || policy.type || 'N/A';
      case 'premium':
        return (
          parseFloat(policy[2]) ||
          parseFloat(policy.premium_amount) ||
          parseFloat(policy.premiumAmount) ||
          parseFloat(policy.premium) ||
          0
        );
      case 'coverage':
        return (
          parseFloat(policy[0]) ||
          parseFloat(policy.coverageamount) ||
          parseFloat(policy.coverageAmount) ||
          parseFloat(policy.coverage) ||
          0
        );
      case 'details':
        return (
          policy[3] ||
          policy.coverage_details ||
          policy.coverageDetails ||
          policy.description ||
          'No Description'
        );
      case 'id':
        return policy[1] || policy.policy_id || policy.policyId || policy.id || 'N/A';
      default:
        return 'N/A';
    }
  }

  loadNotifications() {
    if (this.customerId) {
      console.log('Loading notifications for customer ID:', this.customerId);
      this.customerService.getNotifications(this.customerId).subscribe({
        next: (data) => {
          console.log('Customer notifications received:', data);
          this.notifications = data || [];
        },
        error: (error) => {
          console.error('Error loading customer notifications:', error);
          this.notifications = [];
        },
      });
    }
  }

  toggleNotifications() {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  toggleNotificationExpand(notification: any) {
    notification.expanded = !notification.expanded;
  }

  markAsRead(notification: any, event: Event) {
    event.stopPropagation();
    this.customerService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== notification.id);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }

  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'policy':
        return 'fa-shield-alt';
      case 'claim':
        return 'fa-file-medical';
      case 'payment':
        return 'fa-credit-card';
      case 'alert':
        return 'fa-exclamation-triangle';
      case 'info':
        return 'fa-info-circle';
      case 'success':
        return 'fa-check-circle';
      case 'warning':
        return 'fa-exclamation-circle';
      case 'error':
        return 'fa-times-circle';
      case 'reminder':
        return 'fa-clock';
      case 'update':
        return 'fa-sync-alt';
      default:
        return 'fa-bell';
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'policy':
        return 'bg-primary';
      case 'claim':
        return 'bg-success';
      case 'payment':
        return 'bg-warning';
      case 'alert':
        return 'bg-danger';
      case 'info':
        return 'bg-info';
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'error':
        return 'bg-danger';
      case 'reminder':
        return 'bg-secondary';
      case 'update':
        return 'bg-primary';
      default:
        return 'bg-primary';
    }
  }



  // Search Functionality
  showMobileMenu = false;

  getSearchPlaceholder(): string {
    switch (this.activeSection) {
      case 'policies':
        return 'Search available policies...';
      case 'myPolicies':
        return 'Search your policies...';
      case 'claims':
        return 'Search your claims...';
      case 'notifications':
        return 'Search notifications...';
      case 'profile':
        return 'Search profile settings...';
      case 'help':
        return 'Search help topics...';
      default:
        return 'Search policies, claims, or help...';
    }
  }

  clearSearch() {
    this.searchTerm = '';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
