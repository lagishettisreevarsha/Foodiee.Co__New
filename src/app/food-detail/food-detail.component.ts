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
  constructor(private router: Router, private route: ActivatedRoute, private foodService: FoodService, private sanitizer: DomSanitizer) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.foodService.getFoods().subscribe(data => {
        this.foodItem = data.find(item => item.id == +id);
         });
    }
  }

  goBack() {
  this.router.navigate(['/home']);
}
  
getSafeYoutubeUrl(url: string): SafeResourceUrl {
  const videoId = url.split('v=')[1] || url.split('youtu.be/')[1];
  return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
}
}
