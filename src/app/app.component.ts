import { Component, OnInit } from '@angular/core';
import { GalleryService } from './gallery.service';

import {Router} from "@angular/router";
import {CartService} from "./cart.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'build-app';

  constructor(
      private galleryService: GalleryService,
      private router: Router,
      private cartService : CartService
  ) { }

  url: any;
  galleryId: Number;

  ngOnInit() {
    this.url = window.location.pathname.split('/');
    let url_password = this.url[2];
    let typeGallery = this.url[3];

    console.log('this is called first app component');
    this.cartService.getAllProducts().subscribe((products)=>{
      this.cartService.productsRef.next(products);
    });
    
    this.cartService.watchSubTotalCart();

    this.galleryService.subGalleryPass.subscribe((newPass)=>{
      if(newPass !== ''){
        this.galleryService.changeSubGallery(newPass);
      }
    });
    if(typeGallery !== 'categories'){
      this.galleryService.subGalleryPass.next(url_password);
    }
  }
}
