import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RecipeService } from '../services/recipe.service';
import { FoodService } from '../services/food.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent implements OnInit {
  allItems: any[] = [];
  savedItems: any[] = [];

  private sub?: Subscription;
  constructor(private foodService: FoodService, private recipeService: RecipeService, private location: Location) {}

  ngOnInit(): void {
    this.foodService.getFoods().subscribe({
      next: (data) => {
        const uploaded = this.recipeService.getUploadedRecipes();
        this.allItems = [...uploaded, ...data];
        this.computeSaved(this.recipeService.getSavedItems());
        this.sub = this.recipeService.savedIds$.subscribe(ids => this.computeSaved(ids));
      },
      error: (err) => console.error('Fetch error:', err)
    });
  }

  private computeSaved(savedIds: number[]) {
    this.savedItems = this.allItems.filter(item => savedIds.includes(item.id));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goBack() {
    this.location.back();
  }
}
