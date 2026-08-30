// Interfaces del esquema de datos, tal como esta documentado en
// firestore.rules (inferido leyendo src/app, confirmado en consola).
// El id de apoderado/{uid} y conductor/{uid} ES el uid de Firebase
// Auth: no se guarda como campo dentro del propio documento.

export interface Persona {
  p_nombres?: string;
  p_apellidos?: string;
  p_direccion?: string;
  p_comuna?: string;
  p_fecnac?: string;
  p_numdocumento?: string;
}

export interface Apoderado {
  id_persona: string;
  id_alumnos: string[];
  apo_telefono?: number;
  apo_correo?: string;
  apo_fotoperfil?: string;
}

export interface Conductor {
  id_persona: string;
  id_furgon: string;
  id_licencia: string;
  con_estado: number;
  con_telefono?: number;
  con_correo?: string;
  con_fotoperfil?: string;
}

export interface Alumno {
  id_persona: string;
  id_furgon: string;
  alu_estado: number;
  alu_comentario?: string;
}

export interface Furgon {
  id_conductor: string;
  fur_coordenadas: [number, number] | { [key: string]: number };
  alumnos: string[];
  auxiliares: string[];
  fur_patente?: string;
  fur_capacidad?: number;
  fur_foto?: string;
  fur_fotopermiso?: string;
}

export interface Auxiliar {
  id_persona: string;
  aux_estado: number | string;
}

export interface Licencia {
  lic_foto?: string;
}
