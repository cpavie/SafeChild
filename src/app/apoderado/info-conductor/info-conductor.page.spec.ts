import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoConductorPage } from './info-conductor.page';

describe('InfoConductorPage', () => {
  let component: InfoConductorPage;
  let fixture: ComponentFixture<InfoConductorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoConductorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
