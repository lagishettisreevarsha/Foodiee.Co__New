import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./main-page/main-page.component').then(c => c.MainPageComponent) },
  { path: 'home', loadComponent: () => import('./home/home.component').then(c => c.HomeComponent), canActivate: [authGuard] },
  { path: 'explore', loadComponent: () => import('./explore/explore.component').then(c => c.ExploreComponent), canActivate: [authGuard] },
  { path: 'food/:id', loadComponent: () => import('./food-detail/food-detail.component').then(c => c.FoodDetailComponent), canActivate: [authGuard] },
  { path: 'saved', loadComponent: () => import('./saved/saved.component').then(c => c.SavedComponent), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent), canActivate: [authGuard] },
  { path: 'favourites', loadComponent: () => import('./favourites/favourites.component').then(c => c.FavouritesComponent), canActivate: [authGuard] },
  { path: 'chatbot', loadComponent: () => import('./chatbot/chatbot.component').then(c => c.ChatbotComponent), canActivate: [authGuard] },
  { path: 'upload-recipe', loadComponent: () => import('./upload-recipe/upload-recipe.component').then(m => m.UploadRecipeComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
