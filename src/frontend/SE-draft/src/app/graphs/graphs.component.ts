import { Component, OnInit } from '@angular/core';

import { BorderWidth, Chart, Point, ChartColor } from 'chart.js';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit {


  constructor() { }

  ngOnInit() {
    var ctx = document.getElementById('temp');
  var temp = new Chart(ctx, {
      type: 'line',
      data: {
          labels: ['test', 'test', 'test', 'test', 'test', 'test'],
          datasets: [{
              label: 'Temperatures in C°',
              data: [35, 1, 3, 5, 2, 3],
              fill: true,
              backgroundColor:
                  'rgba(255, 99, 132, 0.2)'
              ,
              borderColor:
                  'rgba(255, 99, 132, 1)',


              borderWidth: 0
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
  });

  var ctx = document.getElementById('speed');
  var temp = new Chart(ctx, {
      type: 'line',
      data: {
          labels: ['timestamp','timestamp','timestamp','timestamp','timestamp'],
          datasets: [{
              label: 'Windspeed in m/s',
              data: [10, 1, 3, 5, 2, 3],
              fill: true,
              backgroundColor:
                'rgba(128, 255, 132, 0.2)'
              ,
              borderColor:
                  'rgba(128, 255, 132, 1)',


              borderWidth: 0
          }]
      },
      options: {
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


