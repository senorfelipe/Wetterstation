import {Component, OnInit,OnDestroy, OnChanges} from '@angular/core';

import {Chart} from 'chart.js';
import {TemperatureData, WeatherDataService} from "../weather-data.service";
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange } from '@angular/material/radio';



@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit,OnDestroy {
  temperatureData: TemperatureData[] = [];
  weatherDataService: WeatherDataService;
  extendedModeStatus: BehaviorSubject<boolean>;
  

  weatherDataSubscription: Subscription;


  chosenbtn:number=3;
  timepickers: number[]=[1,3,7,14,21];

  constructor(weatherDataService: WeatherDataService) {
    this.weatherDataService = weatherDataService
    this.extendedModeStatus = new BehaviorSubject(false)
  
  }

  ngOnInit() {
    this.weatherDataSubscription=
      this.weatherDataService.getTemperatures(this.chosenbtn).subscribe((data) => {
      this.temperatureData = data;
      this.buildGraphs();
    });

  
  }

  onChange(event: MatSlideToggleChange){
    console.log(event);
    this.extendedModeStatus.next(event.checked)
  }
 
  onbtnChange(event:MatRadioChange){
    console.log(event);

    this.weatherDataSubscription=
      this.weatherDataService.getTemperatures(this.chosenbtn).subscribe((data) => {
      this.temperatureData = data;
      this.buildGraphs();
      console.log(data);   
    });
  }


  ngOnDestroy(){
    this.weatherDataSubscription.unsubscribe();

}

  buildGraphs() {
    var ctx = document.getElementById('temp');
    var temps = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.temperatureData.map(data => new Date(data.time).toLocaleString()),
        datasets: [{
          label: 'Temperatures in C°',
          data: this.temperatureData.map(data => data.degrees),
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


