import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../Services/jwt.service';
import { AgentService } from '../Services/agent.service';
import { ThemeService } from '../Services/theme.service';

@Component({
  selector: 'app-agent',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent.html',
  styleUrl: './agent.css'
})
export class Agent implements OnInit, OnDestroy {
  activeSection = 'claims';
  agentData: any = {};
  claims: any[] = [];
  filteredClaims: any[] = [];
  searchQuery: string = '';
  isLoading = false;
  selectedClaim: any = null;
  showClaimModal = false;
  claimDetails: any = {};
  
  // Notifications
  notifications: any[] = [];
  showNotificationPanel = false;
  notificationInterval: any;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  
  // Theme
  isDarkMode = false;

  constructor(private router: Router, private jwtService: JwtService, private http: HttpClient, private agentService: AgentService, private themeService: ThemeService) {}

  ngOnInit() {
    if (!this.jwtService.getToken() || this.jwtService.getUserRole() !== 'AGENT') {
      this.showNotificationMessage('Not authorized to access this page', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.loadAgentData();
    this.loadClaims();
    this.startNotificationPolling();
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }
  
  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  loadAgentData() {
    const token = this.jwtService.getToken();
    console.log('JWT Token:', token);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Loading agent data...');
    this.http.get('http://localhost:8763/agents/claims/all', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Agent data response:', response);
          this.agentData = response.agent;
          // Load notifications after we have agent data
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error loading agent data:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          // Still try to load notifications with fallback ID
          this.loadNotifications();
        }
      });
  }

