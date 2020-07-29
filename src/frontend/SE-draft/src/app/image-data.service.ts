import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:8000/api/';
  private http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }
  today=new Date;
  


  formatDate(date: Date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
      console.log([year, month, day].join('-'))
    return [year, month, day].join('-');
}


  getTodayImages() {
    let today=new Date;
    let yesterday=this.today.getDate()-1;
    today.setDate(yesterday);
    return this.http.get<ImageData[]>(this.apiUrl + 'images/?start='+this.formatDate(today));
  }
 

  getrecentImages() {
    return this.http.get<ImageData[]>(this.apiUrl + 'images/recent/');
  }
 
  getYesterdayImages(){
    let today=new Date;
    let yesterday=today.getDate()-1;
    today.setDate(yesterday);
    return this.http.get<ImageData[]>(this.apiUrl + 'images/?start='+this.formatDate(this.today));
  }


}

export interface ImageData {
  id: Number,
  image: String,
  measurement_time: Date
}
