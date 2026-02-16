export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            perfiles: {
                Row: {
                    id: string
                    nombre_completo: string | null
                    url_avatar: string | null
                    rol: string | null
                    telefono: string | null
                    fecha_nacimiento: string | null
                    genero: string | null
                    contacto_emergencia: string | null
                    contacto_emergencia_nombre: string | null
                    contacto_emergencia_telefono: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                    informacion_medica: Json | null
                    estado_membresia: string | null
                    fecha_inicio_membresia: string | null
                    fecha_fin_membresia: string | null
                    direccion: string | null
                    ciudad: string | null
                    observaciones_entrenador: string | null
                    restricciones_adicionales: string | null
                    modificaciones_recomendadas: string | null
                    onboarding_completado: boolean | null
                    onboarding_completado_en: string | null
                    exencion_aceptada: boolean | null
                    fecha_exencion: string | null
                }
                Insert: {
                    id: string
                    nombre_completo?: string | null
                    url_avatar?: string | null
                    rol?: string | null
                    telefono?: string | null
                    fecha_nacimiento?: string | null
                    genero?: string | null
                    contacto_emergencia?: string | null
                    contacto_emergencia_nombre?: string | null
                    contacto_emergencia_telefono?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    informacion_medica?: Json | null
                    estado_membresia?: string | null
                    fecha_inicio_membresia?: string | null
                    fecha_fin_membresia?: string | null
                    direccion?: string | null
                    ciudad?: string | null
                    observaciones_entrenador?: string | null
                    restricciones_adicionales?: string | null
                    modificaciones_recomendadas?: string | null
                    onboarding_completado?: boolean | null
                    onboarding_completado_en?: string | null
                    exencion_aceptada?: boolean | null
                    fecha_exencion?: string | null
                }
                Update: {
                    id?: string
                    nombre_completo?: string | null
                    url_avatar?: string | null
                    rol?: string | null
                    telefono?: string | null
                    fecha_nacimiento?: string | null
                    genero?: string | null
                    contacto_emergencia?: string | null
                    contacto_emergencia_nombre?: string | null
                    contacto_emergencia_telefono?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    informacion_medica?: Json | null
                    estado_membresia?: string | null
                    fecha_inicio_membresia?: string | null
                    fecha_fin_membresia?: string | null
                    direccion?: string | null
                    ciudad?: string | null
                    observaciones_entrenador?: string | null
                    restricciones_adicionales?: string | null
                    modificaciones_recomendadas?: string | null
                    onboarding_completado?: boolean | null
                    onboarding_completado_en?: string | null
                    exencion_aceptada?: boolean | null
                    fecha_exencion?: string | null
                }
            }
            actividades: {
                Row: {
                    id: string
                    nombre: string
                    tipo: string | null
                    descripcion: string | null
                    esta_activa: boolean | null
                    duracion_minutos: number | null
                    capacidad_maxima: number | null
                    url_imagen: string | null
                    dificultad: string | null
                    creado_en: string | null
                }
                Insert: { id?: string; nombre: string; tipo?: string | null; descripcion?: string | null; esta_activa?: boolean | null; duracion_minutos?: number | null; capacidad_maxima?: number | null; url_imagen?: string | null; dificultad?: string | null; creado_en?: string | null }
                Update: { id?: string; nombre?: string; tipo?: string | null; descripcion?: string | null; esta_activa?: boolean | null; duracion_minutos?: number | null; capacidad_maxima?: number | null; url_imagen?: string | null; dificultad?: string | null; creado_en?: string | null }
            }
            asistencias: {
                Row: { id: string; usuario_id: string | null; rol_en_el_momento: string | null; entrada: string | null; salida: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; rol_en_el_momento?: string | null; entrada?: string | null; salida?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; rol_en_el_momento?: string | null; entrada?: string | null; salida?: string | null; creado_en?: string | null }
            }
            pagos: {
                Row: { id: string; usuario_id: string | null; monto: number | null; moneda: string | null; metodo_pago: string | null; estado: string | null; aprobado_por: string | null; aprobado_en: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; monto?: number | null; moneda?: string | null; metodo_pago?: string | null; estado?: string | null; aprobado_por?: string | null; aprobado_en?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; monto?: number | null; moneda?: string | null; metodo_pago?: string | null; estado?: string | null; aprobado_por?: string | null; aprobado_en?: string | null; creado_en?: string | null }
            }
            rutinas: {
                Row: { id: string; usuario_id: string | null; entrenador_id: string | null; nombre: string; descripcion: string | null; duracion_semanas: number | null; generada_por_ia: boolean | null; esta_activa: boolean | null; estado: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; entrenador_id?: string | null; nombre: string; descripcion?: string | null; duracion_semanas?: number | null; generada_por_ia?: boolean | null; esta_activa?: boolean | null; estado?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; entrenador_id?: string | null; nombre?: string; descripcion?: string | null; duracion_semanas?: number | null; generada_por_ia?: boolean | null; esta_activa?: boolean | null; estado?: string | null; creado_en?: string | null }
            }
            ejercicios: {
                Row: { id: string; rutina_id: string | null; nombre: string; descripcion: string | null; grupo_muscular: string | null; equipamiento: string[] | null; series: number | null; repeticiones: string | null; descanso_segundos: number | null; dia_numero: number | null; orden_en_dia: number | null; url_video: string | null }
                Insert: { id?: string; rutina_id?: string | null; nombre: string; descripción?: string | null; grupo_muscular?: string | null; equipamiento?: string[] | null; series?: number | null; repeticiones?: string | null; descanso_segundos?: number | null; dia_numero?: number | null; orden_en_dia?: number | null; url_video?: string | null }
                Update: { id?: string; rutina_id?: string | null; nombre?: string; descripción?: string | null; grupo_muscular?: string | null; equipamiento?: string[] | null; series?: number | null; repeticiones?: string | null; descanso_segundos?: number | null; dia_numero?: number | null; orden_en_dia?: number | null; url_video?: string | null }
            }
            horarios_de_clase: {
                Row: { id: string; actividad_id: string | null; entrenador_id: string | null; dia_de_la_semana: number | null; hora_inicio: string | null; hora_fin: string | null; esta_activa: boolean | null; texto_profesor: string | null }
                Insert: { id?: string; actividad_id?: string | null; entrenador_id?: string | null; dia_de_la_semana?: number | null; hora_inicio?: string | null; hora_fin?: string | null; esta_activa?: boolean | null; texto_profesor?: string | null }
                Update: { id?: string; actividad_id?: string | null; entrenador_id?: string | null; dia_de_la_semana?: number | null; hora_inicio?: string | null; hora_fin?: string | null; esta_activa?: boolean | null; texto_profesor?: string | null }
            }
            reservas_de_clase: {
                Row: { id: string; usuario_id: string | null; horario_clase_id: string | null; estado: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; horario_clase_id?: string | null; estado?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; horario_clase_id?: string | null; estado?: string | null; creado_en?: string | null }
            }
            objetivos_del_usuario: {
                Row: { id: string; usuario_id: string | null; objetivo_principal: string; peso_objetivo: number | null; frecuencia_entrenamiento_por_semana: number | null; esta_activo: boolean | null; objetivos_secundarios: string[] | null; tiempo_entrenamiento_preferido: string | null; dias_disponibles: string[] | null; tiempo_por_sesion_minutos: number | null; acceso_a_equipamiento: string[] | null; notas_entrenador: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; objetivo_principal?: string; peso_objetivo?: number | null; frecuencia_entrenamiento_por_semana?: number | null; esta_activo?: boolean | null; objetivos_secundarios?: string[] | null; tiempo_entrenamiento_preferido?: string | null; dias_disponibles?: string[] | null; tiempo_por_sesion_minutos?: number | null; acceso_a_equipamiento?: string[] | null; notas_entrenador?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; objetivo_principal?: string; peso_objetivo?: number | null; frecuencia_entrenamiento_por_semana?: number | null; esta_activo?: boolean | null; objetivos_secundarios?: string[] | null; tiempo_entrenamiento_preferido?: string | null; dias_disponibles?: string[] | null; tiempo_por_sesion_minutos?: number | null; acceso_a_equipamiento?: string[] | null; notas_entrenador?: string | null; creado_en?: string | null }
            }
            sesiones_de_entrenamiento: {
                Row: { id: string; usuario_id: string | null; rutina_id: string | null; estado: string | null; hora_inicio: string | null; hora_fin: string | null; puntos_totales: number | null; notas: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; rutina_id?: string | null; estado?: string | null; hora_inicio?: string | null; hora_fin?: string | null; puntos_totales?: number | null; notas?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; rutina_id?: string | null; estado?: string | null; hora_inicio?: string | null; hora_fin?: string | null; puntos_totales?: number | null; notas?: string | null; creado_en?: string | null }
            }
            registros_de_ejercicio: {
                Row: { id: string; sesion_id: string | null; ejercicio_id: string | null; series_reales: number | null; repeticiones_reales: string | null; peso_real: number | null; segundos_descanso_real: number | null; fue_completado: boolean | null }
                Insert: { id?: string; sesion_id?: string | null; ejercicio_id?: string | null; series_reales?: number | null; repeticiones_reales?: string | null; peso_real?: number | null; segundos_descanso_real?: number | null; fue_completado?: boolean | null }
                Update: { id?: string; sesion_id?: string | null; ejercicio_id?: string | null; series_reales?: number | null; repeticiones_reales?: string | null; peso_real?: number | null; segundos_descanso_real?: number | null; fue_completado?: boolean | null }
            }
            mediciones: {
                Row: { id: string; usuario_id: string | null; peso: number | null; grasa_corporal: number | null; masa_muscular: number | null; registrado_en: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; peso?: number | null; grasa_corporal?: number | null; masa_muscular?: number | null; registrado_en?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; peso?: number | null; grasa_corporal?: number | null; masa_muscular?: number | null; registrado_en?: string | null; creado_en?: string | null }
            }
            equipamiento: {
                Row: { id: string; nombre: string; categoria: string | null; condicion: string | null; esta_disponible: boolean | null }
                Insert: { id?: string; nombre: string; categoria?: string | null; condicion?: string | null; esta_disponible?: boolean | null }
                Update: { id?: string; nombre?: string; categoria?: string | null; condicion?: string | null; esta_disponible?: boolean | null }
            }
            planes_nutricionales: {
                Row: { id: string; usuario_id: string | null; entrenador_id: string | null; calorias_diarias: number | null; gramos_proteina: number | null; gramos_carbohidratos: number | null; gramos_grasas: number | null; esta_activo: boolean | null; litros_agua: number | null; pautas_generales: string | null; creado_en: string | null }
                Insert: { id?: string; usuario_id?: string | null; entrenador_id?: string | null; calorias_diarias?: number | null; gramos_proteina?: number | null; gramos_carbohidratos?: number | null; gramos_grasas?: number | null; esta_activo?: boolean | null; litros_agua?: number | null; pautas_generales?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; entrenador_id?: string | null; calorias_diarias?: number | null; gramos_proteina?: number | null; gramos_carbohidratos?: number | null; gramos_grasas?: number | null; esta_activo?: boolean | null; litros_agua?: number | null; pautas_generales?: string | null; creado_en?: string | null }
            }
            notificaciones_preferencias: {
                Row: { usuario_id: string; email_habilitado: boolean | null; push_habilitado: boolean | null; mensajes_habilitado: boolean | null; entrenamientos_habilitado: boolean | null; pagos_habilitado: boolean | null }
                Insert: { usuario_id: string; email_habilitado?: boolean | null; push_habilitado?: boolean | null; mensajes_habilitado?: boolean | null; entrenamientos_habilitado?: boolean | null; pagos_habilitado?: boolean | null }
                Update: { usuario_id?: string; email_habilitado?: boolean | null; push_habilitado?: boolean | null; mensajes_habilitado?: boolean | null; entrenamientos_habilitado?: boolean | null; pagos_habilitado?: boolean | null }
            }
            gamificacion_del_usuario: {
                Row: { usuario_id: string; puntos: number | null; racha_actual: number | null; racha_mas_larga: number | null; nivel: number | null; fecha_ultima_actividad: string | null; creado_en: string | null }
                Insert: { usuario_id: string; puntos?: number | null; racha_actual?: number | null; racha_mas_larga?: number | null; nivel?: number | null; fecha_ultima_actividad?: string | null; creado_en?: string | null }
                Update: { usuario_id?: string; puntos?: number | null; racha_actual?: number | null; racha_mas_larga?: number | null; nivel?: number | null; fecha_ultima_actividad?: string | null; creado_en?: string | null }
            },
            conversaciones: {
                Row: { id: string; creado_en: string | null; metadatos: Json | null; tipo: string | null }
                Insert: { id?: string; creado_en?: string | null; metadatos?: Json | null; tipo?: string | null }
                Update: { id?: string; creado_en?: string | null; metadatos?: Json | null; tipo?: string | null }
            },
            mensajes: {
                Row: { id: string; remitente_id: string | null; receptor_id: string | null; contenido: string | null; creado_en: string | null; esta_leido: boolean | null; conversacion_id: string | null; leido_en: string | null }
                Insert: { id?: string; remitente_id?: string | null; receptor_id?: string | null; contenido?: string | null; creado_en?: string | null; esta_leido?: boolean | null; conversacion_id?: string | null; leido_en?: string | null }
                Update: { id?: string; remitente_id?: string | null; receptor_id?: string | null; contenido?: string | null; creado_en?: string | null; esta_leido?: boolean | null; conversacion_id?: string | null; leido_en?: string | null }
            }
        }
        Views: {
            classes_with_availability: { Row: { id: string; nombre_actividad: string | null; cupos_disponibles: number | null } }
            user_bookings_detailed: { Row: { id: string; nombre_actividad: string | null; nombre_entrenador: string | null; hora_inicio: string | null } }
        }
        Functions: {
            is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
            is_coach: { Args: Record<PropertyKey, never>; Returns: boolean }
        }
        Enums: {
            nivel_dificultad: 'principiante' | 'intermedio' | 'avanzado' | 'todos_los_niveles'
            tipo_conversacion: 'privada' | 'soporte' | 'grupo'
        }
    }
}
