import {Component, QueryList, OnInit,Renderer2, AfterViewInit, ViewChildren} from '@angular/core';
import {LocalStorage, SharedStorage} from "ngx-store";
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HttpClient } from '@angular/common/http';

//modal
import { NgxSmartModalService } from 'ngx-smart-modal';
import {GalleryService} from "../gallery.service";
import {CartService} from "../cart.service";

import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss']
})

export class PackagesComponent implements OnInit {
  @LocalStorage() currentImg: any;
  @LocalStorage() cartData: any;

  userId;
  chosenProduct: any;
  galleryId: Number;
  priceList: any;
  withoutPackagesInCart: Boolean = false;
  subgallery: any;

  error = '';
  formCode: FormGroup;
  submittedCode = false;
  formData: any;
  invalidCode = /^[-+]?[0-9]+$/;
  addLoader: boolean;
  idSubGallery;
  deadlineFlage = 0;

  @ViewChildren('heightBlk') elem:QueryList<any>;

  constructor(
      public ngxSmartModalService: NgxSmartModalService,
      private route: ActivatedRoute,
      private router: Router,
      private renderer: Renderer2,
      private galleryService: GalleryService,
      private cartService : CartService,
      private http: HttpClient
  ) { }

  ngOnInit() {

    this.scrollToTop();
    this.userId =  this.route.snapshot.params['id'] + (this.route.snapshot.params['galleryId'] ? ('/' + this.route.snapshot.params['galleryId']) : '');
    this.cartService.productsRef.subscribe((products)=> {
      let indexPackage = Object.values(products).findIndex((obj:any)=> {
        if (this.userId == obj.sub_gallery_password && obj.type == 'package')
          return true;
      });

      this.withoutPackagesInCart =  indexPackage === -1 ;
    });

    this.galleryService.priceList.subscribe((priceList)=>{
      this.priceList = priceList;
      console.log("priceList", priceList.products);
      for (let x in priceList.products) {
        this.deadlineFlage ++;
      }
      console.log(this.deadlineFlage);
      this.withoutPackagesInCart ? this.cartService.productType.next('') : this.cartService.productType.next('addon');
    });

    this.formCode = new FormGroup({
      'code': new FormControl(null, [Validators.required, Validators.nullValidator])
    });

  }

  get ifEmailErrors() { return this.formCode.controls; }

  onSubmitEmail() {
    this.submittedCode = true;
    /**
     * if form invalid then don't send
     */
    if (this.formCode.invalid) {
      return;
    }

    this.formData = this.formCode.value;

    if (!this.formData.code.match(this.invalidCode)) {
      return;
    }

    this.cartService.recode(this.formData.code).subscribe((data :any)=> {
      if (data.status === 'success') {
        this.router.navigate(['/app/' + data.redirect]);
      }
    });
  }

  scrollToTop(){
    try{
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  /**
   * set description product  in modal
   *
   * @param product {Object}
   */
  openModalDescription(product){
    this.ngxSmartModalService.resetModalData('modalDescription');
    this.ngxSmartModalService.setModalData(product, 'modalDescription');
    this.ngxSmartModalService.getModal('modalDescription').open();
  }

  /**
   * add product to cart with type product
   *
   * @param productSelected
   */
  addToCart(productSelected){
    console.log("selected product", productSelected.products);
    //add gallery service data
    let url = window.location.pathname.split('/');
    let url_password = url[2];
    let currentsubGallery = null;
    this.galleryService.changeSubGallery(url_password);
    this.galleryService.subGallerySource.subscribe((subGallery) => {
      currentsubGallery = subGallery;
    });
    //end add gallery service data
    if(productSelected.products !== undefined ){
      let productsInPackage = productSelected.products.map((product)=> {
          return {
            crop_info: product.sizes ? this.cartService.getCropInfoDefault(this.currentImg.sizeOriginal, product.sizes[0]) : null,
            type: 'product',
            sub_gallery_password:  this.route.snapshot.params['galleryId'] ? this.route.snapshot.params['galleryId']: this.route.snapshot.params['id'],
            id: product.id,
            name: product.name,
            image: this.currentImg.image,
            index: this.currentImg.index,
            image_id: this.currentImg.imageId,
            size: product.sizes ? product.sizes[0] : '',
            sizes: product.sizes,
            size_original: this.currentImg.sizeOriginal,
            poses: product.limit_poses,
            sub_gallery_id: this.cartData,
            product_type: product.type
          };
      });
      this.chosenProduct = {
        sub_gallery_password:  this.route.snapshot.params['galleryId'] ? this.route.snapshot.params['galleryId']: this.route.snapshot.params['id'],
        type: 'package',
        id: productSelected.id,
        name: productSelected.name,
        price: productSelected.price,
        products: productsInPackage,
        quantity: 1,
        poses: productSelected.limit_poses,
        sub_gallery_id: this.cartData,
        sub_gallery_data: currentsubGallery
      }
    }
    else{
      this.chosenProduct = {
        type:'product',
        crop_info: productSelected.sizes ? this.cartService.getCropInfoDefault(this.currentImg.sizeOriginal, productSelected.sizes[0]) : null,
        sub_gallery_password:  this.route.snapshot.params['galleryId'] ? this.route.snapshot.params['galleryId']: this.route.snapshot.params['id'],
        id: productSelected.id,
        name: productSelected.name,
        price: productSelected.price,
        image: this.currentImg.image,
        image_id: this.currentImg.imageId,
        index: this.currentImg.index,
        size_original: this.currentImg.sizeOriginal,
        size: productSelected.sizes ? productSelected.sizes[0] : '',
        sizes: productSelected.sizes,
        quantity: 1,
        poses: productSelected.limit_poses,
        sub_gallery_id: this.cartData,
        sub_gallery_data: currentsubGallery,
        product_type: productSelected.type
      }
    }
    
    this.cartService.addToCart(this.chosenProduct).subscribe((dataNewProduct:any) =>{
      this.cartService.productsRef.next(Object.assign(this.cartService.productsRef.getValue(), dataNewProduct));
      // this.cartService.getImageCropData(Object.keys(dataNewProduct)[0]);
      this.router.navigate(['/app/'+ this.userId +'/cart']);
    });
  }
}
