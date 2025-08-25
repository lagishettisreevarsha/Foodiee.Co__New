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
  selectedCategory = '';
  foodItems: any[] = [];
  categories: string[] = [];
  showChatbot = false;
  isLoading = true;
  skeletonArray = Array.from({ length: 8 });

  // Hero carousel (first image matches current static hero bg)
  heroImages: string[] = [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop'
  ];
  currentHeroIndex = 0;
  private heroIntervalId: any;

  // Mini carousel for recipe images inside hero (below search)
  miniItems: any[] = [];
  displayMiniItems: any[] = [];
  currentMiniIndex = 0; // index over displayMiniItems
  private miniIntervalId: any;
  miniTransition = 'transform 0.5s ease';
  readonly MINI_CARD_STEP = 128; // px (card width 120 + 8 gap)

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

    // Start simple carousel (keeps initial bg as first slide)
    this.heroIntervalId = setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
    }, 3000);

    // Start mini carousel rotation
    this.miniIntervalId = setInterval(() => {
      this.nextMini();
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.heroIntervalId) {
      clearInterval(this.heroIntervalId);
    }
    if (this.miniIntervalId) {
      clearInterval(this.miniIntervalId);
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
        setTimeout(() => {
          window.scrollTo(0, this.scrollService.getScrollPosition());
        }, 0);
        this.setupMiniCarousel();
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
    this.scrollToCards();
    this.setupMiniCarousel();
  }

  onDiscover(): void {
    this.selectCategory('All');
    this.scrollToCards();
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

  // Small helper for compact Trending section (top 4 items only)
  getTrendingItems() {
    return this.filteredItems().slice(0, 4);
  }

  // Setup infinite mini carousel with shuffled items (called after data/filter changes)
  setupMiniCarousel() {
    const base = this.shuffleArray(this.filteredItems()).slice(0, 7);
    this.miniItems = base;
    // create triple list for seamless infinite scroll
    this.displayMiniItems = [...base, ...base, ...base];
    // center start position at the middle list
    this.currentMiniIndex = base.length; // start at first item of middle block
    this.miniTransition = 'none';
    // Defer enabling transition to avoid snap animation at init
    setTimeout(() => { this.miniTransition = 'transform 0.5s ease'; }, 0);
  }

  // Fisher-Yates shuffle
  private shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Navigation
  nextMini() {
    if (!this.displayMiniItems.length) return;
    this.currentMiniIndex += 1;
  }

  prevMini() {
    if (!this.displayMiniItems.length) return;
    this.currentMiniIndex -= 1;
  }

  // Normalize index when crossing into the cloned blocks
  onMiniTransitionEnd() {
    const baseLen = this.miniItems.length;
    if (!baseLen) return;
    if (this.currentMiniIndex >= baseLen * 2) {
      // passed the end of middle block, reset back by baseLen
      this.miniTransition = 'none';
      this.currentMiniIndex = this.currentMiniIndex - baseLen;
      setTimeout(() => { this.miniTransition = 'transform 0.5s ease'; }, 0);
    } else if (this.currentMiniIndex < baseLen) {
      // passed the start of middle block, reset forward by baseLen
      this.miniTransition = 'none';
      this.currentMiniIndex = this.currentMiniIndex + baseLen;
      setTimeout(() => { this.miniTransition = 'transform 0.5s ease'; }, 0);
    }
  }

  get allCategories(): any[] {
    return ['All', ...this.categories];
  }

  selectCategory(category: any) {
    const cat = category.name || category;
    this.selectedCategory = cat === 'All' ? '' : cat;
    this.setupMiniCarousel();
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
