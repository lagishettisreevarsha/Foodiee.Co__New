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

  // Login fields
  email = '';
  password = '';

  // Signup additional fields
  firstName = '';
  lastName = '';
  mobileNumber = '';
  gender = '';
  dateOfBirth = '';
  profilePicFile: File | null = null;
  profilePicPreview: string = '';
  confirmPassword = '';

  errorMsg = '';
  successMsg = '';

  constructor(
    private userService: UserService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Redirect to home if already logged in
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }

    // Show error if redirected from protected page
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
    this.successMsg = '';
    this.clearForm();
  }

  closeForm() {
    this.showLogin = false;
    this.showSignup = false;
    this.isLoginMode = true;
    this.clearForm();
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.firstName = '';
    this.lastName = '';
    this.mobileNumber = '';
    this.gender = '';
    this.dateOfBirth = '';
    this.profilePicFile = null;
    this.profilePicPreview = '';
    this.confirmPassword = '';
    this.errorMsg = '';
    this.successMsg = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMsg = 'Please select an image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = 'File size should be less than 5MB';
        return;
      }

      this.profilePicFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicPreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.errorMsg = '';
    }
  }

  validateSignupForm(): boolean {
    if (!this.firstName.trim()) {
      this.errorMsg = 'First name is required';
      return false;
    }
    if (!this.lastName.trim()) {
      this.errorMsg = 'Last name is required';
      return false;
    }
    if (!this.email.trim()) {
      this.errorMsg = 'Email is required';
      return false;
    }
    if (!this.mobileNumber.trim()) {
      this.errorMsg = 'Mobile number is required';
      return false;
    }
    if (!this.gender) {
      this.errorMsg = 'Please select your gender';
      return false;
    }
    if (!this.dateOfBirth) {
      this.errorMsg = 'Date of birth is required';
      return false;
    }
    if (!this.password) {
      this.errorMsg = 'Password is required';
      return false;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters long';
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return false;
    }
    return true;
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.isLoginMode) {
      // Login logic
      if (!this.email || !this.password) {
        this.errorMsg = 'Please fill in all fields';
        return;
      }
      
      const success = this.userService.login(this.email, this.password);
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMsg = 'Invalid credentials!';
      }
    } else {
      // Signup logic
      if (!this.validateSignupForm()) {
        return;
      }

      const success = this.userService.signup({
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        mobileNumber: this.mobileNumber,
        gender: this.gender,
        dateOfBirth: this.dateOfBirth,
        profilePic: this.profilePicPreview || 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=👤'
      });

      if (success) {
        this.successMsg = 'Account created successfully! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      } else {
        this.errorMsg = 'User already exists!';
      }
    }
  }

  navigateHome() {
    this.router.navigate(['/']);
  }
}
