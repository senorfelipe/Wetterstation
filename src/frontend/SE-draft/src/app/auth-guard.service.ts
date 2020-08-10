import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})

export class AuthGuardService implements CanActivate {
  /**
   * Constructor
   * @param auth Authentifizierungsservice
   * @param router Router
   */
  constructor(public auth: AuthService, public router: Router) {}
 /**
  * Steuert die Routernavigation zum Adminpanel
  * @returns Boolean ob Nutzer authentifiziert ist
  */
  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['admin']);
      return false;
    }
    return true;
  }
}