  loadClaims() {
    const token = this.jwtService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Get agent ID from JWT token (stored as customerId)
    const agentId = this.jwtService.getCustomerId();
    console.log('Loading claims for agent ID:', agentId);
    
    if (!agentId) {
      console.error('No agent ID found in token');
      this.claims = [];
      return;
    }
    
    this.http.get(`http://localhost:8763/api/claims/agent/${agentId}`, { headers })
      .subscribe({
        next: (claims: any) => {
          console.log('Agent-specific claims response:', claims);
          const claimsArray = Array.isArray(claims) ? claims : [];
          
          // Load updated status for each claim
          this.loadClaimsWithUpdatedStatus(claimsArray, headers);
        },
        error: (error) => {
          console.error('Error loading agent claims:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          this.claims = [];
        }
      });
  }

  loadClaimsWithUpdatedStatus(claims: any[], headers: HttpHeaders) {
    if (claims.length === 0) {
      this.claims = [];
      this.filteredClaims = [];
      return;
    }

    // Since we're getting claims from agent-specific endpoint, they should already have current status
    this.claims = claims;
    this.filteredClaims = claims; // Initialize filtered claims
    
    // Load customer details for better search
    this.loadCustomerDetailsForClaims(claims, headers);
    
    console.log('Agent claims loaded:', this.claims);
  }

  private loadCustomerDetailsForClaims(claims: any[], headers: HttpHeaders) {
    // Load customer details for each claim to enable better search
    claims.forEach(claim => {
      if (claim.customerId && !claim.customerDetails) {
        this.http.get(`http://localhost:8763/customer/getCustomer/${claim.customerId}`, { headers })
          .subscribe({
            next: (customer: any) => {
              claim.customerDetails = customer;
              // Update filtered claims if search is active
              if (this.searchQuery.trim()) {
                this.onSearch();
              }
            },
            error: (error) => {
              console.error('Error loading customer details for search:', error);
            }
          });
      }
    });
  }

  openClaimModal(claim: any) {
    this.selectedClaim = claim;
    this.showClaimModal = true;
    this.loadClaimDetails(claim);
  }

  closeClaimModal() {
    this.showClaimModal = false;
    this.selectedClaim = null;
    this.claimDetails = {};
  }

  loadClaimDetails(claim: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.jwtService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('Loading claim details for:', claim);
    console.log('Customer ID:', claim.customerId);
    console.log('Policy ID:', claim.policyId);

    // Load customer details
    const customerUrl = `http://localhost:8763/customer/getCustomer/${claim.customerId}`;
    console.log('Fetching customer from:', customerUrl);
    
    this.http.get(customerUrl, { headers })
      .subscribe({
        next: (customer: any) => {
          console.log('Customer response:', customer);
          this.claimDetails.customer = customer;
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          console.error('Customer error status:', error.status);
          console.error('Customer error message:', error.message);
        }
      });

    // Load policy details
    const policyUrl = `http://localhost:8763/api/policies/${claim.policyId}`;
    console.log('Fetching policy from:', policyUrl);
    
    this.http.get(policyUrl, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Policy response:', response);
          this.claimDetails.policy = response;
          console.log('Extracted policy:', this.claimDetails.policy);
        },
        error: (error) => {
          console.error('Error loading policy:', error);
          console.error('Policy error status:', error.status);
          console.error('Policy error message:', error.message);
        }
      });
  }

  approveClaim(claimId: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.jwtService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('Approving claim:', claimId);
    this.http.put(`http://localhost:8763/agents/approve-claim/${claimId}`, {}, { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Claim approved successfully:', response);
          this.showNotificationMessage('Claim approved successfully!', 'success');
          
          // Reload claims to get updated status from backend
          this.loadClaims();
          this.closeClaimModal();
        },
        error: (error) => {
          console.error('Error approving claim:', error);
          this.showNotificationMessage('Error approving claim. Please try again.', 'error');
        }
      });
  }

  rejectClaim(claimId: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.jwtService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('Rejecting claim:', claimId);
    this.http.put(`http://localhost:8763/agents/reject-claim/${claimId}`, {}, { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Claim rejected successfully:', response);
          this.showNotificationMessage('Claim rejected successfully!', 'success');
          
          // Reload claims to get updated status from backend
          this.loadClaims();
          this.closeClaimModal();
        },
        error: (error) => {
          console.error('Error rejecting claim:', error);
          this.showNotificationMessage('Error rejecting claim. Please try again.', 'error');
        }
      });
  }

  getAgentInitials(): string {
    return this.agentData?.name ? this.jwtService.getInitials(this.agentData.name) : 'AG';
  }

  isClaimProcessed(status: string): boolean {
    return status === 'APPROVED' || status === 'REJECTED';
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  logout() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
    this.jwtService.logout();
  }

  loadNotifications() {
    // Use agent ID from JWT token (stored as customerId)
    let agentId = this.jwtService.getCustomerId() || this.agentData?.agentId || 17;
    
    console.log('Loading notifications for agent ID:', agentId);
    console.log('Agent data:', this.agentData);
    
    this.agentService.getNotifications(agentId).subscribe({
      next: (data) => {
        console.log('Agent notifications received:', data);
        this.notifications = data || [];
      },
      error: (error) => {
        console.error('Error loading agent notifications:', error);
        console.error('Error details:', error.status, error.message);
        this.notifications = [];
      }
    });
  }
  
  startNotificationPolling() {
    this.notificationInterval = setInterval(() => {
      this.loadNotifications();
    }, 10000); // Check every 10 seconds
  }
  
  toggleNotifications() {
    this.showNotificationPanel = !this.showNotificationPanel;
  }
  
  toggleNotificationExpand(notification: any) {
    notification.expanded = !notification.expanded;
  }
  
  markAsRead(notification: any, event: Event) {
    event.stopPropagation();
    this.agentService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }
  
  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'policy': return 'fa-shield-alt';
      case 'claim': return 'fa-file-medical';
      case 'payment': return 'fa-credit-card';
      case 'alert': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-exclamation-circle';
      case 'error': return 'fa-times-circle';
      case 'reminder': return 'fa-clock';
      case 'update': return 'fa-sync-alt';
      default: return 'fa-bell';
    }
  }
  
  getNotificationIconClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'policy': return 'bg-primary';
      case 'claim': return 'bg-success';
      case 'payment': return 'bg-warning';
      case 'alert': return 'bg-danger';
      case 'info': return 'bg-info';
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-danger';
      case 'reminder': return 'bg-secondary';
      case 'update': return 'bg-primary';
      default: return 'bg-primary';
    }
  }
  
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  closeClaimForm() {
    // Close any open forms or modals
    this.selectedClaim = null;
    this.showClaimModal = false;
    // You can add additional form closing logic here
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredClaims = this.claims;
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredClaims = this.claims;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredClaims = this.claims.filter(claim => {
      // Basic claim fields
      const basicMatch = (
        claim.claimId?.toString().toLowerCase().includes(query) ||
        claim.customerId?.toString().toLowerCase().includes(query) ||
        claim.policyId?.toString().toLowerCase().includes(query) ||
        claim.status?.toLowerCase().includes(query) ||
        claim.claimAmount?.toString().includes(query)
      );

      // Fuzzy search for partial matches
      const fuzzyMatch = (
        this.fuzzySearch(claim.claimId?.toString(), query) ||
        this.fuzzySearch(claim.customerId?.toString(), query) ||
        this.fuzzySearch(claim.policyId?.toString(), query) ||
        this.fuzzySearch(claim.status, query)
      );

      // Search in loaded claim details if available
      let detailsMatch = false;
      if (this.claimDetails.customer) {
        detailsMatch = (
          this.claimDetails.customer.name?.toLowerCase().includes(query) ||
          this.claimDetails.customer.email?.toLowerCase().includes(query) ||
          this.claimDetails.customer.phone?.toLowerCase().includes(query)
        );
      }

      // Search through all claims for customer details (if we have them)
      const customerMatch = this.searchInCustomerData(claim, query);

      return basicMatch || fuzzyMatch || detailsMatch || customerMatch;
    });
  }

  private fuzzySearch(text: string, query: string): boolean {
    if (!text || !query) return false;
    
    text = text.toLowerCase();
    query = query.toLowerCase();
    
    // Allow for 1-2 character differences
    if (Math.abs(text.length - query.length) > 2) {
      return text.includes(query) || query.includes(text);
    }
    
    // Simple fuzzy matching
    let textIndex = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const found = text.indexOf(char, textIndex);
      if (found === -1) return false;
      textIndex = found + 1;
    }
    return true;
  }

  private searchInCustomerData(claim: any, query: string): boolean {
    // Search through customer details if loaded
    if (claim.customerDetails) {
      const customer = claim.customerDetails;
      const customerSearchText = [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.aadharnumber,
        customer.gender
      ].filter(field => field).join(' ').toLowerCase();
      
      if (customerSearchText.includes(query)) {
        return true;
      }
      
      // Fuzzy search on customer name
      if (customer.name && this.fuzzySearch(customer.name, query)) {
        return true;
      }
    }
    
    // Fallback to basic search
    const searchableText = [
      claim.claimId,
      claim.customerId,
      claim.policyId,
      claim.status,
      claim.claimAmount?.toString()
    ].join(' ').toLowerCase();
    
    return searchableText.includes(query);
  }
}
