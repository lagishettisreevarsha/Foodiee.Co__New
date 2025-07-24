import { Injectable } from '@angular/core';
import { RecipeService } from './recipe.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private recipeService: RecipeService) {}

  login(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
      this.recipeService.refreshUserKeys(); // Load correct saved/fav
      return true;
    }

    return false;
  }

  signup(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const exists = users.some((u: any) => u.email === email);

    if (exists) return false;

    const newUser = {
      email,
      password,
      isPremium: email.includes('premium') // Demo logic
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    this.recipeService.refreshUserKeys();
    return true;
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.recipeService.clearAll(); // reset saved/fav
  }

  getUser() {
    return JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('loggedInUser');
  }

  isPremium(): boolean {
    return this.getUser()?.isPremium ?? false;
  }

  getEmail(): string {
    return this.getUser()?.email || '';
  }
}
