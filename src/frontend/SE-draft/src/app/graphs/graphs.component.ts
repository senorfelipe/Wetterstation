import { Component, OnInit, OnDestroy, OnChanges,ViewChild } from '@angular/core';

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
  lastHoursWind: WindData[] = [];
  extendedModeStatus: BehaviorSubject<boolean>;


  weatherDataSubscription: Subscription;


  chosenbtn: number = 1;
  timepickers: number[] = [1, 3, 7, 14, 21];
  startdateEvents: string[] = [];
  enddateEvents: string[] = [];


  recentTemp: Number;
  recentWindSpeed: Number;
  recentWindDir: Number;

  tempchart:Chart;
  windchart:Chart;
  charttempdata={
      labels: this.temperatureData.map(data => new Date(data.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})),
      datasets: [{
        label: 'Temperatur in C°',
        data: this.temperatureData.map(data => data.degrees),
        fill: true,
        backgroundColor: 
          'rgba(255, 99, 132, 0.2)',
        borderColor:
          'rgba(255, 99, 132, 1)',
        borderWidth: 0
      }]
    }
  
chartwindata={
    labels: this.windData.map(datawind => new Date(datawind.measure_time).toLocaleString()),
    datasets: [{
      label: 'Wind in m/s',
      data: this.windData.map(datawind => datawind.speed),
      fill: true,
      backgroundColor:
        'rgba(128, 255, 132, 0.2)'
      ,
      borderColor:
        'rgba(128, 255, 132, 1)',
      borderWidth: 0
    }]
}

  chartoptions={
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: false
        }
      }]
    }
  }

  breakpoint: number;

  constructor(weatherDataService: WeatherDataService) {
    this.weatherDataService = weatherDataService
    this.extendedModeStatus = new BehaviorSubject(false)

  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 640) ? 1 : 3;

    this.getRecentValues();
    this.updateGraphs(1);



  }



  ngOnDestroy() {
    this.weatherDataSubscription.unsubscribe();

  }


  getRecentValues() {
    this.weatherDataService.getWindData(1).subscribe((data) => {
      
      this.recentWindSpeed = data.map(data => data.speed)[data.length - 1];
      this.recentWindDir = data.map(data => data.direction)[data.length - 1];
      console.log(this.recentWindSpeed)
    });

    this.weatherDataSubscription =
      this.weatherDataService.getTemperatures(1).subscribe((data) => {
        this.recentTemp = data.map(data => data.degrees)[data.length - 1];
        console.log(data);
      });

    this.weatherDataService.getRecentWind().subscribe((data) => {
      this.lastHoursWind = data;
      this.windData = data;
      this.buildWindChart();
    });
  }


  updateGraphs(input) {
    this.weatherDataSubscription =
    this.weatherDataService.getTemperatures(input).subscribe((data) => {
      this.temperatureData = data;
      this.buildTempChart();
      
    });
    
  }

/**
 * Initialisiert die gefetchten Daten und generiert einen neuen Graphen 
 */
  buildTempChart(){
    if(this.tempchart!=undefined){
      this.tempchart.destroy();
    }

    this.charttempdata.labels=this.temperatureData.map(data => new Date(data.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}));
    this.charttempdata.datasets[0].data=this.temperatureData.map(data => data.degrees);
    let tempcanvas=document.getElementById('temp');
    console.log(this.charttempdata)
    this.tempchart=Chart.Line(tempcanvas,{
      data:this.charttempdata,
      options:this.chartoptions
    })
  }

  buildWindChart() {
  
    this.chartwindata.labels=this.windData.map(datawind => new Date(datawind.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}));
    this.chartwindata.datasets[0].data=this.windData.map(datawind => datawind.speed)
    let windcanvas=document.getElementById('wind');
    this.windchart=Chart.Line(windcanvas,{
      data:this.chartwindata,
      options:this.chartoptions
    })
  }

  /**
   * @param i Index des zu Rotierenden Windrichtungpfeils
   *  
   */

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
    let dirhours = this.windData.map(datawind => new Date(datawind.measure_time).toLocaleString([],{hour:'2-digit',minute:'2-digit'}));
    return dirhours[i];
  }

/**
 * 
 * @param event Event beim Wechsel zwischen "Erweiterten Modus" und den Radiobuttons
 */
  onChange(event: MatSlideToggleChange) {
    console.log(event);
    this.extendedModeStatus.next(event.checked)
  }

  /**
   * 
   * @param event Event beim Wechsel der Tagesanzahl des Graphen
   * Lädt die Graphen beim Wechsel der Anzahl der Tage neu.
   */
  onbtnChange(event: MatRadioChange) {
    this.updateGraphs(event.value);
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
/**
 * Neuer Datensatz wird requestet und der Temperaturgraph neu aufgebaut
 */
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
          this.buildTempChart();
        });

    }
  }


/** 
 * @param event Resize Event
* Handler for Resizing
*/
onResize(event) {
  this.breakpoint = (event.target.innerWidth <= 640) ? 1 : 3;
}


}


