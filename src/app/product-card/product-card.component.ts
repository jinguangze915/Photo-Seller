import { Component, OnInit ,Injectable, Inject, OnChanges, ViewChild, Input, Output, EventEmitter, SimpleChange, Renderer2} from '@angular/core';
import {GalleryService} from "../gallery.service";
import { ActivatedRoute } from '@angular/router';

import {LocalStorage} from "ngx-store";

import {Gallery, GalleryItem, ImageItem, ThumbnailsPosition, ImageSize, GalleryConfig} from '@ngx-gallery/core';
import {Lightbox} from "@ngx-gallery/lightbox";

import { DOCUMENT } from '@angular/common';
// import { NgxSmartModalService } from 'ngx-smart-modal';
//
// import { CropperComponent } from 'angular-cropperjs';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product: any;

  @Output() changeImg = new EventEmitter<any>();
  @Output() changeSize = new EventEmitter<any>();
  @Output() changeCropZone = new EventEmitter<any>();

  @LocalStorage() currentImg: any;

  items: GalleryItem[];

  config: GalleryConfig = {
    loadingMode: "indeterminate"
  };
  lightboxRef;

  galleryId: Number;
  priceList: any;

  subgallery;

  myOpenVar;
  dataCrop: any = {};

  constructor(
      public lightbox: Lightbox,
      public galleryPlugin: Gallery,
      private galleryService: GalleryService,
      @Inject(DOCUMENT) private document: Document,
      private renderer: Renderer2,
      private route: ActivatedRoute) { }

  ngOnInit() {

    this.lightboxRef = this.galleryPlugin.ref('lightbox');

    if (this.product.sizes != undefined) {
      if (this.product.sizes.length === 1) {
        this.product.size.myOpenVar = false
      }
      if(this.product.crop_info != null){
        this.dataCrop.top = (this.product.crop_info.y/this.product.crop_info.height_original)*100 + '%';
        this.dataCrop.height = (this.product.crop_info.height/this.product.crop_info.height_original)*100 + '%';
      }
      /*else{
        let heightCrop = +(this.product.size_original.width * this.product.size.height /  this.product.size.width).toFixed(2);
        let topY = +((this.product.size_original.height - heightCrop) / 2).toFixed(2);

        this.dataCrop.top = (topY/this.product.size_original.height)*100 + '%';
        this.dataCrop.height = (heightCrop/this.product.size_original.height)*100 + '%';
      }*/
    }
  }

  changeImage(e, img){
    let galleryItems = this.galleryService.subGallerySource.getValue().data;

    this.items = galleryItems.map(item =>
      new ImageItem({
        src: item.image + '?_gallery',
        thumb: item.image
      })
    );
    this.lightboxRef.load(this.items);
    this.lightbox.open(img.index);
    this.addBtnCart(img.image);
  }

  addBtnCart(img){
    setTimeout(() => {
      let elementsWrap = this.document.querySelector('gallery-slider');
      let elements = elementsWrap.getElementsByTagName('gallery-item');

      for (let i = 0; i < elements.length; i++) {
        let blk = elements[i];
        let blkBtn = this.renderer.createElement('div');
        this.renderer.addClass(blkBtn, 'gallery-img-btn');
       this.renderer.setProperty(blkBtn, 'innerHTML', `<a [routerLink]="" data-index="${i}" 
                                                                    data-img="${this.items[i].data.src}" class='gallery-img-lnk btn-gray'>Choose</a>`);
        this.renderer.appendChild(blk, blkBtn);

        this.renderer.listen(blkBtn, 'click', (event) => {
          event.preventDefault();
          let curPreview;
          let index;
          if(event.target.className == 'gallery-img-lnk btn-gray'){
            curPreview = event.target.getAttribute('data-img');
            index = Number(event.target.getAttribute('data-index'));
          }else{
            curPreview = event.target.parentNode.getAttribute('data-img');
            index = Number(event.target.parentNode.getAttribute('data-index'));
          }

          this.changeImg.emit({
            image: curPreview,
            index: index,
           });

          this.lightbox.close();
        });
      }
    }, 200);
  }
  updateSize(chosenSize){
    this.changeSize.emit(chosenSize);
  }
  showModalCrop(e, img){
    this.changeCropZone.emit({
      imageForCrop: img.image,
      imageSize: img.size
    });

  }
}
