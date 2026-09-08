import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { proveedoresDePrueba } from '../../../testing/dobles-firebase';

import { EditAlumnoPage } from './edit-alumno.page';

describe('EditAlumnoPage', () => {
  let component: EditAlumnoPage;
  let fixture: ComponentFixture<EditAlumnoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAlumnoPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: proveedoresDePrueba
    }).compileComponents();

    fixture = TestBed.createComponent(EditAlumnoPage);
    component = fixture.componentInstance;
    component.dataAlumno = { id_alumno: 'al1', alu_comentario: '' };
    component.dataAlumnoPersona = { p_direccion: '', p_comuna: '' };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
