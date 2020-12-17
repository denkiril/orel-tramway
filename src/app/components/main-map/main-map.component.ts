import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

declare const WZoom: any;

@Component({
  selector: 'main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainMapComponent implements OnInit, AfterViewInit {
  @ViewChild('imageEl')
  imageEl!: ElementRef;

  // constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    WZoom.create(`#${this.imageEl.nativeElement.id}`, {
      minScale: 0.65,
      speed: 20
    });
  }
}
