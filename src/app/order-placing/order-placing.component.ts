import { Component, OnInit, AfterViewInit, ViewChildren, Renderer2, ViewChild, ElementRef } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

import {ActivatedRoute, Router} from "@angular/router";
import {CartService} from "../cart.service";
import {LocalStorage} from "ngx-store";

//modal
import { NgxSmartModalService } from 'ngx-smart-modal';
import {GalleryService} from "../gallery.service";

@Component({
  selector: 'app-order-placing',
  templateUrl: './order-placing.component.html',
  styleUrls: ['./order-placing.component.scss']
})
export class OrderPlacingComponent implements OnInit, AfterViewInit {
  @LocalStorage() cartData: any = {};

  invalidEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  cartTotal;
  countTotal;
  countTotalTax;
  cartTax;
  cartItems;
  products = [];
  productsIdInCart;
  productTax: any = 0;

  form: FormGroup;
  error = '';
  submitted = false;

  formPromo: FormGroup;
  submittedPromo = false;

  promoData: any;

  resultCount;
  idCoupone;
  showTotalCoupon = false;
  userHaveGift;
  userOverdueGift;

  userId;
  callbackAfterCloseModal = null;

  private value:any = {};

  selectedState = 'California';
  selectedCountry = 'USA';

  countries = [
    { country: 'USA' },
    { country: 'Canada' }
  ];
  states = [
    { state: 'Alabama', country: 'USA' },
    { state: 'Alaska', country: 'USA' },
    { state: 'Arizona', country: 'USA' },
    { state: 'Arkansas', country: 'USA' },
    { state: 'California', country: 'USA' },
    { state: 'Colorado', country: 'USA' },
    { state: 'Connecticut', country: 'USA' },
    { state: 'Delaware', country: 'USA' },
    { state: 'Florida', country: 'USA' },
    { state: 'Georgia', country: 'USA' },
    { state: 'Hawaii', country: 'USA' },
    { state: 'Idaho', country: 'USA' },
    { state: 'Illinois', country: 'USA' },
    { state: 'Indiana', country: 'USA' },
    { state: 'Iowa', country: 'USA' },
    { state: 'Kansas', country: 'USA' },
    { state: 'Kentucky', country: 'USA' },
    { state: 'Louisiana', country: 'USA' },
    { state: 'Maine', country: 'USA' },
    { state: 'Maryland', country: 'USA' },
    { state: 'Massachusetts', country: 'USA' },
    { state: 'Michigan', country: 'USA' },
    { state: 'Minnesota', country: 'USA' },
    { state: 'Mississippi', country: 'USA' },
    { state: 'Missouri', country: 'USA' },
    { state: 'Montana', country: 'USA' },
    { state: 'Nevada', country: 'USA' },
    { state: 'New Hampshire', country: 'USA' },
    { state: 'New Jersey', country: 'USA' },
    { state: 'New Mexico', country: 'USA' },
    { state: 'New York', country: 'USA' },
    { state: 'North Carolina', country: 'USA' },
    { state: 'North Dakota', country: 'USA' },
    { state: 'Ohio', country: 'USA' },
    { state: 'Oklahoma', country: 'USA' },
    { state: 'Oregon', country: 'USA' },
    { state: 'Pennsylvania', country: 'USA' },
    { state: 'Rhode Island', country: 'USA' },
    { state: 'South Carolina', country: 'USA' },
    { state: 'South Dakota', country: 'USA' },
    { state: 'Tennessee', country: 'USA' },
    { state: 'Texas', country: 'USA' },
    { state: 'Utah', country: 'USA' },
    { state: 'Vermont', country: 'USA' },
    { state: 'Virginia', country: 'USA' },
    { state: 'Washington', country: 'USA' },
    { state: 'West Virginia', country: 'USA' },
    { state: 'Wisconsin', country: 'USA' },
    { state: 'Wyoming', country: 'USA' },

    { state: 'Alberta', country: 'Canada' },
    { state: 'British Columbia', country: 'Canada' },
    { state: 'Victoria', country: 'Canada' },
    { state: 'Manitoba', country: 'Canada' },
    { state: 'Winnipeg', country: 'Canada' },
    { state: 'New Brunswick Fredericton', country: 'Canada' },
    { state: 'Newfoundland and Labrador', country: 'Canada' },
    { state: 'Northwest Territories', country: 'Canada' },
    { state: 'Nova Scotia', country: 'Canada' },
    { state: 'Nunavut', country: 'Canada' },
    { state: 'Ontario', country: 'Canada' },
    { state: 'Prince Edward Island', country: 'Canada' },
    { state: 'Quebec', country: 'Canada' },
    { state: 'Saskatchewan', country: 'Canada' },
    { state: 'Yukon', country: 'Canada' }
  ];

