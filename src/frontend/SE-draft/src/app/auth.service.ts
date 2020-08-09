import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  public jwtHelper = new JwtHelperService();
  constructor() {}
  // ...
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('weatherToken');
    console.log(token);
    // Check whether the token is expired and return
    // true or false
    //console.log(this.jwtHelper.getTokenExpirationDate("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTk1NjAwMjc2LCJqdGkiOiJkNDI4MzUwOWM4YjM0Mzc3OWE1ZjkxMDA4YmJlYzA3MSIsInVzZXJfaWQiOjF9.yJNowg-P0SkTXgnN6dxz5rw3PRVZZ59Pk6EI6oq-TBY"));
    console.log(this.jwtHelper.getTokenExpirationDate(token));
    return !this.jwtHelper.isTokenExpired(token);
  }
}