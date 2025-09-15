import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtService } from '../Services/jwt.service';
import { AdminService } from '../Services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  activeTab = signal('dashboard');
  searchTerm = signal('');
  adminName = signal('');
  adminInitials = signal('');
  
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
  agentForm = signal({
    name: '', contactInfo: '', password: '', gender: 'male', date: '',
    aadharnumber: null, phone: null, address: '', role: 'AGENT', orgEmail: ''
  });
  policyForm = signal({
    name: '', policyType: '', premiumAmount: null, coverageamount: null, coverageDetails: ''
  });

  constructor(private jwtService: JwtService, private adminService: AdminService) {}

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
    this.adminService.getAllAgents().subscribe(data => this.agents.set(data || []));
    this.adminService.getAllClaims().subscribe(data => this.claims.set(data || []));
    this.adminService.getAllCustomers().subscribe(data => this.customers.set(data || []));
    this.adminService.getAllPolicyList().subscribe(data => this.policies.set(data || []));
    this.adminService.getAllPolicies().subscribe(data => this.policyLogs.set(data || []));
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
    this.adminService.createAgent(this.agentForm()).subscribe(() => {
      this.loadData();
      this.showAgentForm.set(false);
      this.resetAgentForm();
    });
  }

  deleteAgent(id: number) {
    if (confirm('Delete agent?')) {
      this.adminService.deleteAgent(id).subscribe({
        next: () => {
          alert('Agent deleted successfully');
          this.loadData();
        },
        error: (error) => {
          console.error('Delete error:', error);
          alert('Failed to delete agent: ' + (error.error?.message || 'Server error'));
        }
      });
    }
  }

  resetAgentForm() {
    this.agentForm.set({
      name: '', contactInfo: '', password: '', gender: 'male', date: '',
      aadharnumber: null, phone: null, address: '', role: 'AGENT', orgEmail: ''
    });
  }

  // Policy methods
  togglePolicyForm() {
    this.showPolicyForm.set(!this.showPolicyForm());
  }

  createPolicy() {
    const form = this.policyForm();
    
    // Validation
    if (!form.name || !form.policyType || !form.premiumAmount || !form.coverageamount || !form.coverageDetails) {
      alert('Please fill all required fields');
      return;
    }
    
    // Convert to exact backend format
    const policyData = {
      name: form.name,
      policyType: form.policyType,
      premiumAmount: Number(form.premiumAmount),
      coverageamount: Number(form.coverageamount),
      coverageDetails: form.coverageDetails
    };
    
    this.adminService.createPolicyList(policyData).subscribe(() => {
      this.loadData();
      this.showPolicyForm.set(false);
      this.resetPolicyForm();
    });
  }

  deletePolicy(id: any) {
    const policyId = id || 'unknown';
    if (confirm(`Delete policy ${policyId}?`)) {
      if (!id) {
        alert('Policy ID is missing');
        return;
      }
      this.adminService.deletePolicyList(id).subscribe(() => this.loadData());
    }
  }

  resetPolicyForm() {
    this.policyForm.set({
      name: '', policyType: '', premiumAmount: null, coverageamount: null, coverageDetails: ''
    });
  }

  updatePolicyForm(field: string, value: any) {
    let processedValue = value;
    
    // Convert numeric fields to numbers
    if (field === 'premiumAmount' || field === 'coverageamount') {
      processedValue = value ? Number(value) : null;
    }
    
    this.policyForm.update(form => ({ ...form, [field]: processedValue }));
  }

  getFilteredPolicies() {
    if (!this.selectedPolicyType()) return this.policies();
    return this.policies().filter(policy => 
      (policy.policyType || policy[5] || policy.policy_type || policy.type) === this.selectedPolicyType()
    );
  }

  updateAgentForm(field: string, value: any) {
    this.agentForm.update(form => ({ ...form, [field]: value }));
  }

  onInputChange(event: Event, field: string) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.updateAgentForm(field, target.value);
  }

  getFilteredAgents() {
    if (!this.searchTerm()) return this.agents();
    return this.agents().filter(agent => 
      agent.name?.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  }

  getFormattedDate(log: any): string {
    const date = log.createdDate || log.date || log.updatedDate;
    if (!date) return 'No Date';
    
    try {
      return new Date(date).toLocaleDateString('en-US', {
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
}
