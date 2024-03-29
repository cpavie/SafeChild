import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InicioConductorPage } from './inicio-conductor.page';

describe('InicioConductorPage', () => {
  let component: InicioConductorPage;
  let fixture: ComponentFixture<InicioConductorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InicioConductorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InicioConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
