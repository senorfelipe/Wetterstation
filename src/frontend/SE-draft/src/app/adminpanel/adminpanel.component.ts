import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { SolarData, WeatherDataService, BatteryData } from "../weather-data.service";
import { BehaviorSubject, Subscription } from 'rxjs';
import {Chart} from 'chart.js';

var dates = ['25.05.2020', '26.05.2020', '27.05.2020']

export interface raspyActions {
  date: string;
  name: string;
  action: string;
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

  weatherDataService: WeatherDataService;
  solarData: SolarData[] = [];
  batteryData: BatteryData[] = [];
  extendedModeStatus: BehaviorSubject<boolean>;

  weatherDataSubscription: Subscription;

  constructor(weatherDataService: WeatherDataService) {
    this.weatherDataService = weatherDataService
    this.extendedModeStatus = new BehaviorSubject(false)
  }

  ngOnInit(){
    this.updateChart(1);
    //this.updateChart(1);
  }

  updateChart(input){
    this.weatherDataSubscription =
      this.weatherDataService.getSolarData(input).subscribe((datasolar) => {
        this.solarData = datasolar;
      });

    this.weatherDataSubscription =
      this.weatherDataService.getBatteryData(input).subscribe((databattery) => {
        this.batteryData = databattery;
        this.buildChart();
      });
  }

  displayedColumns: string[] = ['date','name','action'];
  tableData = adminData;

  buildChart() {
    let ctx = document.getElementById('elecChart');
    let dataSet = this.getDataSet();
    let volts = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: dataSet
      },
      options: {
        title: {
          display: true,
          text: 'Energieverbrauch',
          fontSize: 20
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Spannung in Volt'
            },
            id: 'voltage',
            position: 'left',
            ticks: {
              beginAtZero: true
            }},
            {
            scaleLabel: {
              display: true,
              labelString: 'Stromstärke in mA'
            },
            id: 'current',
            position: 'right',
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  getDataSet(){
    var dataSet = [];

    let accCur = <HTMLInputElement> document.getElementById("accCur");
    if(accCur.checked){
      let newData = {
        label:"Stromverbrauch Akku",
        borderColor: "#FFBF00",
        yAxisID: 'current',
        data: this.batteryData.map(databattery => databattery.current),
        fill: false
      }
      dataSet.push(newData);
    }

    let accVol = <HTMLInputElement> document.getElementById("accVol");
    if(accVol.checked){
      let newData = {
        label:"Spannung Akku",
        borderColor: "#00BFFF",
        yAxisID: 'voltage',
        data: this.batteryData.map(databattery => databattery.voltage),
        fill: false
      }
      dataSet.push(newData);
    }

    let solCur = <HTMLInputElement> document.getElementById("solCur");
    if(solCur.checked){
      let newData = {
        label:"Stromverbrauch Solarzelle",
        borderColor: "#FF0000",
        yAxisID: 'current',
        data: this.solarData.map(datasolar => datasolar.current),
        fill: false
      }
      dataSet.push(newData);
    }

    let solVol = <HTMLInputElement> document.getElementById("solVol");
    if(solVol.checked){
      let newData = {
        label:"Spannung Solarzelle",
        borderColor: "#013ADF",
        yAxisID: 'voltage',
        data: this.solarData.map(datasolar => datasolar.voltage),
        fill: false
      }
      dataSet.push(newData);
    }
    return(dataSet);
  }
}
