import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Chart} from 'chart.js';

var voltdates = ['25.05.2020', '26.05.2020', '27.05.2020']
var voltexample = [2.5,4,2]
var volumexample = [180,194,218]

export interface raspyActions {
  date: string;
  name: string;
  action: string;
}

export interface DialogData {
  datetime: Date;
}

const adminData: raspyActions[] = [
  {date: '23.05.2020, 17:05', name: 'Mustermann', action: 'Wartungsmodus beendet'},
  {date: '23.05.2020, 16:49', name: 'Mustermann', action: 'Wartungsmodus angefragt'},
];

@Component({
  selector: 'app-adminpanel',
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.scss']
})

export class AdminpanelComponent implements OnInit {

  constructor(public dialog: MatDialog) {}

  ipaddress:String;

  ngOnInit(){
    this.buildGraphs();
    this.ipaddress = '12.345.67.890';
  }

  displayedColumns: string[] = ['date','name','action'];
  tableData = adminData;

  buildGraphs(){
    let ctx = document.getElementById('volt');
    let volts = new Chart(ctx, {
      type: 'line',
      data: {
        labels: voltdates,
        datasets: [{
          label: 'Verbrauch in *Einheit*',
          data: voltexample,
          fill: true,
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Energieverbrauch',
          fontSize: 20
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });

    ctx = document.getElementById('volume');
    let volumes = new Chart(ctx, {
      type: 'line',
      data: {
        labels: voltdates,
        datasets: [{
          label: 'Verbrauch in kB',
          data: volumexample,
          fill: true,
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Datenverbrauch',
          fontSize: 20
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  setDateTime(){
    let datetime = (document.getElementById("maintenanceTime") as HTMLInputElement).value;
    if(!datetime){
      document.getElementById("maintenanceStatus").innerHTML='Kein Datum eingegeben!';
      document.getElementById("maintenanceStatus").style.color= 'red';
      return;
    }
    let date = Date.parse(datetime);
    let dates = new Date(date);
    let str = dates.toString();
    str = str.substr(str.indexOf(' ')+1);
    document.getElementById("maintenanceStatus").innerHTML='Wartungsmodus gesetzt für'+'<br />'+str;
    document.getElementById("maintenanceStatus").style.color= 'green';
  }
}
