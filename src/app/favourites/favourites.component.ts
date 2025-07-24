import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RecipeService } from '../services/recipe.service';

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

  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/foods').subscribe({
      next: (data) => {
        this.allItems = data;
        const favIds = this.recipeService.getFavoritedItems();
        this.favouritedItems = this.allItems.filter(item => favIds.includes(item.id));
      },
      error: (err) => console.error('Fetch error:', err)
    });
  }
}
