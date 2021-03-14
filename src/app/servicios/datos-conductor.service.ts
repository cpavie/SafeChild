import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosConductorService {
  dataApoderado:any = {};
  dataApoderadoPersona:any = {};
  dataAlumno: [{}] = [{}];
  dataAlumnoPersona:any = {};
  dataFurgon:any = {};
  dataAuxiliar:any = {};
  dataAuxiliarPersona:any = {};
  dataConductor:any={};
  dataConductorPersona:any={};
  ids_alumnos : Array < any > = [];
  nombres_alumnos : Array < any > = [];
  iniciorastreo:number

  constructor() { }

  getNombresAlumnos(){
    return this.nombres_alumnos
  }

  setIdsAlumnos(ids_alumnos){
    this.ids_alumnos = ids_alumnos
  }
  
  getIdsAlumnos(){
    return this.ids_alumnos
  }
  
  setDataConductor(dataConductor){
    this.dataConductor = dataConductor
  }

  getDataConductor(){
    return this.dataConductor
  }

  setDataConductorPersona(dataConductorPersona){
    this.dataConductorPersona = dataConductorPersona
  }

  getDataConductorPersona(){
    return this.dataConductorPersona
  }

  setDataAuxiliarPersona(dataAuxiliarPersona){
    this.dataAuxiliarPersona = dataAuxiliarPersona
  }

  getDataAuxiliarPersona(){
    return this.dataAuxiliarPersona
  }

  setDataAuxiliar(dataAuxiliar){
    this.dataAuxiliar = dataAuxiliar
  }

  getDataAuxiliar(){
    return this.dataAuxiliar
  }

  setdataFurgon(dataFurgon){
    this.dataFurgon = dataFurgon
  }

  getdataFurgon(){
    return this.dataFurgon;
  }

  setDataApoderado(dataApoderado){
    this.dataApoderado = dataApoderado
  }

  getDataApoderado(){
    return this.dataApoderado;
  }

  setDataApoderadoPersona(dataApoderadoPersona){
    this.dataApoderadoPersona = dataApoderadoPersona
  }

  getDataApoderadoPersona(){
    return this.dataApoderadoPersona;
  }

  setDataAlumno(dataAlumno){
    this.dataAlumno = dataAlumno
  }

  getDataAlumno(){
    return this.dataAlumno;
  }

  setDataAlumnoPersona(dataAlumnoPersona){
    this.dataAlumnoPersona = dataAlumnoPersona
  }

  getDataAlumnoPersona(){
    return this.dataAlumnoPersona;
  }
}
