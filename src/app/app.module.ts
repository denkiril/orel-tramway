import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import '@angular/common/locales/global/ru';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

import {NgSelectModule} from '@ng-select/ng-select';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {MainPageComponent} from './components/main-page/main-page.component';
import {CheckboxComponent} from './components/controls/checkbox/checkbox.component';
import {RadiobuttonComponent} from './components/controls/radiobutton/radiobutton.component';

@NgModule({
  declarations: [AppComponent, MainPageComponent, CheckboxComponent, RadiobuttonComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgSelectModule, FormsModule],
  providers: [{provide: LOCALE_ID, useValue: 'ru'}],
  bootstrap: [AppComponent]
})
export class AppModule {}
