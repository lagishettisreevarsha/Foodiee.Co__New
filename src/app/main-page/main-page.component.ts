import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  showLogin = false;
  showSignup = false;
  isLoginMode = true;

  email = '';
  password = '';
  errorMsg = '';

  constructor(
    private userService: UserService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
   
     if (this.userService.isLoggedIn()) {
    this.router.navigate(['/home'], { replaceUrl: true });
     }


    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'unauthorized') {
        this.errorMsg = 'Please login to access this page.';
        this.showLogin = true;
        this.isLoginMode = true;
      }
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMsg = '';
  }

  closeForm() {
    this.showLogin = false;
    this.showSignup = false;
    this.isLoginMode = true;
    this.email = '';
    this.password = '';
    this.errorMsg = '';
  }

  onSubmit() {
    if (this.isLoginMode) {
      const success = this.userService.login(this.email, this.password);
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMsg = 'Invalid credentials!';
      }
    } else {
      const success = this.userService.signup(this.email, this.password);
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMsg = 'User already exists!';
      }
    }
  }

  navigateHome() {
    this.router.navigate(['/']);
  }
}
