import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { Platform } from '@ionic/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let platformReadySpy;
  let platformSpy;

  beforeEach(waitForAsync(() => {
    // Ya no se doblan SplashScreen ni StatusBar: con Capacitor 7 son
    // APIs estaticas de @capacitor/*, y el componente solo las llama en
    // plataforma nativa, asi que en el test no se ejecutan.
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: Platform, useValue: platformSpy }],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
  });
});
