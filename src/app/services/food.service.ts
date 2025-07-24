import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  getSavedItemIds() {
    throw new Error('Method not implemented.');
  }
  getFavoritedItemIds() {
    throw new Error('Method not implemented.');
  }
  private foodUrl = 'http://localhost:3000/foods';
  private categoryUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) {}

  getFoods(): Observable<any[]> {
    return this.http.get<any[]>(this.foodUrl);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(this.categoryUrl);
  }
}
