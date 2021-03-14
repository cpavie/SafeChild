import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RastreoConductorPage } from './rastreo-conductor.page';

describe('RastreoConductorPage', () => {
  let component: RastreoConductorPage;
  let fixture: ComponentFixture<RastreoConductorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RastreoConductorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RastreoConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
