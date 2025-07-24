import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private savedItems: number[] = [];
  private favoritedItems: number[] = [];

  private savedKey = '';
  private favKey = '';

  constructor() {
    this.refreshUserKeys(); // Load items on service start
  }

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

 
saveUploadedRecipe(recipe: any) {
  const existing = JSON.parse(localStorage.getItem('uploadedRecipes') || '[]');
  existing.push(recipe);
  localStorage.setItem('uploadedRecipes', JSON.stringify(existing));
}

  clearAll() {
    this.savedItems = [];
    this.favoritedItems = [];
    this.updateSavedStorage();
    this.updateFavStorage();
  }
}
