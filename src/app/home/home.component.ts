import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  searchQuery = '';
  suggestions: any[] = [];
  selectedCategory = '';
  foodItems: any[] = [];
  categories: string[] = [];
  showChatbot = false;
  isLoading = true;
  skeletonArray = Array.from({ length: 16 });

  // Pagination state
  currentPage = 1;
  pageSize = 16; // items per page

  // Hero carousel images (fresh curated set)
  heroImages: string[] = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop'
  
  ];
  currentHeroIndex = 0;
  private heroIntervalId: any;

  @ViewChild('cardsTop') cardsTopRef!: ElementRef<HTMLDivElement>;

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

    // Enable hero background rotation
    this.heroIntervalId = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
    }, 3500);

    // Initialize theme from localStorage
    this.applySavedTheme();
  }

  ngOnDestroy(): void {
    if (this.heroIntervalId) {
      clearInterval(this.heroIntervalId);
    }
  }

  // ✅ This loads both uploaded + db.json recipes
  loadRecipes() {
    this.isLoading = true;
    this.foodService.getFoods().subscribe({
      next: data => {
        const uploaded = this.recipeService.getUploadedRecipes();
        this.foodItems = [...uploaded, ...data];
        this.isLoading = false;
        // reset pagination when data reloads
        this.currentPage = 1;
        setTimeout(() => {
          window.scrollTo(0, this.scrollService.getScrollPosition());
        }, 0);
        // mini carousel removed
      },
      error: () => {
        this.isLoading = false;
      }
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

  // Search + discover helpers with auto scroll
  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.updateSuggestions();
    this.currentPage = 1; // reset pagination on search
  }

  onDiscover(): void {
    this.selectCategory('All');
    this.scrollToCards();
  }

  // Navigate to full Explore page
  goToExplore(): void {
    this.router.navigate(['/explore']);
  }

  scrollToCards(): void {
    try {
      if (this.cardsTopRef && this.cardsTopRef.nativeElement) {
        const y = this.cardsTopRef.nativeElement.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } catch {}
  }

  // Removed confetti and rotating hero code for a cleaner UI

  filteredItems() {
    return this.foodItems.filter(item =>
      (!this.selectedCategory || item.category === this.selectedCategory) &&
      (!this.searchQuery || item.title.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  // Paginated items derived from current filters
  paginatedItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const total = this.filteredItems().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages = this.totalPages;
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.scrollToCards();
  }

  nextPage() { this.goToPage(this.currentPage + 1); }
  prevPage() { this.goToPage(this.currentPage - 1); }

  // Typeahead suggestions: top 5 by title match
  private updateSuggestions() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) { this.suggestions = []; return; }
    this.suggestions = this.foodItems
      .filter(i => i.title && i.title.toLowerCase().includes(q))
      .slice(0, 5);
  }

  selectSuggestion(item: any) {
    this.searchQuery = item.title || '';
    this.suggestions = [];
    this.scrollToCards();
  }

  clearSuggestions() {
    // Delay to allow click events on suggestions
    setTimeout(() => this.suggestions = [], 150);
  }

  // Small helper for compact Trending section (top 4 items only)
  getTrendingItems() {
    return this.filteredItems().slice(0, 4);
  }

  get allCategories(): any[] {
    return ['All', ...this.categories];
  }

  selectCategory(category: any) {
    const cat = category.name || category;
    this.selectedCategory = cat === 'All' ? '' : cat;
    this.currentPage = 1; // reset on category change
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
    this.loadRecipes(); // reload with correct user context
  }

  mockLogout() {
    localStorage.removeItem('loggedInUser');
    alert('Logged out!');
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

  // Show delete only for recipes uploaded by the current user
  isOwnedUploadedRecipe(id: number): boolean {
    return this.recipeService.isOwnedUploadedRecipe(id);
  }

  // Theme toggle (dark/light) persisted in localStorage
  toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private applySavedTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
