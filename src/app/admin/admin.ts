import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { JwtService } from '../Services/jwt.service';
import { AdminService } from '../Services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  activeTab = signal('dashboard');
  adminName = signal('');
  adminInitials = signal('');
  
  // Search functionality
  searchTerm = '';
  
  // Data
  agents = signal<any[]>([]);
  claims = signal<any[]>([]);
  customers = signal<any[]>([]);
  policies = signal<any[]>([]);
  policyLogs = signal<any[]>([]);
  
  // Filters
  selectedPolicyType = signal('');
  
  // Forms
  showAgentForm = signal(false);
  showPolicyForm = signal(false);
  showUpdateForm = signal(false);
  selectedAgent = signal<any>(null);
  
  // Loading states
  isCreatingAgent = signal(false);
  isCreatingPolicy = signal(false);
  
  // Notifications
  showNotification = signal(false);
  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');
  
  // Password toggle
  showAgentPassword = false;
  
  // REACTIVE FORMS - Better validation and type safety
  agentForm!: FormGroup;  // Reactive Form for Agent Creation
  policyForm!: FormGroup; // Reactive Form for Policy Creation
  
  // TEMPLATE-DRIVEN FORM - For learning comparison (Update Agent Form)
  updateFormData = signal({
    name: '', contactInfo: '', gender: 'male', date: '',
    aadharnumber: null, phone: null, address: '', orgEmail: ''
  });

  constructor(
    private jwtService: JwtService, 
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }
  
  // Initialize Reactive Forms
  initializeForms() {
    // Agent Creation Form - Reactive
    this.agentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      contactInfo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['male', Validators.required],
      aadharnumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      orgEmail: ['', [Validators.required, Validators.email]]
    });
    
    // Policy Creation Form - Reactive
    this.policyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      policyType: ['', Validators.required],
      premiumAmount: ['', [Validators.required, Validators.min(1)]],
      coverageamount: ['', [Validators.required, Validators.min(1)]],
      coverageDetails: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadData();
  }

  loadUserData() {
    const name = this.jwtService.getUserName();
    if (name) {
      this.adminName.set(name);
      this.adminInitials.set(this.jwtService.getInitials(name));
    }
  }

  loadData() {
    this.adminService.getAllAgents().subscribe({
      next: data => this.agents.set(data || []),
      error: () => this.agents.set([])
    });
    
    this.adminService.getAllClaims().subscribe({
      next: data => this.claims.set(data || []),
      error: () => this.claims.set([])
    });
    
    this.adminService.getAllCustomers().subscribe({
      next: data => this.customers.set(data || []),
      error: () => this.customers.set([])
    });
    
    this.adminService.getAllPolicyList().subscribe({
      next: data => this.policies.set(data || []),
      error: () => this.policies.set([])
    });
    
    this.adminService.getAllPolicies().subscribe({
      next: data => this.policyLogs.set(data || []),
      error: () => this.policyLogs.set([])
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  logout() {
    this.jwtService.logout();
  }

  // Agent functions
  toggleAgentForm() {
    this.showAgentForm.set(!this.showAgentForm());
  }

  createAgent() {
    // Check if form is valid
    if (this.agentForm.invalid) {
      this.agentForm.markAllAsTouched();
      this.showNotificationMessage('Please fill all fields correctly', 'error');
      return;
    }
    
    const formValue = this.agentForm.value;
    
    // Frontend validation for duplicates
    const existingContactInfo = this.agents().find(agent => 
      agent.contactInfo === formValue.contactInfo || agent.email === formValue.contactInfo
    );
    if (existingContactInfo) {
      this.showNotificationMessage('Email info already exists', 'error');
      return;
    }
    
    const existingOrgEmail = this.agents().find(agent => 
      agent.orgEmail === formValue.orgEmail
    );
    if (existingOrgEmail) {
      this.showNotificationMessage('Organisation email already exists', 'error');
      return;
    }
    
    const agentData = {
      ...formValue,
      role: 'AGENT',
      date: new Date().toISOString()
    };
    
    this.isCreatingAgent.set(true);
    
    this.adminService.createAgent(agentData).subscribe({
      next: () => {
        this.showNotificationMessage('Agent created successfully!', 'success');
        this.loadData(); // Reload all data
        this.showAgentForm.set(false);
        this.agentForm.reset({ gender: 'male' }); // Reset with default gender
        this.isCreatingAgent.set(false);
      },
      error: (error) => {
        console.error('Create agent error:', error);
        
        // Handle backend validation messages
        let errorMessage = 'Failed to create agent';
        if (error.error && typeof error.error === 'string') {
          const errorText = error.error.toLowerCase();
          
          if (errorText.includes('email info already exists') || errorText.includes('contactinfo')) {
            errorMessage = 'Email info already exists';
          } else if (errorText.includes('organisation email already exists') || errorText.includes('orgemail')) {
            errorMessage = 'Organisation email already exists';
          } else if (errorText.includes('adharcard is already exists') || errorText.includes('aadhaar')) {
            errorMessage = 'This Aadhaar Card already exists';
          }
        }
        
        this.showNotificationMessage(errorMessage, 'error');
        this.isCreatingAgent.set(false);
      }
    });
  }

  openUpdateForm(agent: any) {
    this.selectedAgent.set(agent);
    this.updateFormData.set({
      name: agent.name || '',
      contactInfo: agent.contactInfo || agent.email || '',
      gender: agent.gender || 'male',
      date: agent.date || '',
      aadharnumber: agent.aadharnumber || null,
      phone: agent.phone || null,
      address: agent.address || '',
      orgEmail: agent.orgEmail || ''
    });
    this.showUpdateForm.set(true);
  }

  updateAgent() {
    const agentId = this.selectedAgent()?.agentId || this.selectedAgent()?.id;
    if (!agentId) {
      this.showNotificationMessage('Agent ID not found', 'error');
      return;
    }

    this.adminService.updateAgent(agentId, this.updateFormData()).subscribe({
      next: () => {
        this.showNotificationMessage('Agent updated successfully!', 'success');
        this.adminService.getAllAgents().subscribe({
          next: data => this.agents.set(data || []),
          error: () => this.agents.set([])
        });
        this.closeUpdateForm();
      },
      error: (error) => {
        console.error('Update error:', error);
        this.showNotificationMessage('Failed to update agent', 'error');
      }
    });
  }

  closeUpdateForm() {
    this.showUpdateForm.set(false);
    this.selectedAgent.set(null);
  }



  // Policy methods
  togglePolicyForm() {
    this.showPolicyForm.set(!this.showPolicyForm());
  }

  createPolicy() {
    // Check if form is valid
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      this.showNotificationMessage('Please fill all fields correctly', 'error');
      return;
    }
    
    const formValue = this.policyForm.value;
    
    const policyData = {
      name: formValue.name,
      policyType: formValue.policyType,
      premiumAmount: Number(formValue.premiumAmount),
      coverageamount: Number(formValue.coverageamount),
      coverageDetails: formValue.coverageDetails
    };
    
    this.isCreatingPolicy.set(true);
    
    this.adminService.createPolicyList(policyData).subscribe({
      next: () => {
        this.showNotificationMessage('Policy created successfully!', 'success');
        this.loadData(); // Reload all data
        this.showPolicyForm.set(false);
        this.policyForm.reset(); // Reset form
        this.isCreatingPolicy.set(false);
      },
      error: (error) => {
        console.error('Create policy error:', error);
        this.showNotificationMessage('Failed to create policy', 'error');
        this.isCreatingPolicy.set(false);
      }
    });
  }

  deletePolicy(id: any) {
    const policyId = id || 'unknown';
    if (confirm(`Delete policy ${policyId}?`)) {
      if (!id) {
        alert('Policy ID is missing');
        return;
      }
      this.adminService.deletePolicyList(id).subscribe(() => {
        // Only reload policies data for faster response
        this.adminService.getAllPolicyList().subscribe({
          next: data => this.policies.set(data || []),
          error: () => this.policies.set([])
        });
      });
    }
  }



  getFilteredPolicies() {
    let filtered = this.policies();
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(policy => 
        (policy[4] || policy.name)?.toLowerCase().includes(term) ||
        (policy.policyType || policy[5] || policy.policy_type || policy.type)?.toLowerCase().includes(term) ||
        (policy[1] || policy.policy_id || policy.policyId || policy.id)?.toString().includes(term) ||
        (policy[2] || policy.premium_amount || policy.premiumAmount || policy.premium)?.toString().includes(term) ||
        (policy[0] || policy.coverageamount || policy.coverageAmount || policy.coverage)?.toString().includes(term) ||
        (policy[3] || policy.coverage_details || policy.coverageDetails || policy.description)?.toLowerCase().includes(term)
      );
    }
    
    // Filter by policy type
    if (this.selectedPolicyType()) {
      filtered = filtered.filter(policy => 
        (policy.policyType || policy[5] || policy.policy_type || policy.type) === this.selectedPolicyType()
      );
    }
    
    return filtered;
  }

  // Template-driven form helper for update form
  updateFormField(field: string, value: any) {
    this.updateFormData.update(form => ({ ...form, [field]: value }));
  }

  onUpdateInputChange(event: Event, field: string) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.updateFormField(field, target.value);
  }



  getFilteredAgents() {
    if (!this.searchTerm) return this.agents();
    const term = this.searchTerm.toLowerCase();
    return this.agents().filter(agent => 
      agent.name?.toLowerCase().includes(term) ||
      agent.contactInfo?.toLowerCase().includes(term) ||
      agent.email?.toLowerCase().includes(term) ||
      agent.phone?.toString().includes(term) ||
      (agent.agentId || agent.id)?.toString().includes(term)
    );
  }

  getFilteredClaims() {
    if (!this.searchTerm) return this.claims();
    const term = this.searchTerm.toLowerCase();
    return this.claims().filter(claim => 
      (claim.claimId || claim.claim_id || claim.id)?.toString().includes(term) ||
      (claim.policyId || claim.policy_id)?.toString().includes(term) ||
      (claim.customerId || claim.customer_id || claim.userId)?.toString().includes(term) ||
      (claim.status || claim.claimStatus)?.toLowerCase().includes(term) ||
      (claim.claimAmount || claim.claim_amount || claim.amount)?.toString().includes(term)
    );
  }

  getFilteredCustomers() {
    if (!this.searchTerm) return this.customers();
    const term = this.searchTerm.toLowerCase();
    return this.customers().filter(customer => 
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toString().includes(term) ||
      customer.address?.toLowerCase().includes(term) ||
      (customer.customerId || customer.id)?.toString().includes(term)
    );
  }

  getFilteredPolicyLogs() {
    if (!this.searchTerm) return this.policyLogs();
    const term = this.searchTerm.toLowerCase();
    return this.policyLogs().filter(log => 
      (log.policyId || log.policy_id || log.id || log.pId)?.toString().includes(term) ||
      (log.customerId || log.customer_id || log.userId || log.cId)?.toString().includes(term) ||
      (log.agentId || log.agent_id || log.createdBy || log.aId)?.toString().includes(term) ||
      (log.status || log.policyStatus)?.toLowerCase().includes(term)
    );
  }

  clearSearch() {
    this.searchTerm = '';
  }

  getFormattedDate(log: any): string {
    // Check all possible date fields
    const date = log.createdDate || log.date || log.updatedDate || log.created_at || log.timestamp || log.policyDate || log.startDate || log.endDate || log.issueDate;
    
    if (!date) {
      // If no date found, return current date as fallback
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }
  
  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    this.showNotification.set(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.showNotification.set(false);
    }, 3000);
  }
  
  toggleAgentPassword() {
    this.showAgentPassword = !this.showAgentPassword;
  }
  
  // Helper method to get form field errors
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Minimum ${requiredLength} characters required`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Please enter a valid 10-digit phone number';
        if (fieldName === 'aadharnumber') return 'Please enter a valid 12-digit Aadhaar number';
      }
      if (field.errors['min']) return 'Value must be greater than 0';
    }
    return '';
  }
}
