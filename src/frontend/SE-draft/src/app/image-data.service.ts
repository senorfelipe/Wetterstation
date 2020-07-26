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
     // console.log([year, month, day].join('-'))
    return [year, month, day].join('-');
}

getrecentImages() {
  return this.http.get<ImageData[]>(this.apiUrl + 'images/recent/');
}


  getTodayImages() {
    let today=new Date;
    return this.http.get<ImageData[]>(this.apiUrl + 'images/?start='+this.formatDate(today));
  }
 

  getYesterdayImages(){
    let today=new Date;
    let yesterday=new Date();
    yesterday.setDate(today.getDate()-1)
   
    return this.http.get<ImageData[]>(this.apiUrl + 'images/?start='+this.formatDate(yesterday)+'&end='+this.formatDate(today));
  }

 getDateImages(date:Date){
  let end=new Date() 
  end.setDate(date.getDate()+1)
   
  return this.http.get<ImageData[]>(this.apiUrl+'images/?start='+this.formatDate(date)+'&end='+this.formatDate(end));

 }


}

export interface ImageData {
  id: Number,
  image: String,
  measurement_time: Date
}
