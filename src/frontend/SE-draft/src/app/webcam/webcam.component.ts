import { Component, OnInit } from "@angular/core";
import { ImageData, ImageService } from "../image-data.service";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MatDialog } from '@angular/material/dialog';

import { Gallery, GalleryItem, ImageItem } from '@ngx-gallery/core';
import { Lightbox } from '@ngx-gallery/lightbox';

import 'hammerjs';


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
  items: GalleryItem[];
  show = false;


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

  constructor(ImageService: ImageService,public gallery: Gallery, public lightbox: Lightbox) {
    this.ImageService = ImageService;
  }

  ngOnInit() {
    
    this.ImageService.getImages()
     
      .subscribe((data) => {
        this.Images = data;
        console.log(this.Images);
        this.items=this.Images.map(item => {
          return new ImageItem({src:item.image})
          
        });
      });

 
      // This is for Lightbox example
      this.gallery.ref('lightbox', {imageSize: 'cover', loadingStrategy: 'lazy', thumbPosition: 'top'}).load(this.items);
    }
  
    openLightbox() {
      this.lightbox.open(0, 'lightbox');
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
