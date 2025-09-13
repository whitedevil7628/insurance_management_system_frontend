import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'http://localhost:8763';

  constructor(private http: HttpClient, private jwtService: JwtService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAllPolicies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/policies`, { headers: this.getHeaders() });
  }
  
  getCustomerPolicies(): Observable<any> {
    const customerId = this.jwtService.getCustomerId();
    if (!customerId) {
      return of([]);
    }
    return this.http.get(`${this.apiUrl}/api/policies/getCustomerPolicyDetails/${customerId}`, {
      headers: this.getHeaders(),
    });
  }

  getPolicyById(policyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/policies/${policyId}`, {
      headers: this.getHeaders(),
    });
  }

  getCustomerProfile(): Observable<any> {
    const customerId = this.jwtService.getCustomerId();
    return this.http.get(`${this.apiUrl}/customer/getCustomer/${customerId}`, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(customerData: any): Observable<any> {
    const customerId = this.jwtService.getCustomerId();
    const updateData = { ...customerData, customerId };
    return this.http.put(`${this.apiUrl}/customer/Update`, updateData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  fileClaim(claimData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/claims/file`, claimData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  getCustomerClaims(): Observable<any> {
    const customerId = this.jwtService.getCustomerId();
    return this.http.get(`${this.apiUrl}/api/claims/customer/${customerId}`, {
      headers: this.getHeaders()
    });
  }
}
