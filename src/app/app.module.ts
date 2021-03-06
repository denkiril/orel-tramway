import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import '@angular/common/locales/global/ru';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

import {NgSelectModule} from '@ng-select/ng-select';
import {TimepickerModule} from 'ngx-bootstrap/timepicker';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {CheckboxComponent} from './components/controls/checkbox/checkbox.component';
import {RadiobuttonComponent} from './components/controls/radiobutton/radiobutton.component';
import {MainPageComponent} from './components/main-page/main-page.component';
import {ComplexScheduleComponent} from './components/complex-schedule/complex-schedule.component';
import {MainMapComponent} from './components/main-map/main-map.component';

@NgModule({
  declarations: [
    AppComponent,
    CheckboxComponent,
    RadiobuttonComponent,
    MainPageComponent,
    ComplexScheduleComponent,
    MainMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    TimepickerModule.forRoot()
  ],
  providers: [{provide: LOCALE_ID, useValue: 'ru'}],
  bootstrap: [AppComponent]
})
export class AppModule {}
