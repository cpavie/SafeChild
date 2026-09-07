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

/**
 * Estados de alu_estado. Antes eran 0 y 1 sueltos repartidos por toda
 * la app, y no habia forma de distinguir "lo dejamos en su casa" de
 * "nunca subio": las dos cosas eran 0, asi que marcar a un alumno que
 * no abordo le avisaba a su apoderado que habia llegado a destino.
 *
 * NO_ABORDO es terminal hasta la ruta siguiente: comenzarRuta() vuelve
 * a poner ABORDO a los alumnos que el conductor seleccione.
 */
export const ALU_ESTADO = {
  /** Fuera de ruta: entregado, o la ruta todavia no comienza. */
  FUERA: 0,
  /** A bordo del furgon. */
  ABORDO: 1,
  /** El furgon paso y el alumno no subio. */
  NO_ABORDO: 2,
};

export interface Alumno {
  id_persona: string;
  id_furgon: string;
  /** Ver ALU_ESTADO. */
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
