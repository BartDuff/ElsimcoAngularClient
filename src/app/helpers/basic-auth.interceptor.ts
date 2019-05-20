import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with basic auth credentials if available
    const token = localStorage.getItem('token');
    // const url = 'http://localhost:9091';
    // request = request.clone({
    //   url: request.url.replace('http://localhost:4200', 'http://localhost:9091')
    // });
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${token}`
        }
      });
    }
    return next.handle(request);
  }
}
