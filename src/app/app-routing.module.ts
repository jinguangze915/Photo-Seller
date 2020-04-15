import { Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";

import {CategoryComponent} from "./category/category.component";
import {CategoriesComponent} from "./categories/categories.component";
import {PackagesComponent} from "./packages/packages.component";
import {NotFoundPageComponent} from "./not-found-page/not-found-page.component";
import {ChoosenImgGuard} from "./choosen-img.guard";
import {CartPageComponent} from "./cart-page/cart-page.component";
import {OrderPlacingComponent} from "./order-placing/order-placing.component";

const routes: Routes = [
    { path: 'app/:id', children:[
            { path: 'gallery', component: CategoryComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'packages', component: PackagesComponent, canActivate: [ChoosenImgGuard] },
            { path: 'cart', component: CartPageComponent },
            { path: 'order-placing', component: OrderPlacingComponent },
            // { path: ':galleryId', children: [
            //         { path: 'gallery', component: CategoryComponent },
            //         { path: 'packages', component: PackagesComponent, canActivate: [ChoosenImgGuard] },
            //     ]
            // }
        ]},
    { path: '404', component: NotFoundPageComponent },

    // otherwise redirect to 404 page
    { path: '**', redirectTo: '404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {

}
