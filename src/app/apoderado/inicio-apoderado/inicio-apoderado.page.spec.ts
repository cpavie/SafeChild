import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../../testing/dobles-firebase';

import { InicioApoderadoPage } from './inicio-apoderado.page';

describe('InicioApoderadoPage', () => {
  let component: InicioApoderadoPage;
  let fixture: ComponentFixture<InicioApoderadoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InicioApoderadoPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(InicioApoderadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
