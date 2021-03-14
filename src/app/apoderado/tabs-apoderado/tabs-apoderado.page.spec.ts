import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabsApoderadoPage } from './tabs-apoderado.page';

describe('TabsApoderadoPage', () => {
  let component: TabsApoderadoPage;
  let fixture: ComponentFixture<TabsApoderadoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsApoderadoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsApoderadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
