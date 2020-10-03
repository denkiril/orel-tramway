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
  stations?: number[];
}

interface Station {
  id: number;
  name: string;
  start?: boolean;
  routesIds?: number[];
  routesStr?: string;
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
  stations: Station[] = [];
  stationsForSelect: Station[] = [];
  selectedStation: Station | undefined;
  IS_TODAY = IS_TODAY;
  DAY = DAY;
  showDay = DAY.WORKDAY;
  today = DAY.WORKDAY; // TODO определять

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
          const routes = result.routes || [];

          this.routes = routes.map((item: Route) => ({
            id: item.id,
            name: item.name,
            show: true
          }));
          console.log('routes', this.routes);

          this.stations = result.stations?.map((station: Station) => {
            const newStation = {...station};

            newStation.routesIds = routes
              .filter((route: Route) => route.stations?.includes(station.id))
              ?.map((r: Route) => r.id);

            newStation.routesStr = `[${newStation.routesIds?.join(', ')}]`;

            return newStation;
          });

          console.log('stations', this.stations);

          this.prepareStationsForSelect();

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

  private prepareStationsForSelect(): void {
    const routesToShow = this.routes.filter((item: Route) => item.show).map((route) => route.id);

    this.stationsForSelect = this.stations.filter((item: Station) =>
      item.routesIds?.some((id: number) => routesToShow.includes(id))
    );

    console.log('stationsForSelect:', this.stationsForSelect);
  }

  changeRouteShow(route: Route): void {
    route.show = !route.show;
    console.log('routes', this.routes);
    this.prepareStationsForSelect();
  }

  changeDayShow(day: DAY): void {
    this.showDay = day;
    console.log('showDay', this.showDay);
  }

  changeStation(station: Station): void {
    console.log('changeStation', station);
  }
}
