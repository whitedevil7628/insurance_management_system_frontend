import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'http://localhost:8763';

  constructor(private http: HttpClient) {}
  // Interceptor automatically adds JWT token to all requests

  // Agent operations
  createAgent(agentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/registeragent`, agentData, { responseType: 'text' });
  }

  getAllAgents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents/all`);
  }

  deleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/agents/delete/${id}`);
  }

  updateAgent(id: number, agentData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/update/${id}`, agentData, { responseType: 'text' });
  }

  // Claims operations
  getAllClaims(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/claims/claims/all`);
  }

  // Customer operations
  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/getAllCustomer`);
  }

  // Policy operations
  getAllPolicyList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/policylist`);
  }

  deletePolicyList(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/policylist/${id}`);
  }

  createPolicyList(policyData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/policylist`, policyData);
  }

  // Policy logs
  getAllPolicies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/policies`);
  }

  // Communication
  sendCustomMail(mailData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/mail/send`, mailData);
  }

  sendCustomSMS(smsData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/sms/send`, smsData);
  }
  
  getNotifications(agentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notify/agent/${agentId}`);
  }
  
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notify/delete/${notificationId}`, { responseType: 'text' });
  }
}
