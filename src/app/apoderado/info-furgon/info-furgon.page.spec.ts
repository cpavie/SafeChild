import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InfoFurgonPage } from './info-furgon.page';

describe('InfoFurgonPage', () => {
  let component: InfoFurgonPage;
  let fixture: ComponentFixture<InfoFurgonPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoFurgonPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoFurgonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
