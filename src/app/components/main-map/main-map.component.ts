import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainMapComponent implements OnInit {
  // constructor() {}

  ngOnInit(): void {}
}
