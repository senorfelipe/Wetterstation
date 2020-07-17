import { Component, OnInit } from '@angular/core';
import { AuthToken, AdminService } from "../admin.service";
import { BehaviorSubject, Subscription } from 'rxjs';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
  
})
export class AdminComponent implements OnInit {

  adminService: AdminService;
  adminSubscription: Subscription;
  token: AuthToken[] = [];

  constructor(adminService: AdminService){
    this.adminService = adminService;
  }

  ngOnInit() {
    
  }

  getToken(){
    this.adminSubscription =
      this.adminService.provideToken("admin", "1").subscribe((tokendata) => {
        this.logToken(tokendata);
    });
  }

  logToken(tok){
    this.token=tok;
    console.log(this.token);
  }
  
}
