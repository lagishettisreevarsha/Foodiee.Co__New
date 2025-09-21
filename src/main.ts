import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthTokenInterceptor } from './app/interceptors/auth-token.interceptor';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(SocialLoginModule),
    provideRouter(routes),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '358960811500-ibtanjet1669jeu17pft1uiss4gb2frp.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig
    }
  ]
});
