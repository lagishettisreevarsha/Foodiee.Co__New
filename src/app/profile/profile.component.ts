import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  isEditing = false;
  editUser: any = {};

  constructor(private userService: UserService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    if (!this.user) {
      this.router.navigate(['/'], { queryParams: { error: 'unauthorized' } });
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  toggleEdit() {
    this.isEditing = true;
    this.editUser = { ...this.user };
  }

  cancelEdit() {
    this.isEditing = false;
    this.editUser = {};
  }

  saveChanges() {
    this.user = { ...this.user, ...this.editUser };
    this.userService.updateUser(this.user);
    this.isEditing = false;
    this.editUser = {};
    alert('Profile updated successfully!');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePic = e.target.result;
        this.userService.updateUser(this.user);
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePic() {
    this.user.profilePic = null;
    this.userService.updateUser(this.user);
  }

  goBack() {
    this.location.back();
  }
}
