import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private authService: AuthenticationService,
              private router: Router) { }

  canActivate() {
    this.authService.emitCredentials();
    if (this.authService.isAuth) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
