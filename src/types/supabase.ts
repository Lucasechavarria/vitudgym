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
                Insert: { id: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
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
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            reservas_de_clase: {
                Row: {
                    id: string
                    usuario_id: string | null
                    horario_clase_id: string | null
                    estado: string | null
                    fecha: string | null
                    creado_en: string | null
                }
                Insert: { id?: string; usuario_id?: string | null; horario_clase_id?: string | null; estado?: string | null; fecha?: string | null; creado_en?: string | null }
                Update: { id?: string; usuario_id?: string | null; horario_clase_id?: string | null; estado?: string | null; fecha?: string | null; creado_en?: string | null }
            }
            equipamiento: {
                Row: {
                    id: string
                    nombre: string
                    categoria: string | null
                    estado: 'excellent' | 'good' | 'fair' | 'needs_repair' | null
                    esta_disponible: boolean | null
                }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            planes_nutricionales: {
                Row: {
                    id: string
                    usuario_id: string | null
                    entrenador_id: string | null
                    calorias_diarias: number | null
                    gramos_proteina: number | null
                    gramos_carbohidratos: number | null
                    gramos_grasas: number | null
                    litros_agua: number | null
                    comidas: Json | null
                    suplementos: Json | null
                    pautas_generales: string | null
                    esta_activo: boolean | null
                    creado_en: string | null
                }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            notificaciones_preferencias: {
                Row: {
                    usuario_id: string
                    email_habilitado: boolean | null
                    push_habilitado: boolean | null
                    mensajes_habilitado: boolean | null
                    entrenamientos_habilitado: boolean | null
                    pagos_habilitado: boolean | null
                    pagos_confirmacion: boolean | null
                    clases_recordatorio: boolean | null
                    logros_nuevos: boolean | null
                    mensajes_nuevos: boolean | null
                    rutinas_nuevas: boolean | null
                    sistema: boolean | null
                }
                Insert: { [key: string]: any }
                Update: { [key: string]: any }
            }
            objetivos_del_usuario: {
                Row: {
                    id: string
                    usuario_id: string | null
                    objetivo_principal: string | null
                    peso_objetivo: number | null
                    frecuencia_entrenamiento_por_semana: number | null
                    esta_activo: boolean | null
                }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            sesiones_de_entrenamiento: {
                Row: {
                    id: string
                    usuario_id: string | null
                    rutina_id: string | null
                    estado: string | null
                    hora_inicio: string | null
                    hora_fin: string | null
                    creado_en: string | null
                }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            registros_de_ejercicio: {
                Row: {
                    id: string
                    sesion_id: string | null
                    ejercicio_id: string | null
                    series_reales: number | null
                    repeticiones_reales: string | null
                    peso_real: number | null
                    fue_completado: boolean | null
                }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            rutinas: {
                Row: { id: string; usuario_id: string | null; entrenador_id: string | null; nombre: string; estado: string | null; esta_activa: boolean | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            ejercicios: {
                Row: { id: string; rutina_id: string | null; nombre: string; grupo_muscular: string | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            horarios_de_clase: {
                Row: { id: string; actividad_id: string | null; entrenador_id: string | null; dia_de_la_semana: number | null; hora_inicio: string | null; hora_fin: string | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            asistencias: {
                Row: { id: string; usuario_id: string | null; entrada: string | null; salida: string | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            pagos: {
                Row: { id: string; usuario_id: string | null; monto: number | null; estado: string | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            mediciones: {
                Row: { id: string; usuario_id: string | null; peso: number | null; grasa_corporal: number | null; masa_muscular: number | null; registrado_en: string | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            gamificacion_del_usuario: {
                Row: { usuario_id: string; puntos: number | null; racha_actual: number | null; nivel: number | null }
                Insert: { usuario_id: string;[key: string]: any }
                Update: { usuario_id?: string;[key: string]: any }
            }
            conversaciones: {
                Row: { id: string; tipo: string | null; metadatos: Json | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
            }
            mensajes: {
                Row: { id: string; remitente_id: string | null; receptor_id: string | null; contenido: string | null; creado_en: string | null; esta_leido: boolean | null }
                Insert: { id?: string;[key: string]: any }
                Update: { id?: string;[key: string]: any }
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
