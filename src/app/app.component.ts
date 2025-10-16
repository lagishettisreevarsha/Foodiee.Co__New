import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  user:any;
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.user = this.userService.getUser();
    // Apply saved theme globally on app bootstrap
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    } catch {}
  }
  title = 'Foodiee.co';
  logout() {
    this.userService.logout();
    window.location.reload();
  }
}
