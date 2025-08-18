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

  // PUT update user
  updateUser(id: number, user: any): Observable<any> {
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
      this.recipeService.refreshUserKeys(); // Load correct saved/fav
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
    this.recipeService.refreshUserKeys();
    return true;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
      this.recipeService.clearAll(); // reset saved/fav
    }
  }

  getUser() {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem('loggedInUser') || '{}');
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
  
  // Login via API
  loginViaApi(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http.post(`${this.baseUrl}/Auth/Login`, loginData);
  }

  // Signup via API
  signupViaApi(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Auth/Register`, userData);
  }

  // Get current user from API
  getCurrentUserFromApi(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Auth/Me`);
  }
}
