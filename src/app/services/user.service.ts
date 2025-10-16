import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeService } from './recipe.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:2661/api';
  private userUrl = `${this.baseUrl}/User`;

  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  // ===== USER API ENDPOINTS =====
  
  // GET all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.userUrl);
  }

  // GET user by ID
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.userUrl}/${id}`);
  }

  // POST new user (signup)
  createUser(user: any): Observable<any> {
    return this.http.post(this.userUrl, user);
  }

  // PUT update user via API
  updateUserViaApi(id: number, user: any): Observable<any> {
    return this.http.put(`${this.userUrl}/${id}`, user);
  }

  // DELETE user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.userUrl}/${id}`);
  }

  // ===== AUTHENTICATION METHODS =====
  
  login(email: string, password: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
      return true;
    }

    return false;
  }

  signup(userData: any): boolean {
    if (typeof window === 'undefined') return false;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const exists = users.some((u: any) => u.email === userData.email);

    if (exists) return false;

    const newUser = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobileNumber: userData.mobileNumber,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      profilePic: userData.profilePic,
      joined: new Date().toISOString(),
      isPremium: userData.email.includes('premium') // Demo logic
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    return true;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
      // RecipeService auto-switches context on next access
    }
  }

  getUser() {
    if (typeof window === 'undefined') return {};
    const logged = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const email = logged?.email;
    if (!email) return logged || {};
    // Hydrate from users[] so profile persists across API logins
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const full = users.find((u: any) => u.email === email);
    return full ? { ...logged, ...full } : logged;
  }

  // Update user in localStorage (supports email change)
  updateUser(updatedUser: any, previousEmail?: string): void {
    if (typeof window === 'undefined') return;
    
    // Update logged in user immediately
    localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    
    // Upsert into users array using previous email if provided
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const keyEmail = previousEmail || updatedUser.email;
    const idx = users.findIndex((u: any) => u.email === keyEmail);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedUser };
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem('users', JSON.stringify(users));
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('loggedInUser');
  }

  isPremium(): boolean {
    return this.getUser()?.isPremium ?? false;
  }

  getEmail(): string {
    return this.getUser()?.email || '';
  }

  // ===== API AUTHENTICATION =====
  
  // Login via API (AccountController, returns plain text)
  loginViaApi(email: string, password: string): Observable<string> {
    const loginData = { email, password };
    return this.http.post(`${this.baseUrl}/Account/login`, loginData, { responseType: 'text' as 'text' });
  }

  // Signup via API (AccountController, returns plain text)
  signupViaApi(userData: any): Observable<string> {
    return this.http.post(`${this.baseUrl}/Account/register`, userData, { responseType: 'text' as 'text' });
  }

  // Get current user from API (not implemented on backend demo)
  getCurrentUserFromApi(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Account/me`);
  }
}
