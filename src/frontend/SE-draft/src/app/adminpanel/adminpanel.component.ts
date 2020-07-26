import { Component, OnInit } from '@angular/core';
import { SolarData, AdminpanelDataService, BatteryData } from "../adminpanel-data.service";
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { BehaviorSubject, Subscription } from 'rxjs';
import {Chart} from 'chart.js';

var dates = ['25.05.2020', '26.05.2020', '27.05.2020']

export interface raspyActions {
  date: string;
  name: string;
  action: string;
}

export interface sensorActions {
  sensor: string;
  status: string;
}

const logData: raspyActions[] = [];
const sensorData: sensorActions[] =[
  {sensor: "Temperatur",status: "OK"},
  {sensor: "Wind",status: "OK"},
  {sensor: "Spannung Raspberry",status: "OK"},
  {sensor: "Strom Raspberry",status: "OK"},
  {sensor: "Spannung Photovoltaik",status: "OK"},
  {sensor: "Strom Photovoltaik",status: "OK"},
  {sensor: "Leistungsaufnahme",status: "OK"},
  {sensor: "Ladestrom",status: "OK"}
];

@Component({
  selector: 'app-adminpanel',
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.scss']
})

export class AdminpanelComponent implements OnInit {

  adminpanelDataService: AdminpanelDataService;
  solarData: SolarData[] = [];
  batteryData: BatteryData[] = [];
  extendedModeStatus: BehaviorSubject<boolean>;

  //Gibt für [hidden] an, ob die Leistungsaufnahme ausgewählt wurde oder nicht
  elecIsToggled:boolean = false;
  volIsToggled:boolean = true;

  adminpanelDataSubscription: Subscription;

  constructor(adminpanelDataService: AdminpanelDataService) {
    this.adminpanelDataService = adminpanelDataService
    this.extendedModeStatus = new BehaviorSubject(false)
  }

  ngOnInit(){
    this.updateChart();
  }

  diagramChange(event: MatButtonToggleChange) {
    if(event.value == "power"){
      this.elecIsToggled = true;
      this.volIsToggled = true;
      this.powerChart();
    }
    else if(event.value == "charge"){
      this.elecIsToggled = true;
      this.volIsToggled = true;
      this.chargeChart();
    }
    else if(event.value == "volume"){
      this.elecIsToggled = true;
      this.volIsToggled = false;
      this.volumeChart();
    }
    else{
      this.updateChart();
      this.volIsToggled = true;
      this.elecIsToggled = false;
    }
  }

  updateChart(){
    var input=3;
    this.adminpanelDataSubscription =
      this.adminpanelDataService.getSolarData(input).subscribe((datasolar) => {
        this.solarData = datasolar;
      });

    this.adminpanelDataSubscription =
      this.adminpanelDataService.getBatteryData(input).subscribe((databattery) => {
        this.batteryData = databattery;
        this.buildChart();
      });
  }

  displayedLogColumns: string[] = ['date','name','action'];
  logTableData = logData;

  displayedSensorColumns: string[] = ['sensor','status'];
  sensorTableData = sensorData;

  buildChart() {
    let ctx = document.getElementById('elecChart');
    let dataSet = this.getDataSet();
    console.log(this.batteryData.map(datebattery => datebattery.measure_time));
    let volts = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.batteryData.map(datebattery => new Date(datebattery.measure_time).toLocaleString()),
        datasets: dataSet
      },
      options: {
        title: {
          display: true,
          text: 'Energieverbrauch',
          fontSize: 20
        },
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0,
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
              labelString: 'Stromstärke in A'
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

  powerChart(){
    this.buildPowerChargeChart(this.getPowerDataSet(),"Leistungsuafnahme","Leistung in Watt");
  }

  chargeChart(){
    this.buildPowerChargeChart(this.getChargeDataSet(),"Ladestrom","Strom in A");
  }

  volumeChart(){
    this.buildPowerChargeChart(this.getVolumeDataSet(),"Datenverbrauch","Datenmenge in MByte")
  }

  buildPowerChargeChart(dataset,chartText,axisLabel) {
    let ctx = document.getElementById('elecChart');
    let dataSet = dataset;
    let volts = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: dataSet
      },
      options: {
        title: {
          display: true,
          text: chartText,
          fontSize: 20
        },
        animation: {
          duration: 0, // general animation time
        },
        hover: {
          animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0,
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: axisLabel
            },
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  getPowerDataSet(){
    var powerSet = [];
    let newData = {
      label:"Leistungsaufnahme",
      borderColor: "#013ADF",
      data: [10,23,18],
      fill: false
    }
    powerSet.push(newData);
    return(powerSet);
  }

  getChargeDataSet(){
    var chargeSet = [];
    let newData = {
      label:"Ladestrom",
      borderColor: "#FF4500",
      data: [1.8,1,0.9],
      fill: false
    }
    chargeSet.push(newData);
    return(chargeSet);
  }

  getVolumeDataSet(){
    var volumeSet = [];
    let newData = {
      label:"Datenmenge",
      borderColor: "#CE1A9E",
      data: [0.8,1.1,1],
      fill: false
    }
    volumeSet.push(newData);
    return(volumeSet);
  }
}
