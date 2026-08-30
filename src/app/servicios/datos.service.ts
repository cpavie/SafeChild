import { Injectable } from '@angular/core';
import { Apoderado, Auxiliar, Conductor, Furgon, Persona } from '../models/safechild.models';

// dataAlumno se tipa como Partial porque se le agrega id_alumno (el
// id del propio documento, que doc.data() no incluye) y porque
// setDataAlumno({}) se usa como sentinela de "sin alumno
// seleccionado" en rastreo-apoderado.page.ts.
export type DataAlumno = Partial<import('../models/safechild.models').Alumno> & { id_alumno?: string };

@Injectable({
  providedIn: 'root'
})
export class DatosService {
  dataApoderado: Apoderado = {} as Apoderado;
  dataApoderadoPersona: Persona = {};
  dataAlumno: DataAlumno = {};
  dataAlumnoPersona: Persona = {};
  dataFurgon: Furgon = {} as Furgon;
  dataAuxiliar: Auxiliar = {} as Auxiliar;
  dataAuxiliarPersona: Persona = {};
  dataConductor: Conductor = {} as Conductor;
  dataConductorPersona: Persona = {};
  logeado: number;

  // Estado propio del flujo de ruta del conductor (comenzar/rastrear/
  // finalizar). Antes vivia en un DatosConductorService separado, casi
  // identico a este salvo por estos campos: se unificaron para no
  // mantener dos servicios en paralelo con los mismos getters/setters.
  ids_alumnos: string[] = [];
  nombres_alumnos: string[] = [];
  id_auxiliar: string;
  iniciorastreo: number;

  constructor() { }

  // El id del documento auxiliar/{id} no viene dentro del propio doc
  // (dataAuxiliar = doc.data() no incluye su id), asi que se guarda
  // aparte al elegir el auxiliar en inicio-conductor, para poder
  // actualizarlo despues en rastreo-conductor (toast()/logout()).
  setIdAuxiliar(id_auxiliar: string) {
    this.id_auxiliar = id_auxiliar
  }

  getIdAuxiliar(): string {
    return this.id_auxiliar
  }

  getNombresAlumnos(): string[] {
    return this.nombres_alumnos
  }

  setIdsAlumnos(ids_alumnos: string[]) {
    this.ids_alumnos = ids_alumnos
  }

  getIdsAlumnos(): string[] {
    return this.ids_alumnos
  }

  setDataConductor(dataConductor: Conductor) {
    this.dataConductor = dataConductor
  }

  getDataConductor(): Conductor {
    return this.dataConductor
  }

  setDataConductorPersona(dataConductorPersona: Persona) {
    this.dataConductorPersona = dataConductorPersona
  }

  getDataConductorPersona(): Persona {
    return this.dataConductorPersona
  }

  setDataAuxiliarPersona(dataAuxiliarPersona: Persona) {
    this.dataAuxiliarPersona = dataAuxiliarPersona
  }

  getDataAuxiliarPersona(): Persona {
    return this.dataAuxiliarPersona
  }

  setDataAuxiliar(dataAuxiliar: Auxiliar) {
    this.dataAuxiliar = dataAuxiliar
  }

  getDataAuxiliar(): Auxiliar {
    return this.dataAuxiliar
  }

  setdataFurgon(dataFurgon: Furgon) {
    this.dataFurgon = dataFurgon
  }

  getdataFurgon(): Furgon {
    return this.dataFurgon;
  }

  setDataApoderado(dataApoderado: Apoderado) {
    this.dataApoderado = dataApoderado
  }

  getDataApoderado(): Apoderado {
    return this.dataApoderado;
  }

  setDataApoderadoPersona(dataApoderadoPersona: Persona) {
    this.dataApoderadoPersona = dataApoderadoPersona
  }

  getDataApoderadoPersona(): Persona {
    return this.dataApoderadoPersona;
  }

  setDataAlumno(dataAlumno: DataAlumno) {
    this.dataAlumno = dataAlumno
  }

  getDataAlumno(): DataAlumno {
    return this.dataAlumno;
  }

  setDataAlumnoPersona(dataAlumnoPersona: Persona) {
    this.dataAlumnoPersona = dataAlumnoPersona
  }

  getDataAlumnoPersona(): Persona {
    return this.dataAlumnoPersona;
  }
}
