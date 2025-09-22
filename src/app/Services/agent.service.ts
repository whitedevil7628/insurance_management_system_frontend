import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private baseUrl = 'http://localhost:8763';

  constructor(private http: HttpClient) {}
  // Interceptor automatically adds JWT token to all requests

  getNotifications(agentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notify/agent/${agentId}`);
  }
  
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notify/delete/${notificationId}`, { responseType: 'text' });
  }
}
