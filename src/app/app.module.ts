import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {MainPageComponent} from './components/main-page/main-page.component';
import {CheckboxComponent} from './components/controls/checkbox/checkbox.component';
import {RadiobuttonComponent} from './components/controls/radiobutton/radiobutton.component';

@NgModule({
  declarations: [AppComponent, MainPageComponent, CheckboxComponent, RadiobuttonComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
