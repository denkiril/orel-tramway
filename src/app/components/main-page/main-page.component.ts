/* eslint-disable no-console */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {forkJoin, Observable} from 'rxjs';

enum DAY {
  WORKDAY = 'workday',
  DAYOFF = 'dayoff'
}

interface Trip {
  departure_time: number[];
  to_depot: number[];
  text?: string;
}

interface StartStation {
  id: number;
  course: number;
  workday_trips: Trip;
  dayoff_trips: Trip;
}

interface Route {
  id: number;
  name: string;
  stations: number[][];
  start_stations: StartStation[];
  show?: boolean;
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
  private selectedStationId = 0;
  routes: Route[] = [];
  stations: Station[] = [];
  stationsForSelect: Station[] = [];
  IS_TODAY = IS_TODAY;
  DAY = DAY;
  showDay = DAY.WORKDAY;
  today = DAY.WORKDAY; // TODO определять
  schedule = '';

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

          this.routes = routes.map((route: Route) => ({
            ...route,
            show: true
          }));
          console.log('routes', this.routes);

          this.stations = result.stations?.map((station: Station) => {
            const newStation = {...station};

            newStation.routesIds = routes
              .filter((route: Route) =>
                route.stations.some((arr: number[]) => arr.includes(station.id))
              )
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

  private updateSchedule(): void {
    console.log('updateSchedule', this.selectedStationId);
    this.schedule = '';

    if (this.selectedStationId) {
      const showWorkday = this.showDay === DAY.WORKDAY;

      this.routes.forEach((route: Route) => {
        if (route.show) {
          route.stations.forEach((arr: number[]) => {
            const index = arr.indexOf(this.selectedStationId);
            if (index > -1 && index < arr.length - 1) {
              const startStation = route.start_stations.find(
                (item: StartStation) => item.id === arr[0]
              );
              const trips = showWorkday ? startStation?.workday_trips : startStation?.dayoff_trips;
              this.schedule += `${route.name}: ${trips?.text || ''}\n`;
            }
          });
        }
      });
    }
  }

  changeRouteShow(route: Route): void {
    route.show = !route.show;
    console.log('routes', this.routes);
    this.prepareStationsForSelect();
  }

  changeDayShow(day: DAY): void {
    this.showDay = day;
    console.log('showDay', this.showDay);
    this.updateSchedule();
  }

  changeStation(station?: Station): void {
    console.log('changeStation', station);
    this.selectedStationId = station?.id || 0;
    this.updateSchedule();
  }
}
