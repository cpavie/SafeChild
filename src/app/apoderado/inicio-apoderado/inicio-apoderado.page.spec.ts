import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InicioApoderadoPage } from './inicio-apoderado.page';

describe('InicioApoderadoPage', () => {
  let component: InicioApoderadoPage;
  let fixture: ComponentFixture<InicioApoderadoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InicioApoderadoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioApoderadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
