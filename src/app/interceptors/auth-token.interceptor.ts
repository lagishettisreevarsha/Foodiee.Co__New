import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const isBrowser = typeof window !== 'undefined';
      const token = isBrowser ? localStorage.getItem('authToken') : null;

      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(authReq);
      }
    } catch {
      // noop - fall back to original request
    }

    return next.handle(req);
  }
}
