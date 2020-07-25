import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import { catchError } from 'rxjs/operators'; 

@Injectable({
    providedIn: 'root'
})

export class AdminService {
    private apiUrl = 'http://localhost:8000/api/';
    private http: HttpClient;
    private error;

    constructor(http: HttpClient) {
      this.http = http;
    }

    provideToken(user, pwd){
        return this.http.post<AuthToken[]>(this.apiUrl + 'token/', {"username":user, "password":pwd});;
    }
}

export interface AuthToken {
    refresh: String;
    access: String;
  }