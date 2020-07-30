import { Component, OnInit } from '@angular/core';
import { SolarData, AdminpanelDataService, BatteryData, VolumeData, RaspberryData } from "../adminpanel-data.service";
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
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
  raspberryData: RaspberryData[] = [];
  volumeData: VolumeData[] = [];
  extendedModeStatus: BehaviorSubject<boolean>;

  startdateEvents: string[] = [];
  enddateEvents: string[] = [];

  //Gibt für [hidden] an, ob die Leistungsaufnahme ausgewählt wurde oder nicht
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
    if(event.value == "solar"){
      this.volIsToggled = true;
      this.solarChart();
    }
    else if(event.value == "battery"){
      this.volIsToggled = true;
      this.batteryChart();
    }
    else if(event.value == "raspberry"){
      this.volIsToggled = true;
      this.raspberryChart();
    }
    else if(event.value == "volume"){
      this.volIsToggled = false;
      this.volumeChart();
    }
    else{
      this.updateChart();
      this.volIsToggled = true;
    }
  }

  updateChart(){
    var input=4;
    this.adminpanelDataSubscription =
      this.adminpanelDataService.getSolarData(input).subscribe((datasolar) => {
        this.solarData = datasolar;
        this.solarChart();
      });
    
    this.adminpanelDataSubscription =
      this.adminpanelDataService.getBatteryData(input).subscribe((databattery) => {
        this.batteryData = databattery;
      });

    this.adminpanelDataSubscription =
      this.adminpanelDataService.getRaspberryData(input).subscribe((datarasp) => {
        this.raspberryData = datarasp;
      });

    this.adminpanelDataSubscription =
      this.adminpanelDataService.getVolumeData(input).subscribe((datasolar) => {
        this.volumeData = datasolar;
      });
  }

  displayedLogColumns: string[] = ['date','name','action'];
  logTableData = logData;

  displayedSensorColumns: string[] = ['sensor','status'];
  sensorTableData = sensorData;

  solarChart(){
    this.buildChart(this.getSolarDataSet(),"Solarzelle",this.solarData.map(datesolar => new Date(datesolar.measure_time).toLocaleString()))
  }

  batteryChart(){
    this.buildChart(this.getBatteryDataSet(),"Akku",this.solarData.map(datesolar => new Date(datesolar.measure_time).toLocaleString()))
  }

  raspberryChart(){
    this.buildChart(this.getRaspberryDataSet(),"Raspberry",this.solarData.map(datesolar => new Date(datesolar.measure_time).toLocaleString()))
  }

  volumeChart(){
    this.buildChart(this.getVolumeDataSet(),"Datenverbrauch",this.solarData.map(datesolar => new Date(datesolar.measure_time).toLocaleString()))
  }

  buildChart(data,diaName,dat) {
    let ctx = document.getElementById('elecChart');
    let dataSet = data;
    let volts = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dat,
        datasets: dataSet
      },
      options: {
        title: {
          display: true,
          text: diaName,
          fontSize: 20
        },
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0, 
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
              labelString: 'Stromstärke in mA'
            },
            id: 'current',
            position: 'right',
            ticks: {
              beginAtZero: true
            }},
            {
            scaleLabel: {
              display: true,
              labelString: "Leistung in Watt"
            },
            id: 'watt',
            position: 'right',
            ticks: {
              beginAtZero: true
            }},
            {
            scaleLabel: {
              display: true,
              labelString: "Datenmenge in Byte"
            },
            id: 'volume',
            position: 'left',
            ticks: {
              beginAtZero: true
            }
            }
          ]
        }
      }
    });
  }

  getSolarDataSet(){
    var solarSet = [];
    let newData = {
      label:"Spannung",
      borderColor: "#013ADF",
      yAxisID: 'voltage',
      data: this.solarData.map(datasolar => datasolar.voltage),
      fill: false
    }
    solarSet.push(newData);

    newData = {
      label:"Leistung",
      borderColor: "#FF0000",
      yAxisID: 'watt',
      data: [1,2,1.8],
      fill: false
    }
    solarSet.push(newData);

    return(solarSet);
  }

  getBatteryDataSet(){
    var batterySet = [];
    let newData = {
      label:"Spannung",
      borderColor: "#013ADF",
      yAxisID: 'voltage',
      data: [1.8,2,0.9],
      fill: false
    }
    batterySet.push(newData);

    newData = {
      label:"Ladestrom",
      borderColor: "#FF0000",
      yAxisID: 'current',
      data: [1,2,1.8],
      fill: false
    }
    batterySet.push(newData);

    return(batterySet);
  }

  getRaspberryDataSet(){
    var raspSet = [];
    let newData = {
      label:"Lastspannung",
      borderColor: "#013ADF",
      yAxisID: 'voltage',
      data: [1.8,2,0.9],
      fill: false
    }
    raspSet.push(newData);

    newData = {
      label:"Lastleistung",
      borderColor: "#FF0000",
      yAxisID: 'watt',
      data: [1,2,1.8],
      fill: false
    }
    raspSet.push(newData);

    return(raspSet);
  }

  getVolumeDataSet(){
    var volumeSet = [];
    let newData = {
      label:"Datenmenge",
      borderColor: "#CE1A9E",
      yAxisID: 'volume',
      data: this.volumeData.map(datavolume => datavolume.image_size),
      fill: false
    }
    volumeSet.push(newData);
    return(volumeSet);
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
    console.log(enddate);


    if (enddate > startdate) {
      this.adminpanelDataSubscription =
        this.adminpanelDataService.getSolarDataFrame(startdate, enddate).subscribe((data) => {
          this.solarData = data;
        });

      this.adminpanelDataSubscription =
        this.adminpanelDataService.getBatteryDataFrame(startdate, enddate).subscribe((data) => {
          this.batteryData = data;
        });

      this.adminpanelDataSubscription =
        this.adminpanelDataService.getRaspberryDataFrame(startdate, enddate).subscribe((data) => {
          this.raspberryData = data;
        });

      this.adminpanelDataSubscription =
        this.adminpanelDataService.getVolumeDataFrame(startdate, enddate).subscribe((data) => {
          this.volumeData = data;
        });
    }
  }
}
