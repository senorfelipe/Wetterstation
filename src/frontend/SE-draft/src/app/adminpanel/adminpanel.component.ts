import { Component, OnInit } from '@angular/core';
import {Chart} from 'chart.js';

var voltdates = ['25.05.2020', '26.05.2020', '27.05.2020']
var voltexample = [2.5,4,2]
var volumexample = [180,194,218]

export interface raspyActions {
  date: string;
  name: string;
  action: string;
}

const adminData: raspyActions[] = [
  {date: '23.05.2020, 16:49', name: 'Mustermann', action: 'Wartungsmodus angefragt'},
  {date: '23.05.2020, 17:05', name: 'Mustermann', action: 'Wartungsmodus beendet'},
];

@Component({
  selector: 'app-adminpanel',
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.scss']
})

export class AdminpanelComponent implements OnInit {

  constructor() { }

  ngOnInit(){
    this.buildGraphs();
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
}
