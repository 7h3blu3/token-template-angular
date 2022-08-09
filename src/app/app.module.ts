import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from './auth/auth-interceptor';
import { AppComponent } from './app.component';
import { AngularMaterialModule } from './angular-material.module';

import { HeaderComponent } from './header/header.component';
import { HomePageComponent } from './home-page/home-page.component';
import { AuthGuard } from './auth/auth.guard';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomePageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule
  ],
  providers: [ AuthGuard, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],


  bootstrap: [AppComponent]
})
export class AppModule { }
