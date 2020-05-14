import {Component, OnInit} from '@angular/core';

import {Chart} from 'chart.js';
import {TemperatureData, WeatherDataService} from "../weather-data.service";
import { BehaviorSubject } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit {
  temperatureData: TemperatureData[] = [];
  weatherDataService: WeatherDataService;
  extendedModeStatus: BehaviorSubject<boolean>;
  extendedMode: boolean = false;

  constructor(weatherDataService: WeatherDataService) {
    this.weatherDataService = weatherDataService
    this.extendedModeStatus = new BehaviorSubject(false)
  }

  ngOnInit() {
    this.weatherDataService.getTemperatures().subscribe((data) => {
      this.temperatureData = data;
      this.buildGraphs();
    });
    this.extendedModeStatus.subscribe((data)=>this.extendedMode=data)
  
  }

  onChange(event: MatSlideToggleChange){
    console.log(event);
    this.extendedModeStatus.next(event.checked)
  }

  


  buildGraphs() {
    var ctx = document.getElementById('temp');
    var temps = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.temperatureData.map(data => new Date(data.time).getHours()),
        datasets: [{
          label: 'Temperatures in C°',
          data: this.temperatureData.map(data => data.value),
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

    ctx = document.getElementById('speed');
    var speed = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['timestamp', 'timestamp', 'timestamp', 'timestamp', 'timestamp'],
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


