import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabsConductorPage } from './tabs-conductor.page';

describe('TabsConductorPage', () => {
  let component: TabsConductorPage;
  let fixture: ComponentFixture<TabsConductorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsConductorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
