import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HardwareSettingsModalComponent } from './hardware-settings-modal.component';

describe('HardwareSettingsModalComponent', () => {
  let component: HardwareSettingsModalComponent;
  let fixture: ComponentFixture<HardwareSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HardwareSettingsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HardwareSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
