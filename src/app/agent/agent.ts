import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../Services/jwt.service';
import { AgentService } from '../Services/agent.service';

@Component({
  selector: 'app-agent',
  imports: [CommonModule],
  templateUrl: './agent.html',
  styleUrl: './agent.css'
})
export class Agent implements OnInit, OnDestroy {
  activeSection = 'claims';
  agentData: any = {};
  claims: any[] = [];
  isLoading = false;
  selectedClaim: any = null;
  showClaimModal = false;
  claimDetails: any = {};
  
  // Notifications
  notifications: any[] = [];
  showNotificationPanel = false;
  notificationInterval: any;

  constructor(private router: Router, private jwtService: JwtService, private http: HttpClient, private agentService: AgentService) {}

  ngOnInit() {
    this.loadAgentData();
    this.loadClaims();
    this.startNotificationPolling();
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

    console.log('Loading claims...');
    this.http.get('http://localhost:8763/agents/claims/all', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Claims response:', response);
          this.claims = response.claim || [];
          console.log('Claims array:', this.claims);
        },
        error: (error) => {
          console.error('Error loading claims:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
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

  // approveClaim(claimId: number) {
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.jwtService.getToken()}`,
  //     'Content-Type': 'application/json'
  //   });

  //   console.log('Approving claim:', claimId);
  //   this.http.put(`http://localhost:8763/agents/approve-claim/${claimId}`, {}, { headers })
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Claim approved successfully:', response);
  //         alert('Claim approved successfully!');
  //         this.loadClaims();
  //         this.closeClaimModal();
  //       },
  //       error: (error) => {
  //         console.error('Error approving claim:', error);
  //         alert('Error approving claim. Please try again.');
  //       }
  //     });
  // }
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
        alert('Claim approved successfully!');
        
        // Update the claim status locally
        const claimIndex = this.claims.findIndex(c => c.claimId === claimId);
        if (claimIndex !== -1) {
          this.claims[claimIndex].status = 'APPROVED';
        }
        
        // Update selected claim if it's the same one
        if (this.selectedClaim && this.selectedClaim.claimId === claimId) {
          this.selectedClaim.status = 'APPROVED';
        }
        
        this.closeClaimModal();
      },
      error: (error) => {
        console.error('Error approving claim:', error);
        alert('Error approving claim. Please try again.');
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
          alert('Claim rejected successfully!');
          
          // Update the claim status locally
          const claimIndex = this.claims.findIndex(c => c.claimId === claimId);
          if (claimIndex !== -1) {
            this.claims[claimIndex].status = 'REJECTED';
          }
          
          // Update selected claim if it's the same one
          if (this.selectedClaim && this.selectedClaim.claimId === claimId) {
            this.selectedClaim.status = 'REJECTED';
          }
          
          this.closeClaimModal();
        },
        error: (error) => {
          console.error('Error rejecting claim:', error);
          alert('Error rejecting claim. Please try again.');
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
    // Try to get agent ID from multiple sources
    let agentId = this.jwtService.getAgentId();
    if (!agentId && this.agentData?.agentId) {
      agentId = this.agentData.agentId;
    }
    if (!agentId) {
      agentId = 17; // fallback
    }
    
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
  
  toggleNotificationExpand(index: number) {
    this.notifications[index].expanded = !this.notifications[index].expanded;
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
}
