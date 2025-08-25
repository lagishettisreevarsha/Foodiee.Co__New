import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RecipeService } from '../services/recipe.service';
import { FoodService } from '../services/food.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements OnInit {
  allItems: any[] = [];
  favouritedItems: any[] = [];
  private sub?: Subscription;

  constructor(private foodService: FoodService, private recipeService: RecipeService) {}

  ngOnInit(): void {
    // Load API recipes
    this.foodService.getFoods().subscribe({
      next: (data) => {
        // Merge uploaded local recipes
        const uploaded = this.recipeService.getUploadedRecipes();
        this.allItems = [...uploaded, ...data];
        // Initial compute
        this.computeFavourites(this.recipeService.getFavoritedItems());
        // React to changes anywhere in app
        this.sub = this.recipeService.favIds$.subscribe(ids => this.computeFavourites(ids));
      },
      error: (err) => console.error('Fetch error:', err)
    });
  }

  private computeFavourites(favIds: number[]) {
    this.favouritedItems = this.allItems.filter(item => favIds.includes(item.id));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
