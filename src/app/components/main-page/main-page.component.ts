import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {first} from 'rxjs/operators';

enum DAY {
  WORKDAY = 'workday',
  DAYOFF = 'dayoff'
}

interface Route {
  id: number;
  name: string;
  show?: boolean;
}

const SCHEDULE_URL = 'assets/data/schedule.json';
const IS_TODAY = ' (сегодня)';

@Component({
  selector: 'main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent implements OnInit {
  routes: Route[] = [];
  IS_TODAY = IS_TODAY;
  DAY = DAY;
  showDay = DAY.WORKDAY;
  today = DAY.WORKDAY; // TODO определять

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http
      .get<any>(SCHEDULE_URL, {headers})
      .pipe(first())
      .subscribe(
        (data: Route[]) => {
          console.log('data', data);

          this.routes = data.map((item: Route) => ({
            id: item.id,
            name: item.name,
            show: true
          }));
          console.log('routes', this.routes);

          this.changeDetector.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  changeRouteShow(route: Route): void {
    route.show = !route.show;
    console.log('routes', this.routes);
  }

  changeDayShow(day: DAY): void {
    this.showDay = day;
    console.log('showDay', this.showDay);
  }
}
