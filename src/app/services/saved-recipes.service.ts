import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavedRecipesService {
  private baseUrl = 'http://localhost:2661/api';
  private savedRecipesUrl = `${this.baseUrl}/SavedRecipes`;

  constructor(private http: HttpClient) {}

  // ===== SAVED RECIPES API ENDPOINTS =====
  
  // GET all saved recipes for a user
  getUserSavedRecipes(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.savedRecipesUrl}/user/${userId}`);
  }

  // GET saved recipe by ID
  getSavedRecipeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.savedRecipesUrl}/${id}`);
  }

  // POST new saved recipe
  saveRecipe(savedRecipe: any): Observable<any> {
    return this.http.post(this.savedRecipesUrl, savedRecipe);
  }

  // DELETE saved recipe
  unsaveRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.savedRecipesUrl}/${id}`);
  }

  // Check if recipe is saved by user
  isRecipeSaved(userId: number, recipeId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.savedRecipesUrl}/check/${userId}/${recipeId}`);
  }

  // Toggle save status
  toggleSaveRecipe(userId: number, recipeId: number): Observable<any> {
    return this.http.post(`${this.savedRecipesUrl}/toggle`, { userId, recipeId });
  }

  // ===== SAVED RECIPE DATA STRUCTURE =====
  
  createSavedRecipeData(userId: number, recipeId: number): any {
    return {
      id: 0,
      userId: userId,
      recipeId: recipeId,
      savedDate: new Date().toISOString()
    };
  }
}
