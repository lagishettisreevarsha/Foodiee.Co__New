import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService } from '../services/food.service';
import { ScrollService } from '../services/scroll.service';
import { RecipeService } from '../services/recipe.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchQuery = '';
  selectedCategory = '';
  foodItems: any[] = [];
  categories: string[] = [];
  showChatbot = false;

  constructor(
    public router: Router,
    private foodService: FoodService,
    private scrollService: ScrollService,
    public recipeService: RecipeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRecipes();

    this.foodService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  // ✅ This loads both uploaded + db.json recipes
  loadRecipes() {
    this.foodService.getFoods().subscribe(data => {
      const uploaded = this.recipeService.getUploadedRecipes();
      this.foodItems = [...uploaded, ...data];
      setTimeout(() => {
        window.scrollTo(0, this.scrollService.getScrollPosition());
      }, 0);
    });
  }

  
  toggleSave(id: number) {
    this.recipeService.isSaved(id)
      ? this.recipeService.unsaveItem(id)
      : this.recipeService.saveItem(id);
  }

  toggleFavorite(id: number) {
    this.recipeService.isFavorited(id)
      ? this.recipeService.unfavoriteItem(id)
      : this.recipeService.favoriteItem(id);
  }

  isSaved(id: number): boolean {
    return this.recipeService.isSaved(id);
  }

  isFavorited(id: number): boolean {
    return this.recipeService.isFavorited(id);
  }

  filteredItems() {
    return this.foodItems.filter(item =>
      (!this.selectedCategory || item.category === this.selectedCategory) &&
      (!this.searchQuery || item.title.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
    console.log(this.filteredItems)
  }

  get allCategories(): any[] {
    return ['All', ...this.categories];
  }

  selectCategory(category: any) {
    const cat = category.name || category;
    this.selectedCategory = cat === 'All' ? '' : cat;
  }

  goToFoodDetail(id: number) {
    this.scrollService.setScrollPosition(window.scrollY);
    this.router.navigate(['/food', id]);
  }

  goToSaved() {
    this.router.navigate(['/saved']);
  }

  goToFavourites() {
    this.router.navigate(['/favourites']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToChatbot() {
    this.router.navigate(['/chatbot']);
  }

  goToUpload(): void {
    const user = this.authService.getLoggedInUser();
    if (!user) {
      alert('Please log in to upload recipes.');
      this.router.navigate(['/']);
      return;
    }

    this.router.navigate(['/upload-recipe']);
  }

  mockLogin() {
    const user = {
      email: 'varsha@foodiee.co',
      joinDate: new Date().toISOString()
    };
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    alert('Logged in as User');
    this.recipeService.refreshUserKeys(); // refresh keys
    this.loadRecipes(); // reload with correct user context
  }

  mockLogout() {
    localStorage.removeItem('loggedInUser');
    alert('Logged out!');
    this.recipeService.refreshUserKeys(); // refresh keys
    this.loadRecipes(); // reload as guest
  }
  // Add inside HomeComponent class

isUploadedRecipe(id: number): boolean {
  return this.recipeService.isUploadedRecipe(id);
}

deleteRecipe(id: number): void {
  this.recipeService.deleteUploadedRecipe(id);
  this.loadRecipes(); // Refresh list after deletion
}

}
