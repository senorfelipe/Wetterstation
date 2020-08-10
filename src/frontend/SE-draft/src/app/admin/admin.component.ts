import { Component, OnInit } from '@angular/core';
import { AuthToken, AdminService } from "../admin.service";
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
  
})
export class AdminComponent implements OnInit {
/**Admin Service */
  adminService: AdminService;
  /**Subscription Service */
  adminSubscription: Subscription;
  /**Auth.-Token */
  token: AuthToken[] = [];
  /**Benutzername */
  username: string;
  /**Passwort */
  password: string;
  /**Fehler beim Login */
  loginError: boolean = true;
  errors;

  constructor(adminService: AdminService, private router: Router){
    this.adminService = adminService;
  }

  ngOnInit() {
    this.router.navigate(['adminpanel']);
  }
/**Erhält Token */
  getToken(){
    this.adminSubscription =
      this.adminService.provideToken(this.username, this.password).subscribe(
        (tokendata) => {
          this.loginError = true;
          this.logToken(tokendata);
        }, error => {
          this.loginError = false;
          this.errors = error; 
          console.log("Fehler: Account konnte nicht zugeordnet werden");
        }
      );
  }
/**
 * 
 * @param tok Token
 * loggt Token und leitet ans Adminpanel weiter
 */
  logToken(tok){
    this.token=tok;
    localStorage.setItem("weatherToken",this.token["access"]);
    //localStorage.removeItem("weatherToken");
    console.log("Token:"+this.token);
    this.router.navigate(['adminpanel']);
  }
  
}
