import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodService } from '../services/food.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RecipeService } from '../services/recipe.service';

@Component({
  selector: 'app-food-detail',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './food-detail.component.html',
  styleUrls: ['./food-detail.component.css']
})
export class FoodDetailComponent implements OnInit{
  foodItem:any;
  safeYoutubeUrl?: SafeResourceUrl;
  // Ratings
  currentUserRating = 0;
  averageRating = 0;
  ratingCount = 0;
  hoverRating = 0;

  constructor(private router: Router, private route: ActivatedRoute, private foodService: FoodService, private sanitizer: DomSanitizer, private recipeService: RecipeService) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.foodService.getFoods().subscribe(data => {
        this.foodItem = data.find(item => item.id == +id);
        this.prepareVideo();
        this.loadRatings();
         });
    }
  }

  goBack() {
  this.router.navigate(['/home']);
}
  
getSafeYoutubeUrl(url: string): SafeResourceUrl {
  // Handle common YouTube URL formats
  try {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const u = new URL(url);
      videoId = u.searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split(/[?&#]/)[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split(/[?&#]/)[0];
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  } catch {
    return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }
}

private prepareVideo() {
  const yt = this.foodItem?.youtubeUrl || this.foodItem?.youtube || this.foodItem?.videoUrl;
  if (yt) {
    this.safeYoutubeUrl = this.getSafeYoutubeUrl(yt);
  }
}

// -------- Save/Favorite (shared state) --------
toggleSave(id: number) { this.recipeService.toggleSave(id); }
toggleFavorite(id: number) { this.recipeService.toggleFavorite(id); }
isSaved(id: number) { return this.recipeService.isSaved(id); }
isFavorited(id: number) { return this.recipeService.isFavorited(id); }

// -------- Ratings logic (localStorage) --------
private getUserId(): string {
  try {
    const u = localStorage.getItem('loggedInUser');
    if (u) {
      const parsed = JSON.parse(u);
      return parsed?.email || 'guest';
    }
  } catch {}
  return 'guest';
}

private getRatingsMap(): any {
  try {
    return JSON.parse(localStorage.getItem('ratings') || '{}');
  } catch {
    return {};
  }
}

private setRatingsMap(map: any) {
  localStorage.setItem('ratings', JSON.stringify(map));
}

loadRatings() {
  if (!this.foodItem?.id) return;
  const map = this.getRatingsMap();
  const itemKey = String(this.foodItem.id);
  const itemRatings = map[itemKey]?.byUser || {};
  // Compute average and count
  const values: number[] = Object.values(itemRatings).map((v: any) => Number(v)).filter((n: number) => !isNaN(n));
  const sum = values.reduce((a, b) => a + b, 0);
  this.ratingCount = values.length;
  this.averageRating = this.ratingCount ? +(sum / this.ratingCount).toFixed(1) : 0;
  // Set current user rating if exists
  const uid = this.getUserId();
  this.currentUserRating = Number(itemRatings[uid] || 0);
}

submitRating(rating: number) {
  if (!this.foodItem?.id) return;
  const uid = this.getUserId();
  const map = this.getRatingsMap();
  const itemKey = String(this.foodItem.id);
  if (!map[itemKey]) map[itemKey] = { byUser: {} };
  map[itemKey].byUser[uid] = rating;
  this.setRatingsMap(map);
  this.currentUserRating = rating;
  this.loadRatings();
  alert('Thanks for rating!');
}

setHover(r: number) { this.hoverRating = r; }
clearHover() { this.hoverRating = 0; }

// -------- Share helpers --------
private getShareData() {
  const url = window.location.href;
  const title = this.foodItem?.title || 'Recipe';
  const text = `Check out this recipe: ${title}`;
  const image = this.foodItem?.image || '';
  return { url, title, text, image };
}

shareWhatsApp() {
  const { url, text } = this.getShareData();
  const wa = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
  window.open(wa, '_blank');
}

sharePinterest() {
  const { url, title, image } = this.getShareData();
  const pin = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`;
  window.open(pin, '_blank');
}

async shareNative() {
  const { url, title, text } = this.getShareData();
  if ((navigator as any).share) {
    try {
      await (navigator as any).share({ title, text, url });
      return;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  } catch {
    window.open(url, '_blank');
  }
}
}
