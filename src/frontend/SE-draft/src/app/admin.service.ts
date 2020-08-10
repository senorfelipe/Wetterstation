import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import { catchError } from 'rxjs/operators'; 

@Injectable({
    providedIn: 'root'
})

export class AdminService {
    /** @private URL der REST-Schnittstellee */
    private apiUrl = 'http://localhost:8000/api/';
    /**@private Http-Client */
    private http: HttpClient;
    /**@private Error */
    private error;

    constructor(http: HttpClient) {
      this.http = http;
    }
/**
 * 
 * @param user Benutzername
 * @param pwd Passwort
 * @returns post-request des Authentifizerungtoken
 */
    provideToken(user, pwd){
        return this.http.post<AuthToken[]>(this.apiUrl + 'token/', {"username":user, "password":pwd});;
    }
}

/**Interface für den Authentifizierungstoken */
export interface AuthToken {
    /**Refresh */
    refresh: String;
    /**Zugriffsfreigabe */
    access: String;
  }