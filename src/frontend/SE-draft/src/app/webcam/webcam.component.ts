import { Component, OnInit } from "@angular/core";
import { ImageData, ImageService } from "../image-data.service";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';
import { GraphsComponent } from '../graphs/graphs.component';
import 'hammerjs';

import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';



declare var myFunction;
declare var myTodayFunction;
declare var myLastWeekFunction;
declare var myOlderFunction;

@Component({
  selector: "app-webcam",
  templateUrl: "./webcam.component.html",
  styleUrls: ["./webcam.component.scss"],
})
export class WebcamComponent implements OnInit {

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];


  Images: ImageData[] = [];
  ImageService: ImageService;
  destroyed: Subject<boolean>;
  panelOpenState = false;

  CallMyFunction() {
    myFunction();
    myTodayFunction();
    myLastWeekFunction();
    myOlderFunction();
    
  }

  constructor(ImageService: ImageService) {
    this.ImageService = ImageService;
  }

  ngOnInit() {
    this.ImageService.getImages()
     
      .subscribe((data) => {
        this.Images = data;
        console.log(this.Images);
        
      });

      this.galleryOptions = [
        {
            width: '600px',
            height: '400px',
            thumbnailsColumns: 4,
            imageAnimation: NgxGalleryAnimation.Slide
        },
        // max-width 800
        {
            breakpoint: 800,
            width: '100%',
            height: '600px',
            imagePercent: 80,
            thumbnailsPercent: 20,
            thumbnailsMargin: 20,
            thumbnailMargin: 20
        },
        // max-width 400
        {
            breakpoint: 400,
            preview: false
        }
    ];


  }

  ngOnDestroy() {
    this.destroyed.next(true);
  }

  getImageLocation() {
    console.log(this.Images.map((data) => data.image));
    return this.Images.map((data) => data.image);
  }

  getImageDate() {
    console.log(this.Images.map((data) => data.measurement_time));
    return this.Images.map((data) => data.measurement_time);
  }



  
}

export class NgbdDropdownBasic {
  
}
