import { Component, OnInit } from '@angular/core';
import { SolarData, AdminpanelDataService, BatteryData, VolumeData, RaspberryData } from "../adminpanel-data.service";
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Chart } from 'chart.js';


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

const add = (a, b) => a + b;
const logData: raspyActions[] = [];
const sensorData: sensorActions[] = [
  { sensor: "Temperatur", status: "OK" },
  { sensor: "Wind", status: "OK" },
  { sensor: "Spannung Raspberry", status: "OK" },
  { sensor: "Strom Raspberry", status: "OK" },
  { sensor: "Spannung Photovoltaik", status: "OK" },
  { sensor: "Strom Photovoltaik", status: "OK" },
  { sensor: "Leistungsaufnahme", status: "OK" },
  { sensor: "Ladestrom", status: "OK" }
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
  lastEvent: MatButtonToggleChange;

  startdateEvents: string[] = [];
  enddateEvents: string[] = [];

  //Gibt für [hidden] an, ob die Leistungsaufnahme ausgewählt wurde oder nicht
  volIsToggled: boolean = true;

  adminpanelDataSubscription: Subscription;


  chart: Chart;
  chartnames: String[] = ["Solarzelle", "Akku", "Raspberry", "Datenverbrauch"];
  chartlabels: String[] = ['Spannung in Volt', 'Stromstärke in A', 'Leistung in Watt', 'Datenmenge in Byte']

  chartdatasets = [
    [//Solarzelle
      {
        label: "Spannung",
        borderColor: "#013ADF",
        yAxisID: 'voltage',
        data: this.solarData.map(datasolar => datasolar.voltage),
        fill: false
      },
      {
        label: "Leistung",
        borderColor: "#FF0000",
        yAxisID: 'watt',
        data: [1, 2, 1.8],
        fill: false
      }],
    [
      {
        //Akku
        label: "Spannung",
        borderColor: "#013ADF",
        yAxisID: 'voltage',
        data: [],
        fill: false
      },
      {
        label: "Ladestrom",
        borderColor: "#FF0000",
        yAxisID: 'current',
        data: [],
        fill: false
      }
    ],
    [//Raspi
      {
        label: "Lastspannung",
        borderColor: "#013ADF",
        yAxisID: 'voltage',
        data: [1.8, 2, 0.9],//TODO
        fill: false
      },
      {
        label: "Lastleistung",
        borderColor: "#FF0000",
        yAxisID: 'watt',
        data: [1, 2, 1.8],//TODO
        fill: false
      }],
    [{
      label: "Datenmenge",
      borderColor: "#CE1A9E",
      yAxisID: 'volume',
      data: this.volumeData.map(datavolume => datavolume.image_size),
      fill: false
    }]
  ]

chartoptions={
  title: {
    display: true,
    text: '',
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
      }
    },
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
    },
    {
      scaleLabel: {
        display: true,
        labelString: 'Leistung in Watt'
      },
      id: 'watt',
      position: 'right',
      ticks: {
        beginAtZero: true
      }
    },
    {
      scaleLabel: {
        display: true,
        labelString: 'Datenmenge in Byte'
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

  constructor(adminpanelDataService: AdminpanelDataService) {
    this.adminpanelDataService = adminpanelDataService
    this.extendedModeStatus = new BehaviorSubject(false)
  }

  ngOnInit() {
    this.initData();
    console.log(this.chartdatasets)
    
  }

  diagramChange(event: MatButtonToggleChange) {
    this.lastEvent = event;
    if (event.value == "solar") {
      this.volIsToggled = true;
      this.solarChart();
    }
    else if (event.value == "battery") {
      this.volIsToggled = true;
      this.batteryChart();
    }
    else if (event.value == "raspberry") {
      this.volIsToggled = true;
      this.raspberryChart();
    }
    else if (event.value == "volume") {
      this.volIsToggled = false;
      this.volumeChart();
    }
 
  }
  initData() {
    var input = 4;
    var date = new Date();
    var firstMonthDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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
      this.adminpanelDataService.getVolumeDataFrame(firstMonthDay,lastMonthDay).subscribe((datavol) => {
        console.log(datavol)
        this.volumeData = datavol;
      });
  }
  updateChartLabels() {
    this.chartlabels
  }

  displayedLogColumns: string[] = ['date', 'name', 'action'];
  logTableData = logData;

  displayedSensorColumns: string[] = ['sensor', 'status'];
  sensorTableData = sensorData;

  solarChart() {

    this.getSolarDataSet();
    this.buildChart(this.chartdatasets[0], this.chartnames[0], this.solarData.map(data => new Date(data.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})))
  }

  batteryChart() {
    this.getBatteryDataSet()
    this.buildChart(this.chartdatasets[1], this.chartnames[1], this.batteryData.map(datesolar => new Date(datesolar.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})))
  }

  raspberryChart() {
    this.getRaspberryDataSet()
    this.buildChart(this.chartdatasets[2], this.chartnames[2], this.raspberryData.map(datesolar => new Date(datesolar.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})))
  }

  volumeChart() {
    this.getVolumeDataSet();
    this.buildChart(this.chartdatasets[3], this.chartnames[3], this.raspberryData.map(datesolar => new Date(datesolar.measure_time).toLocaleString([],{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})))
  }

  buildChart(data, diaName, dat) {
    if(this.chart!=undefined){
      this.chart.destroy();
    }
    let canvas = document.getElementById('elecChart');
    let dataSet = data;
    this.chartoptions.title.text=diaName
  this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dat,
        datasets: dataSet
      },
      options: this.chartoptions
    });
     
    
  }
  getSolarDataSet() {
    this.chartdatasets[0][0].data = this.solarData.map(datasolar => datasolar.voltage)
    console.log(this.chartdatasets[0][0].data)
    this.chartdatasets[0][1].data = [1, 2, 1.8]

  }

  getBatteryDataSet() {
    this.chartdatasets[1][0].data = this.batteryData.map(data=> data.voltage);//TODO
    this.chartdatasets[1][1].data = this.batteryData.map(data=> data.current);//TODO

  }

  getRaspberryDataSet() {
    this.chartdatasets[2][0].data = [1.8, 2, 0.9];//TODO
    this.chartdatasets[2][1].data = [1, 2, 1.8];//TODO
  }

  getVolumeDataSet() {
    this.chartdatasets[3][0].data=this.volumeData.map(datavolume => datavolume.image_size);
    document.getElementById("volSum").innerHTML = this.chartdatasets[3][0].data.reduce(add).toString(); //Summe der einzelnen Werte im Zeitraum
    console.log(this.chartdatasets)
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
      if(this.lastEvent != undefined) this.diagramChange(this.lastEvent);
      else{ this.solarChart() }
    }
  }
}
