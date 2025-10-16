import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

import { Router } from '@angular/router';
import { RecipeService } from '../services/recipe.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  isLoading = true;
  items: any[] = [];

  constructor(private recipes: RecipeService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.isLoading = true;
    this.recipes.getAllRecipes().subscribe({
      next: (apiItems) => {
        const uploaded = this.recipes.getUploadedRecipes();
        this.items = [...uploaded, ...(apiItems || [])];
        this.isLoading = false;
      },
      error: () => {
        const uploaded = this.recipes.getUploadedRecipes();
        this.items = [...uploaded];
        this.isLoading = false;
      }
    });
  }

  // actions & checks delegate to service
  isSaved(id: number) { return this.recipes.isSaved(id); }
  isFavorited(id: number) { return this.recipes.isFavorited(id); }
  toggleSave(id: number) { this.recipes.toggleSave(id); }
  toggleFavorite(id: number) { this.recipes.toggleFavorite(id); }
  isUploadedRecipe(id: number) { return this.recipes.isUploadedRecipe(id); }

  openDetail(id: number) { this.router.navigate(['/food', id]); }

  goBack() { this.location.back(); }
}