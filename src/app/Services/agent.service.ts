import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private baseUrl = 'http://localhost:8763';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Agent data and claims
  getAgentData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents/claims/all`, { headers: this.getHeaders() });
  }

  getAgentClaims(agentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/claims/agent/${agentId}`, { headers: this.getHeaders() });
  }

  getCustomerDetails(customerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/getCustomer/${customerId}`, { headers: this.getHeaders() });
  }

  getPolicyDetails(policyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/policies/${policyId}`, { headers: this.getHeaders() });
  }

  approveClaim(claimId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/approve-claim/${claimId}`, {}, { headers: this.getHeaders(), responseType: 'text' });
  }

  rejectClaim(claimId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/reject-claim/${claimId}`, {}, { headers: this.getHeaders(), responseType: 'text' });
  }

  // Notifications
  getNotifications(agentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notify/agent/${agentId}`, { headers: this.getHeaders() });
  }
  
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notify/delete/${notificationId}`, { headers: this.getHeaders(), responseType: 'text' });
  }
}
