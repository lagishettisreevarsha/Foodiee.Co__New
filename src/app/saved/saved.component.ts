import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RecipeService } from '../services/recipe.service';

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

  constructor(private http: HttpClient, private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:3000/foods').subscribe({
      next: (data) => {
        this.allItems = data;
        const savedIds = this.recipeService.getSavedItems();
        this.savedItems = this.allItems.filter(item => savedIds.includes(item.id));
      },
      error: (err) => console.error('Fetch error:', err)
    });
  }
}
