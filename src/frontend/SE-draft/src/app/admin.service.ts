import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class AdminService {
    private apiUrl = 'http://localhost:8000/api/';
    private http: HttpClient;
  
    constructor(http: HttpClient) {
      this.http = http;
    }

    provideToken(user, pwd){
        return this.http.post<AuthToken[]>(this.apiUrl + 'token/', {"username":user, "password":pwd})
    }
}

export interface AuthToken {
    refresh: String;
    access: String;
  }