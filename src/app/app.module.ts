import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from './app.component';
import { GalleryService } from './gallery.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CategoryComponent } from './category/category.component';
import { CategoriesComponent } from './categories/categories.component';
import { WebStorageModule } from "ngx-store";

import { GalleryModule } from  '@ngx-gallery/core';
import { LightboxModule } from  '@ngx-gallery/lightbox';
import { LIGHTBOX_CONFIG } from '@ngx-gallery/lightbox';
import { BrowserAnimationsModule } from  '@angular/platform-browser/animations';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import { MatButtonModule, MatToolbarModule } from '@angular/material';
import { PackagesComponent } from './packages/packages.component';
import { NavComponent } from './nav/nav.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductCardComponent } from './product-card/product-card.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CartPageComponent } from './cart-page/cart-page.component';
import { OrderPlacingComponent } from './order-placing/order-placing.component';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { OrderByPipe } from './packages/order-by-price.pipe';
@NgModule({
  exports: [
    MatButtonModule,
    MatToolbarModule,
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    CategoryComponent,
    CategoriesComponent,
    PackagesComponent,
    NavComponent,
    NotFoundPageComponent,
    ProductCardComponent,
    CartPageComponent,
    OrderPlacingComponent,
    OrderByPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    WebStorageModule,
    GalleryModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    GallerizeModule,
    NgxSmartModalModule.forRoot(),
    AngularCropperjsModule,
    LightboxModule.withConfig({
      panelClass: 'fullscreen'
    })
  ],
  providers: [
  {
    provide: LIGHTBOX_CONFIG,
    useValue: {
      keyboardShortcuts: false
    }
  },
    GalleryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
