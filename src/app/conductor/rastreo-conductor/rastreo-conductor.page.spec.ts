import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../../testing/dobles-firebase';

import { RastreoConductorPage } from './rastreo-conductor.page';

describe('RastreoConductorPage', () => {
  let component: RastreoConductorPage;
  let fixture: ComponentFixture<RastreoConductorPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RastreoConductorPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(RastreoConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
