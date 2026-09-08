import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../../testing/dobles-firebase';

import { InfoFurgonPage } from './info-furgon.page';

describe('InfoFurgonPage', () => {
  let component: InfoFurgonPage;
  let fixture: ComponentFixture<InfoFurgonPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoFurgonPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(InfoFurgonPage);
    component = fixture.componentInstance;
    component.dataFurgon = { fur_patente: '', fur_foto: '', fur_fotopermiso: '' };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
