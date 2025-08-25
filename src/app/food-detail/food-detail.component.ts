import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodService } from '../services/food.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-food-detail',
  imports: [FormsModule,CommonModule],
  templateUrl: './food-detail.component.html',
  styleUrl: './food-detail.component.css'
})
export class FoodDetailComponent implements OnInit{
  foodItem:any;
  safeYoutubeUrl?: SafeResourceUrl;
  constructor(private router: Router, private route: ActivatedRoute, private foodService: FoodService, private sanitizer: DomSanitizer) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.foodService.getFoods().subscribe(data => {
        this.foodItem = data.find(item => item.id == +id);
        this.prepareVideo();
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
}
