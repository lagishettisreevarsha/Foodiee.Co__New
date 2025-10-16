import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../services/recipe.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-upload-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-recipe.component.html',
  styleUrls: ['./upload-recipe.component.css']
})
export class UploadRecipeComponent {
  title = '';
  description = '';
  category = '';
  image = '';
  ingredients = '';
  errorMessage = '';

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  onSubmit() {
    if (!this.title || !this.description || !this.category || !this.image || !this.ingredients) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const user = this.authService.getLoggedInUser();
    const newRecipe = {
      id: Date.now(),
      title: this.title,
      description: this.description,
      category: this.category,
      image: this.image,
      ingredients: this.ingredients.split(',').map(i => i.trim()),
      uploadedBy: user?.email || 'guest'
    };

    this.recipeService.saveUploadedRecipe(newRecipe);
    this.router.navigate(['/home']);
  }

  goBack() {
    this.location.back();
  }
}
