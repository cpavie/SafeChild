import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../../testing/dobles-firebase';

import { InfoAuxiliarPage } from './info-auxiliar.page';

describe('InfoAuxiliarPage', () => {
  let component: InfoAuxiliarPage;
  let fixture: ComponentFixture<InfoAuxiliarPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoAuxiliarPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(InfoAuxiliarPage);
    component = fixture.componentInstance;
    component.dataAux = { aux_estado: 0 };
    component.dataAuxPersona = { p_nombres: '', p_apellidos: '' };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