  //changeText: boolean;
  addLoader:boolean;

  constructor(
      public ngxSmartModalService: NgxSmartModalService,
      private router: Router,
      private route: ActivatedRoute,
      private cartService: CartService,
      private galleryService: GalleryService,
      private renderer: Renderer2
  ) {}

  addCustomState = (term) => ({id: term, name: term});

  ngOnInit() {
    
    this.userId = this.route.snapshot.params['id'];

    this.cartService.getAllProducts().subscribe((products) => {
      this.cartService.productsRef.next(products);
    });
    this.cartService.productsRef.subscribe((products)=>{
      console.log('productsRef subscribe');
      this.productsIdInCart = Object.keys(products)
      this.products = Object.values(products);

      this.getTotalCart();

      setTimeout(() => {
        this.redirectOnCart();// if item none
      }, 500);

    });

    this.galleryService.priceList.subscribe((priceList)=>{
      this.productTax = priceList.tax ? priceList.tax : 0;
      if(this.productTax != 0) {
        this.countTotalTax = (this.productTax / 100 * Number(this.countTotal)).toFixed(2);
        this.cartTax = this.countTotalTax;
      }
      this.getTotalWithTax();
    });

    this.cartService.getInfoGift().subscribe((data: any) => {
      this.userHaveGift = data.free_gift;
      this.userOverdueGift = data.overdue;
      if(!this.userHaveGift && !this.userOverdueGift){
          this.openModalReviewForGift();
      }
    });

    this.form = new FormGroup({
      'name': new FormControl(null,  Validators.required),
      'lastname': new FormControl(null, Validators.required),
      'address': new FormControl(null, Validators.required),
      'city': new FormControl(null, Validators.required),
      'state': new FormControl(null, Validators.required),
      'postalcode': new FormControl(null, Validators.required),
      'country': new FormControl('USA', Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'agree': new FormControl(true, [Validators.required, Validators.pattern('true')]),
      'comment': new FormControl(null, null),
      'promotion': new FormControl(true, null),
      'free_gift': new FormControl( 0 )
    });

    this.formPromo = new FormGroup({
      'promo_code': new FormControl(null,  Validators.required)
    });
    
  }
  ngAfterViewInit(){}


  noClosePopup(event){
    this.ngxSmartModalService.getModal('modalPromoCode').dismissable = false;
  }

  getTotalCart(){
    if(this.products.length){
      this.cartTotal = this.products.map(product => Number((product.quantity * product.price).toFixed(2)))
          .reduce((prev, next) => Number((prev + next).toFixed(2)));
      this.cartItems = this.products.map(product => Number((product.quantity))).reduce((el, a) => el + a,0);
      this.countTotal = Number(this.cartTotal);
    }
    else{
      this.cartTotal = 0;
      this.cartItems = 0;
      this.countTotal =  Number(this.cartTotal);
    }
  }

  redirectOnCart(){
    if(this.cartItems <= 0)
    this.router.navigate(['/app/'+ this.userId +'/cart']);
  }

  getTotalWithTax(){
    if(this.productTax == 0) return;
    this.countTotalTax = (this.productTax / 100 * Number(this.cartTotal)).toFixed(2);
    this.countTotal = (Number(this.cartTotal) + Number(this.countTotalTax)).toFixed(2);
  }

  onChangeState(countryName) {
    this.selectedCountry = countryName;
  }

  /**
   * set description product  in modal
   *
   * @param product {Object}
   */
  openModalPromoCode(){
    this.ngxSmartModalService.resetModalData('modalPromoCode');
    this.ngxSmartModalService.setModalData('', 'modalPromoCode');
    this.ngxSmartModalService.getModal('modalPromoCode').open();
  }

  openModalReviewForGift($event = null){
    if($event) {
      $event.preventDefault()
    }
    this.ngxSmartModalService.getModal('modalReview').open();
  }
  afterCloseModal(){
    if(this.callbackAfterCloseModal){
      this.callbackAfterCloseModal();
      this.callbackAfterCloseModal == null;
    }
  }
  leaveReview(){
    this.cartService.updateInfoGift({free_gift: 1, overdue: false}).subscribe((data: any) => {
      this.userHaveGift = Number(data.free_gift);
      this.userOverdueGift = Number(data.overdue);
      this.ngxSmartModalService.getModal('modalReview').close();
    });
  }

  /**
   * Add message about error
   */
  get ifErrors() { return this.form.controls; }
  get ifPromoErrors() { return this.formPromo.controls; }

  onSubmit() {
    this.submitted = true;

    /**
     * if form invalid then don't send
     */
    if (this.form.invalid) {
      return;
    }
    if(!this.userHaveGift && !this.userOverdueGift){
      this.openModalReviewForGift();
      this.callbackAfterCloseModal = this.submitOrder;
    }else{
      this.submitOrder()
    }
  }
  submitOrder(){
    let formData = this.form.value;
    formData.id = this.cartData.id;
    formData.items = this.cartItems;
    formData.subtotal = this.cartTotal;
    formData.total = this.countTotal;
    formData.coupone_id = this.idCoupone;
    formData.total_coupone = this.resultCount;
    formData.tax = this.cartTax;
    formData.free_gift = Number(this.userHaveGift);
    this.addLoader = true;
    this.cartService.createOrder(formData).subscribe((data: any) => {
      if (data.status) {
        let url;
        if (formData.total == 0) {
          url = '/order/get/' + data.order_id;
        }
        else {
          url = '/order/card';
        }
        console.log(this.userHaveGift);
        window.location.href=url;
      } else {
        this.addLoader = false;
        this.error = data.message;
        window.setTimeout(() => {
          this.error = ''
        }, 4000)
      }
    })
  }
  getCookie(name) {
      let nameEQ = name + "=";
      let ca = document.cookie.split(';');
      for(let i=0;i < ca.length;i++) {
          let c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0)
          return c.substring(nameEQ.length,c.length);
      }
      return null;
  }
  onSubmitPromo() {
    this.submittedPromo = true;
    /**
     * if form invalid then don't send
     */
    if (this.formPromo.invalid) {
      return;
    }

    let formData = this.formPromo.value;
    //formData.email = this.form.value.email;
    formData.cart_total = this.countTotal;

    let sessionEmail = this.getCookie('emailObj');
    if(sessionEmail){
      this.cartService.emailCookie.next(sessionEmail);
      let curObj = JSON.parse(sessionEmail)
      formData.user_email = curObj.email;
    }
    this.addLoader = true;
    this.cartService.sendPromoCode(formData).subscribe((data: any) => {
      if (data.status) {
        this.ngxSmartModalService.getModal('modalPromoCode').close();
        this.promoData = data.promo;
        this.idCoupone = this.promoData.id;
        this.getCountPromo(this.promoData);
        this.showTotalCoupon = true;
      } else {
        this.error = 'Sorry, that coupon code is invalid.';
        window.setTimeout(() => {
          this.error = ''
        }, 4000)
      }
      this.addLoader = false;
    })
  }

  /**
   * Get info about promo code and count total
   * @param promo - object with promo code info
   */
  getCountPromo(promo) {
    if (promo.type === '%'){
      this.resultCount = (promo.discount_amount / 100 * this.cartTotal).toFixed(2);
      this.countTotal = (this.cartTotal - this.resultCount).toFixed(2);
    }
    else{
      if(promo.discount_amount > this.cartTotal) {
        this.resultCount = (promo.discount_amount).toFixed(2);
        this.countTotal = 0;
      }
      else{
        this.resultCount = (promo.discount_amount).toFixed(2);
        this.countTotal = (this.cartTotal - this.resultCount).toFixed(2);
      }
    }

    if(this.productTax != 0) {
      this.countTotalTax = (this.productTax / 100 * Number(this.countTotal)).toFixed(2);
      this.countTotal = (Number(this.countTotal) + Number(this.countTotalTax)).toFixed(2);
    }
  }
}
