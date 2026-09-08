import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../testing/dobles-firebase';

import { AyudaPage } from './ayuda.page';

describe('AyudaPage', () => {
  let component: AyudaPage;
  let fixture: ComponentFixture<AyudaPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AyudaPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(AyudaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
