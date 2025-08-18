import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private baseUrl = 'http://localhost:2661/api';
  private recipeUrl = `${this.baseUrl}/Recipe`;
  
  private savedItems: number[] = [];
  private favoritedItems: number[] = [];

  private savedKey = '';
  private favKey = '';

  constructor(private http: HttpClient) {
    this.refreshUserKeys(); // Load items on service start
  }

  // ===== RECIPE API ENDPOINTS =====
  
  // GET all recipes
  getAllRecipes(): Observable<any[]> {
    return this.http.get<any[]>(this.recipeUrl);
  }

  // GET recipe by ID
  getRecipeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.recipeUrl}/${id}`);
  }

  // POST new recipe
  createRecipe(recipe: any): Observable<any> {
    return this.http.post(this.recipeUrl, recipe);
  }

  // PUT update recipe
  updateRecipe(id: number, recipe: any): Observable<any> {
    return this.http.put(`${this.recipeUrl}/${id}`, recipe);
  }

  // DELETE recipe
  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.recipeUrl}/${id}`);
  }

  // GET recipes by category
  getRecipesByCategory(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.recipeUrl}/category/${categoryId}`);
  }

  // GET recipes by user
  getRecipesByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.recipeUrl}/user/${userId}`);
  }

  // ===== LOCAL STORAGE METHODS (for backward compatibility) =====
  
  refreshUserKeys() {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      const id = user?.email || 'guest';

      this.savedKey = `savedItems_${id}`;
      this.favKey = `favoritedItems_${id}`;

      this.loadSaved();
      this.loadFavorited();
    }
  }

  private loadSaved() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.savedKey);
      this.savedItems = saved ? JSON.parse(saved) : [];
    }
  }

  private loadFavorited() {
    if (typeof window !== 'undefined') {
      const fav = localStorage.getItem(this.favKey);
      this.favoritedItems = fav ? JSON.parse(fav) : [];
    }
  }

  private updateSavedStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.savedKey, JSON.stringify(this.savedItems));
    }
  }

  private updateFavStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.favKey, JSON.stringify(this.favoritedItems));
    }
  }

  // ===== SAVE/FAVORITE METHODS =====
  
  saveItem(id: number) {
    if (!this.savedItems.includes(id)) {
      this.savedItems.push(id);
      this.updateSavedStorage();
    }
  }

  unsaveItem(id: number) {
    this.savedItems = this.savedItems.filter(item => item !== id);
    this.updateSavedStorage();
  }

  isSaved(id: number): boolean {
    return this.savedItems.includes(id);
  }

  getSavedItems(): number[] {
    return this.savedItems;
  }

  favoriteItem(id: number) {
    if (!this.favoritedItems.includes(id)) {
      this.favoritedItems.push(id);
      this.updateFavStorage();
    }
  }

  unfavoriteItem(id: number) {
    this.favoritedItems = this.favoritedItems.filter(item => item !== id);
    this.updateFavStorage();
  }

  isFavorited(id: number): boolean {
    return this.favoritedItems.includes(id);
  }

  getFavoritedItems(): number[] {
    return this.favoritedItems;
  }

  // ===== UPLOADED RECIPES (Local Storage) =====
  
  getUploadedRecipes(): any[] {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('uploadedRecipes') || '[]');
    }
    return [];
  }

  saveUploadedRecipe(recipe: any) {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('uploadedRecipes') || '[]');
      existing.push(recipe);
      localStorage.setItem('uploadedRecipes', JSON.stringify(existing));
    }
  }

  deleteUploadedRecipe(id: number): void {
    if (typeof window !== 'undefined') {
      const recipes = this.getUploadedRecipes().filter(recipe => recipe.id !== id);
      localStorage.setItem('uploadedRecipes', JSON.stringify(recipes));
    }
  }

  isUploadedRecipe(id: number): boolean {
    if (typeof window !== 'undefined') {
      return this.getUploadedRecipes().some(recipe => recipe.id === id);
    }
    return false;
  }

  clearAll() {
    this.savedItems = [];
    this.favoritedItems = [];
    this.updateSavedStorage();
    this.updateFavStorage();
  }
}
