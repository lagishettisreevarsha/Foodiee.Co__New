import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private baseUrl = 'http://localhost:2661/api';
  private favoritesUrl = `${this.baseUrl}/Favorites`;

  constructor(private http: HttpClient) {}

  // ===== FAVORITES API ENDPOINTS =====
  
  // GET all favorites for a user
  getUserFavorites(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/user/${userId}`);
  }

  // GET favorite by ID
  getFavoriteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.favoritesUrl}/${id}`);
  }

  // POST new favorite
  addToFavorites(favorite: any): Observable<any> {
    return this.http.post(this.favoritesUrl, favorite);
  }

  // DELETE favorite
  removeFromFavorites(id: number): Observable<any> {
    return this.http.delete(`${this.favoritesUrl}/${id}`);
  }

  // Check if recipe is favorited by user
  isRecipeFavorited(userId: number, recipeId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.favoritesUrl}/check/${userId}/${recipeId}`);
  }

  // Toggle favorite status
  toggleFavorite(userId: number, recipeId: number): Observable<any> {
    return this.http.post(`${this.favoritesUrl}/toggle`, { userId, recipeId });
  }

  // ===== FAVORITE DATA STRUCTURE =====
  
  createFavoriteData(userId: number, recipeId: number): any {
    return {
      id: 0,
      userId: userId,
      recipeId: recipeId,
      createdDate: new Date().toISOString()
    };
  }
}
