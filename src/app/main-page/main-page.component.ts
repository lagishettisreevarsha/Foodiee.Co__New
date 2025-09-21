import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
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
  private prevThemeWasDark = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Ensure main page always shows in light theme
    if (typeof document !== 'undefined') {
      this.prevThemeWasDark = document.body.classList.contains('dark-theme');
      document.body.classList.remove('dark-theme');
    }
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

  ngOnDestroy(): void {
    // Restore dark theme if it was previously on
    if (typeof document !== 'undefined' && this.prevThemeWasDark) {
      document.body.classList.add('dark-theme');
    }
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
      // API Login
      if (!this.email || !this.password) {
        this.errorMsg = 'Please fill in all fields';
        return;
      }
      
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          // Minimal session for app guards/UI
          if (typeof window !== 'undefined') {
            localStorage.setItem('loggedInUser', JSON.stringify({ email: this.email }));
          }
          this.router.navigate(['/home']);
        },
        error: (err) => {
          const status = err?.status;
          const body = typeof err?.error === 'string' ? err.error : (err?.message || '');
          this.errorMsg = status ? `Login failed (${status}): ${body || 'Unexpected error'}` : (body || 'Login failed');
        }
      });
    } else {
      // API Signup -> map to RegisterDTO
      if (!this.validateSignupForm()) {
        return;
      }

      const payload = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.mobileNumber,
        password: this.password,
        confirmPassword: this.confirmPassword
      };
      
      this.authService.register(payload).subscribe({
        next: () => {
          this.successMsg = 'Account created successfully! Redirecting...';
          setTimeout(() => {
            // Optionally auto-login, but here just go to login mode
            this.isLoginMode = true;
            this.showSignup = false;
            this.showLogin = true;
            this.clearForm();
          }, 1200);
        },
        error: (err) => {
          const status = err?.status;
          const apiErr = err?.error;
          if (apiErr?.errors) {
            try {
              const messages = Object.values(apiErr.errors as any)
                .flat()
                .join(' ');
              this.errorMsg = messages || `Signup failed (${status || ''})`;
            } catch {
              this.errorMsg = `Signup failed (${status || ''})`;
            }
          } else if (typeof apiErr === 'string') {
            this.errorMsg = status ? `Signup failed (${status}): ${apiErr}` : apiErr;
          } else {
            const bodyMsg = err?.message || '';
            this.errorMsg = status ? `Signup failed (${status}): ${bodyMsg || 'Unexpected error'}` : (bodyMsg || 'Signup failed');
          }
        }
      });
    }
  }


  navigateHome() {
    this.router.navigate(['/']);
  }
}
