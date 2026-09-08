import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../../testing/dobles-firebase';

import { InfoConductorPage } from './info-conductor.page';

describe('InfoConductorPage', () => {
  let component: InfoConductorPage;
  let fixture: ComponentFixture<InfoConductorPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoConductorPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(InfoConductorPage);
    component = fixture.componentInstance;
    component.dataConductor = { id_licencia: 'lic1' };
    component.dataConductorPersona = { p_nombres: '', p_apellidos: '' };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
