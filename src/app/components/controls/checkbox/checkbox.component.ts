import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
  AfterContentInit,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  ChangeDetectionStrategy
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements AfterViewInit, AfterContentInit, ControlValueAccessor {
  @Input() controlTitle: string | undefined;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() textLeft: string | undefined;
  @Input() textRight: string | undefined;
  @Input() textWrap = false;
  @Input() size: number | undefined;
  @Output() changeChecked: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('checkbox') checkbox!: ElementRef;
  @ViewChild('label') label!: ElementRef;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    if (this.size && !(this.size === 20 || this.size === 24)) {
      this.renderer.setStyle(this.checkbox.nativeElement, 'width', this.size);
      this.renderer.setStyle(this.checkbox.nativeElement, 'height', this.size);
      this.renderer.setStyle(this.label.nativeElement, 'lineHeight', this.size);
    }
  }

  writeValue(value: any): void {
    this.checked = !!value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngAfterContentInit(): void {
    this.onChange(this.checked);
  }

  change(): void {
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.changeChecked.emit(this.checked);
  }
}
