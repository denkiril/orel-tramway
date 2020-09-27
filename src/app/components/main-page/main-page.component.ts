/* eslint-disable no-console */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {forkJoin, Observable} from 'rxjs';

enum DAY {
  WORKDAY = 'workday',
  DAYOFF = 'dayoff'
}

interface Route {
  id: number;
  name: string;
  show?: boolean;
}

interface Station {
  id: number;
  name: string;
  start?: boolean;
}

interface StationForSelect {
  value: number;
  label: string;
}

const SCHEDULE_URL = 'assets/data/schedule.json';
const STATIONS_URL = 'assets/data/stations.json';
const IS_TODAY = ' (сегодня)';

@Component({
  selector: 'main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent implements OnInit {
  routes: Route[] = [];
  stations: StationForSelect[] = [];
  IS_TODAY = IS_TODAY;
  DAY = DAY;
  showDay = DAY.WORKDAY;
  today = DAY.WORKDAY; // TODO определять
  selectedStation: StationForSelect | undefined;

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    forkJoin({
      routes: this.getSchedule(),
      stations: this.getStations()
    })
      .pipe(first())
      .subscribe(
        (result) => {
          console.log('result', result);

          this.routes = result.routes?.map((item: Route) => ({
            id: item.id,
            name: item.name,
            show: true
          }));
          console.log('routes', this.routes);

          this.stations = result.stations?.map((item: Station) => ({
            value: item.id,
            label: item.name
          }));
          console.log('stations', this.stations);

          this.changeDetector.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  private getSchedule(): Observable<Route[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(SCHEDULE_URL, {headers});
  }

  private getStations(): Observable<Station[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.get<any>(STATIONS_URL, {headers});
  }

  changeRouteShow(route: Route): void {
    route.show = !route.show;
    console.log('routes', this.routes);
  }

  changeDayShow(day: DAY): void {
    this.showDay = day;
    console.log('showDay', this.showDay);
  }

  changeStation(station: StationForSelect): void {
    console.log('changeStation', station);
  }
}
