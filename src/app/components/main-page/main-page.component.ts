/* eslint-disable no-console */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import {first} from 'rxjs/operators';

enum DAY {
  WORKDAY = 'workday',
  DAYOFF = 'dayoff'
}

interface Trips {
  departure_time: number[];
  to_depot: number[];
  text?: string;
}

interface StartStation {
  id: number;
  course: number;
  workday_trips: Trips;
  dayoff_trips: Trips;
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
  offset?: number;
  routesIds?: number[];
  routesStr?: string;
}

interface RouteSchedule {
  route: Route;
  trips: Trips;
}

interface RowTrip {
  time: number;
  timeStr: string;
  to_depot?: boolean;
}

interface RowRouteSchedule {
  route: Route;
  trips: RowTrip[];
}

interface ScheduleRow {
  hour: number;
  rowRoutes: RowRouteSchedule[];
}

interface ScheduleObject {
  routes: Route[];
  rows: ScheduleRow[];
  show: boolean;
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
  scheduleObject: ScheduleObject = {routes: [], rows: [], show: false};
  currentDatetime: Date | undefined;
  showCurrentTime = true;

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.currentDatetime = new Date();
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
    this.scheduleObject = {routes: [], rows: [], show: false};
    const routeSchedules: RouteSchedule[] = [];

    if (this.selectedStationId) {
      const showWorkday = this.showDay === DAY.WORKDAY;

      this.routes.forEach((route: Route) => {
        route.stations.forEach((arr: number[]) => {
          const index = arr.indexOf(this.selectedStationId);

          if (index > -1 && index < arr.length - 1) {
            const startStation = route.start_stations.find(
              (item: StartStation) => item.id === arr[0]
            );

            let offsetSum = 0;
            for (let i = 1; i <= index; i++) {
              offsetSum += this.stations.find((s: Station) => s.id === arr[i])?.offset || 0;
            }
            const offset = Math.floor(offsetSum / 60);

            if (startStation) {
              const startTrips = showWorkday
                ? startStation.workday_trips
                : startStation.dayoff_trips;

              const trips = {...startTrips};
              trips.departure_time = trips.departure_time.map((time: number) => time + offset);

              routeSchedules.push({route, trips});
            }
          }
        });
      });

      this.prepareSchedule(routeSchedules);
    }
    console.log('scheduleObject:', this.scheduleObject);
  }

  private prepareSchedule(routeSchedules: RouteSchedule[]): void {
    console.log('routeSchedules', routeSchedules);

    routeSchedules.forEach((routeSchedule: RouteSchedule) => {
      const {route} = routeSchedule;
      this.scheduleObject.routes.push(route);

      routeSchedule.trips.departure_time.forEach((time: number, index: number) => {
        const hour = Math.floor(time / 60);
        const minStr = (time - hour * 60).toString().padStart(2, '0');
        const timeStr = `${hour}:${minStr}`;
        const rowTrip: RowTrip = {time, timeStr};
        if (routeSchedule.trips.to_depot.includes(index)) {
          rowTrip.to_depot = true;
        }

        let scheduleRow = this.scheduleObject.rows.find((row: ScheduleRow) => row.hour === hour);
        if (!scheduleRow) {
          const len = this.scheduleObject.rows.push({hour, rowRoutes: []});
          scheduleRow = this.scheduleObject.rows[len - 1];
        }

        let rowRoute = scheduleRow.rowRoutes.find((r: RowRouteSchedule) => r.route.id === route.id);
        if (!rowRoute) {
          const len = scheduleRow.rowRoutes.push({route, trips: []});
          rowRoute = scheduleRow.rowRoutes[len - 1];
        }
        rowRoute.trips.push(rowTrip);
      });
    });

    this.checkScheduleObjectShow();
  }

  private checkScheduleObjectShow(): void {
    this.scheduleObject.show = this.scheduleObject.routes.some((route: Route) => route.show);
  }

  changeRouteShow(route: Route): void {
    route.show = !route.show;
    console.log('routes', this.routes);
    this.prepareStationsForSelect();
    this.checkScheduleObjectShow();
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
