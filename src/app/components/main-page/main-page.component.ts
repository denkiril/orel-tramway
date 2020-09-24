import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {first} from 'rxjs/operators';

interface Route {
  id: number;
  name: string;
}

const DATA_URL = 'assets/data/data.json';

@Component({
  selector: 'main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPageComponent implements OnInit {
  routes: Route[] = [];

  constructor(private http: HttpClient, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http
      .get<any>(DATA_URL, {headers})
      .pipe(first())
      .subscribe(
        (data: Route[]) => {
          this.routes = data;
          console.log('data', data);
          this.changeDetector.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
