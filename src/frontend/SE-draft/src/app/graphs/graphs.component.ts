import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';

import { Chart } from 'chart.js';
import { TemperatureData, WeatherDataService, WindData } from "../weather-data.service";
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange, MatRadioButton } from '@angular/material/radio';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';



@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit, OnDestroy {
  weatherDataService: WeatherDataService;
  temperatureData: TemperatureData[] = [];
  windData: WindData[] = [];
  extendedModeStatus: BehaviorSubject<boolean>;



  weatherDataSubscription: Subscription;


  chosenbtn: number = 1;
  timepickers: number[] = [1, 3, 7, 14, 21];

  recentTemp: Number;
  recentWindSpeed: Number;
  recentWindDir: Number;

  hourdata: Number[] = [];
  startdateEvents: string[] = [];
  enddateEvents: string[] = [];


  constructor(weatherDataService: WeatherDataService) {
    this.weatherDataService = weatherDataService
    this.extendedModeStatus = new BehaviorSubject(false)

  }

  ngOnInit() {
    this.updateGraphs(1);
  }


  updateGraphs(input) {
    this.weatherDataSubscription =
      this.weatherDataService.getTemperatures(input).subscribe((data) => {
        this.temperatureData = data;
        this.recentTemp = this.temperatureData.map(data => data.degrees)[data.length - 1];
      });

    this.weatherDataSubscription =
      this.weatherDataService.getWindData(input).subscribe((datawind) => {
        this.windData = datawind;
        this.recentWindSpeed = this.windData.map(datawind => datawind.speed)[this.windData.length - 1];
        this.recentWindDir = this.windData.map(datawind => datawind.direction)[this.windData.length - 1];
        console.log(this.windData);
        this.buildGraphs();

      });

  }

  onChange(event: MatSlideToggleChange) {
    console.log(event);
    this.extendedModeStatus.next(event.checked)
  }

  onbtnChange(event: MatRadioChange) {

    this.updateGraphs(event.value);
  }

  ngOnDestroy() {
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
        labels: this.windData.map(datawind => new Date(datawind.time).toLocaleString()),
        datasets: [{
          label: 'Windspeed in m/s',
          data: this.windData.map(datawind => datawind.speed),
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

  onImageLoad(i) {

    var data = this.windData.map(data => data.direction);



    var img = document.getElementById(i);
    img.style.transform = 'rotate(' + data[i] + 'deg)';

  }

  rotateDirCardArrow(angle, id) {
    var img = document.getElementById(id);
    img.style.transform = 'rotate(' + angle + 'deg)';

  }
  transformDirectionDates(i) {
    let dirhours = this.windData.map(datawind => new Date(datawind.time).getHours().toLocaleString());
    return dirhours[i];
  }



  /*Eventhandles for Timeframe */
  addStartEvent(event: MatDatepickerInputEvent<Date>) {
    this.startdateEvents.push(`${event.value}`);
    console.log(this.startdateEvents)

  }

  addEndEvent(event: MatDatepickerInputEvent<Date>) {
    this.enddateEvents.push(`${event.value}`);
    console.log(this.enddateEvents)

  }

  applyTimeframe() {
    let startstring = this.startdateEvents[this.startdateEvents.length - 1]
    let startdate = new Date(startstring);
    console.log(startdate);

    let endstring = this.enddateEvents[this.enddateEvents.length - 1]
    let enddate = new Date(endstring);


    if (enddate > startdate) {
      this.weatherDataSubscription =
        this.weatherDataService.getTemperaturesDataFrame(startdate, enddate).subscribe((data) => {
          this.temperatureData = data;
        });

      this.weatherDataSubscription =
        this.weatherDataService.getWindDataFrame(startdate, enddate).subscribe((datawind) => {
          this.windData = datawind;
          this.buildGraphs();
        });
    }
  }
}


