import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:2661/api';
  private authUrl = `${this.baseUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // ===== AUTHENTICATION API ENDPOINTS =====
  
  // Login via API
  login(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http.post(`${this.authUrl}/Login`, loginData);
  }

  // Register via API
  register(userData: any): Observable<any> {
    return this.http.post(`${this.authUrl}/Register`, userData);
  }

  // Get current user from API
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.authUrl}/Me`);
  }

  // Refresh token
  refreshToken(): Observable<any> {
    return this.http.post(`${this.authUrl}/RefreshToken`, {});
  }

  // Logout via API
  logoutApi(): Observable<any> {
    return this.http.post(`${this.authUrl}/Logout`, {});
  }

  // ===== LOCAL STORAGE METHODS (for backward compatibility) =====
  
  getLoggedInUser(): any {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('loggedInUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getLoggedInUser();
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
    }
  }

  // ===== TOKEN MANAGEMENT =====
  
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // ===== USER SESSION =====
  
  setUserSession(user: any, token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
    }
  }

  clearUserSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('authToken');
    }
  }
}
