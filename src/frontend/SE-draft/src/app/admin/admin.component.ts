import { Component, OnInit } from '@angular/core';
import {MdbCardBodyComponent,MdbCardComponent} from 'angular-bootstrap-md'




@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
  
})
export class AdminComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    MdbCardComponent;
  }

  
}
