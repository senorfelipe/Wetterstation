import { Component, OnInit } from '@angular/core';
import {ImageData, ImageService} from "../image-data.service";
@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss'],



})
export class WebcamComponent implements OnInit {

  Images: ImageData[]=[];
  ImageService: ImageService;

  panelOpenState = false;

  constructor(ImageService: ImageService) {
    this.ImageService= ImageService

   }

  ngOnInit() {
    this.ImageService.getImages().subscribe((data) => {
    this.Images = data;
    console.log(this.Images);
  });
  }
  
  getImageLocation(){
    console.log(this.Images.map(data=>data.image));
    return this.Images.map(data=>data.image)
    
  }
  getImageDate(){
    console.log(this.Images.map(data=>data.time));
    return this.Images.map(data=>data.time)
  
  }
}

