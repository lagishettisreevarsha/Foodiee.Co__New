import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private baseUrl = 'http://localhost:2661/api';
  private foodUrl = `${this.baseUrl}/Recipe`;
  private categoryUrl = `${this.baseUrl}/Category`;

  constructor(private http: HttpClient) {}

  // ===== RECIPE ENDPOINTS =====
  
  // GET all recipes
  getAllRecipes(): Observable<any[]> {
    return this.http.get<any[]>(this.foodUrl);
  }

  // GET recipe by ID
  getRecipeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.foodUrl}/${id}`);
  }

  // POST new recipe
  createRecipe(recipe: any): Observable<any> {
    return this.http.post(this.foodUrl, recipe);
  }

  // PUT update recipe
  updateRecipe(id: number, recipe: any): Observable<any> {
    return this.http.put(`${this.foodUrl}/${id}`, recipe);
  }

  // DELETE recipe
  deleteRecipe(id: number): Observable<any> {
    return this.http.delete(`${this.foodUrl}/${id}`);
  }

  // ===== CATEGORY ENDPOINTS =====
  
  // GET all categories
  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoryUrl);
  }

  // GET category by ID
  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.categoryUrl}/${id}`);
  }

  // POST new category
  createCategory(category: any): Observable<any> {
    return this.http.post(this.categoryUrl, category);
  }

  // ===== LEGACY METHODS (for backward compatibility) =====
  
  getFoods(): Observable<any[]> {
    return this.getAllRecipes();
  }

  getCategories(): Observable<any[]> {
    return this.getAllCategories();
  }

  getSavedItemIds() {
    throw new Error('Method not implemented.');
  }

  getFavoritedItemIds() {
    throw new Error('Method not implemented.');
  }

  // ===== HELPER METHODS =====
  
  // Map category names to IDs (you'll need to update these with real IDs)
  mapCategoryToId(categoryName: string): number {
    const categoryMap: { [key: string]: number } = {
      'Breakfast': 1,
      'Lunch': 2,
      'Dinner': 3,
      'Dessert': 4,
      'Snacks': 5,
      'Beverages': 6
    };
    
    return categoryMap[categoryName] || 1;
  }

  // Create API-ready recipe object
  createApiRecipe(food: any): any {
    return {
      id: 0,
      title: food.title,
      description: food.description,
      categoryId: this.mapCategoryToId(food.category),
      image: food.image,
      video: food.video || "",
      uploadedById: 1, // Default user ID - update this!
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
  }

  // ===== TESTING & DEBUGGING =====
  
  // Test basic API connectivity
  testApiConnection(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/health`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  // Test categories endpoint specifically
  testCategoriesEndpoint(): Observable<any> {
    return this.http.get(this.categoryUrl)
      .pipe(
        catchError(error => {
          console.error('Categories endpoint error:', error);
          throw error;
        })
      );
  }

  // Test recipes endpoint specifically
  testRecipesEndpoint(): Observable<any> {
    return this.http.get(this.foodUrl)
      .pipe(
        catchError(error => {
          console.error('Recipes endpoint error:', error);
          throw error;
        })
      );
  }
}
