import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
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

  constructor(public dialog: MatDialog) {}

  ipaddress:String;

  ngOnInit(){
    this.updateChart();
  }

  displayedColumns: string[] = ['date','name','action'];
  tableData = adminData;

  updateChart() {
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

  /**
  * Hier werden wird das Datenset, welches die Werte für die updateChart()-Funktion enthält, bearbeitet
  * Das Datenset ist zunächst leer, und es wird für jede Checkbox geschaut, ob diese checked ist.
  * Ist sie checked, so wird ein Objekt mit entsprechenden Eigenschaften erzeugt und in das Datenset gepackt (dataSet.push(newData))
  * Dabei ist das data-Attribut jedes newData-Objektes ein Array mit Werten (Spannung bzw. Stromstärke), welche aus der DB gelesen werden müssen
  * Am Ende wird das Datenset an die updateChart()-Funktion zurückgegeben und die Graphen werden dort gezeichnet.
  * Die Datumsangaben laufen noch getrennt von den Werten.
  */
  getDataSet(){

    var curAcc = [2.5,4,2];
    var curSol = [5,7,3];
    var volAcc = [20,35,17];
    var volSol = [15,28,23];

    var dataSet = [];

    let accCur = <HTMLInputElement> document.getElementById("accCur");
    if(accCur.checked){
      let newData = {
        label:"Stromverbrauch Akku",
        borderColor: "#FFBF00",
        yAxisID: 'current',
        data: curAcc,
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
        data: volAcc,
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
        data: curSol,
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
        data: volSol,
        fill: false
      }
      dataSet.push(newData);
    }
    return(dataSet);
  }
}
