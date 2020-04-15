import { Component, OnInit } from '@angular/core';
import {CartService} from "../cart.service";
import { ActivatedRoute } from '@angular/router';
import {GalleryService} from "../gallery.service";
import { ArrayType } from '@angular/compiler';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  cartTotal: number = 0;
  userIdSubGallery;
  productType;
  userId;
  prodAry;

  priceList: any;
  withoutPackagesInCart: Boolean = false;
  onlyPackagesInCart: Boolean = false;

  constructor(
    private galleryService: GalleryService,
    private cartService : CartService,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.userIdSubGallery = this.route.snapshot.params['id'];
    this.userId = this.route.snapshot.params['id'] + (this.route.snapshot.params['galleryId'] ? ('/' + this.route.snapshot.params['galleryId']) : '');

    this.cartService.subTotalCart.subscribe((summ)=>{
      this.cartTotal = summ;
    });

    this.cartService.productsRef.subscribe((products)=> {
      // let indexPackage = Object.values(products).findIndex((obj:any)=> {
      //   return obj.type == 'package';
      // });
      
      let indexPackage = Object.values(products).findIndex((obj: any) => {
        if (this.userId == obj.sub_gallery_password && obj.type == 'package')
        return true;
      });
      
      let currentGalleryProducts = 0;
      this.prodAry = Object.values(products);
      if (this.prodAry.length > 0) {
        for (const x in this.prodAry) {
          if (this.userId == this.prodAry[x].sub_gallery_password) {
            currentGalleryProducts++;
          }
        }
      }

      this.withoutPackagesInCart =  indexPackage === -1 ;
      // if (Object.values(products).length <= 1) {
      //   this.onlyPackagesInCart = true;
      // }

      if (currentGalleryProducts <= 1) {
        this.onlyPackagesInCart = true;
      }

    });

    this.galleryService.priceList.subscribe((priceList)=>{
      this.priceList = priceList;
      this.onlyPackagesInCart ? this.cartService.productType.next('') : this.cartService.productType.next('addon');
      this.productType = this.cartService.productType.getValue();
    });

  }
}
