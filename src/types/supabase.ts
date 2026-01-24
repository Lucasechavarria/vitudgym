export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            logros: {
                Row: {
                    id: string
                    nombre: string
                    descripcion: string | null
                    icono: string | null
                    recompensa_puntos: number | null
                    categoria: string | null
                    tipo_condicion: string | null
                    valor_condicion: number | null
                    creado_en: string | null
                }
                Insert: {
                    id?: string
                    nombre: string
                    descripcion?: string | null
                    icono?: string | null
                    recompensa_puntos?: number | null
                    categoria?: string | null
                    tipo_condicion?: string | null
                    valor_condicion?: number | null
                    creado_en?: string | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    descripcion?: string | null
                    icono?: string | null
                    recompensa_puntos?: number | null
                    categoria?: string | null
                    tipo_condicion?: string | null
                    valor_condicion?: number | null
                    creado_en?: string | null
                }
                Relationships: []
            }
            actividades: {
                Row: {
                    id: string
                    nombre: string
                    descripcion: string | null
                    tipo: string | null
                    categoria: string | null
                    url_imagen: string | null
                    duracion_minutos: number | null
                    dificultad: string | null
                    capacidad_maxima: number | null
                    esta_activa: boolean | null
                    creado_en: string | null
                    actualizado_en: string | null
                    color: string | null
                }
                Insert: {
                    id?: string
                    nombre: string
                    descripcion?: string | null
                    tipo?: string | null
                    categoria?: string | null
                    url_imagen?: string | null
                    duracion_minutos?: number | null
                    dificultad?: string | null
                    capacidad_maxima?: number | null
                    esta_activa?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    color?: string | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    descripcion?: string | null
                    tipo?: string | null
                    categoria?: string | null
                    url_imagen?: string | null
                    duracion_minutos?: number | null
                    dificultad?: string | null
                    max_capacity?: number | null
                    esta_activa?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    color?: string | null
                }
                Relationships: []
            }
            participantes_desafio: {
                Row: {
                    id: string
                    desafio_id: string | null
                    usuario_id: string | null
                    puntuacion_actual: number | null
                    estado: string | null
                    unido_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    desafio_id?: string | null
                    usuario_id?: string | null
                    puntuacion_actual?: number | null
                    estado?: string | null
                    unido_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    desafio_id?: string | null
                    usuario_id?: string | null
                    puntuacion_actual?: number | null
                    estado?: string | null
                    unido_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenge_participants_challenge_id_fkey"
                        columns: ["desafio_id"]
                        referencedRelation: "desafios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenge_participants_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            desafios: {
                Row: {
                    id: string
                    titulo: string
                    descripcion: string | null
                    reglas: string | null
                    tipo: string | null
                    recompensa_puntos: number | null
                    estado: string | null
                    creado_por: string | null
                    juez_id: string | null
                    ganador_id: string | null
                    fecha_inicio: string | null
                    fecha_fin: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    titulo: string
                    descripcion?: string | null
                    reglas?: string | null
                    tipo?: string | null
                    recompensa_puntos?: number | null
                    estado?: string | null
                    creado_por?: string | null
                    juez_id?: string | null
                    ganador_id?: string | null
                    fecha_inicio?: string | null
                    fecha_fin?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    titulo?: string
                    descripcion?: string | null
                    reglas?: string | null
                    tipo?: string | null
                    recompensa_puntos?: number | null
                    estado?: string | null
                    creado_por?: string | null
                    juez_id?: string | null
                    ganador_id?: string | null
                    fecha_inicio?: string | null
                    fecha_fin?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenges_created_by_fkey"
                        columns: ["creado_por"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_judge_id_fkey"
                        columns: ["juez_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_winner_id_fkey"
                        columns: ["winner_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reservas_de_clase: {
                Row: {
                    id: string
                    usuario_id: string
                    horario_clase_id: string
                    fecha: string
                    estado: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    horario_clase_id: string
                    fecha: string
                    estado?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    horario_clase_id?: string
                    fecha?: string
                    estado?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "class_bookings_class_schedule_id_fkey"
                        columns: ["horario_clase_id"]
                        referencedRelation: "horarios_de_clase"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "class_bookings_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            horarios_de_clase: {
                Row: {
                    id: string
                    actividad_id: string | null
                    entrenador_id: string | null
                    dia_de_la_semana: number
                    hora_inicio: string
                    hora_fin: string
                    esta_activa: boolean | null
                    creado_en: string | null
                    actualizado_en: string | null
                    notas_entrenador: string | null
                }
                Insert: {
                    id?: string
                    actividad_id?: string | null
                    entrenador_id?: string | null
                    dia_de_la_semana: number
                    hora_inicio: string
                    hora_fin: string
                    esta_activa?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    notas_entrenador?: string | null
                }
                Update: {
                    id?: string
                    actividad_id?: string | null
                    entrenador_id?: string | null
                    dia_de_la_semana?: number
                    hora_inicio?: string
                    hora_fin?: string
                    esta_activa?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    notas_entrenador?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "class_schedules_activity_id_fkey"
                        columns: ["actividad_id"]
                        referencedRelation: "actividades"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "class_schedules_coach_id_fkey"
                        columns: ["entrenador_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            asistencias: {
                Row: {
                    id: string
                    usuario_id: string
                    rol_asistencia: Database["public"]["Enums"]["user_role"]
                    entrada: string | null
                    salida: string | null
                    source: string | null
                    creado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    rol_asistencia: Database["public"]["Enums"]["user_role"]
                    entrada?: string | null
                    salida?: string | null
                    source?: string | null
                    creado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    rol_asistencia?: Database["public"]["Enums"]["user_role"]
                    entrada?: string | null
                    salida?: string | null
                    source?: string | null
                    creado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "asistencias_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            relacion_alumno_coach: {
                Row: {
                    id: string
                    usuario_id: string
                    entrenador_id: string
                    es_principal: boolean | null
                    asignado_en: string | null
                    esta_activo: boolean | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    entrenador_id: string
                    es_principal?: boolean | null
                    asignado_en?: string | null
                    esta_activo?: boolean | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    entrenador_id?: string
                    es_principal?: boolean | null
                    asignado_en?: string | null
                    esta_activo?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "relacion_alumno_coach_coach_id_fkey"
                        columns: ["entrenador_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "relacion_alumno_coach_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            conversaciones: {
                Row: {
                    id: string
                    creado_en: string | null
                    tipo: string | null
                    metadatos: Json | null
                }
                Insert: {
                    id?: string
                    creado_en?: string | null
                    tipo?: string | null
                    metadatos?: Json | null
                }
                Update: {
                    id?: string
                    creado_en?: string | null
                    tipo?: string | null
                    metadatos?: Json | null
                }
                Relationships: []
            }
            participantes_conversacion: {
                Row: {
                    conversacion_id: string
                    usuario_id: string
                    unido_en: string | null
                }
                Insert: {
                    conversacion_id: string
                    usuario_id: string
                    unido_en?: string | null
                }
                Update: {
                    conversacion_id?: string
                    usuario_id?: string
                    unido_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "participantes_conversacion_conversation_id_fkey"
                        columns: ["conversacion_id"]
                        referencedRelation: "conversaciones"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "participantes_conversacion_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            registros_de_ejercicio: {
                Row: {
                    id: string
                    sesion_id: string
                    ejercicio_id: string
                    series_reales: number | null
                    repeticiones_reales: string | null
                    peso_real: number | null
                    tiempo_descanso_segundos: number | null
                    esta_completado: boolean | null
                    calificacion_dificultad: number | null
                    creado_en: string | null
                }
                Insert: {
                    id?: string
                    sesion_id: string
                    ejercicio_id: string
                    series_reales?: number | null
                    repeticiones_reales?: string | null
                    peso_real?: number | null
                    tiempo_descanso_segundos?: number | null
                    esta_completado?: boolean | null
                    calificacion_dificultad?: number | null
                    creado_en?: string | null
                }
                Update: {
                    id?: string
                    sesion_id?: string
                    ejercicio_id?: string
                    series_reales?: number | null
                    repeticiones_reales?: string | null
                    peso_real?: number | null
                    tiempo_descanso_segundos?: number | null
                    esta_completado?: boolean | null
                    calificacion_dificultad?: number | null
                    creado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exercise_performance_logs_exercise_id_fkey"
                        columns: ["ejercicio_id"]
                        referencedRelation: "ejercicios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exercise_performance_logs_session_id_fkey"
                        columns: ["sesion_id"]
                        referencedRelation: "sesiones_de_entrenamiento"
                        referencedColumns: ["id"]
                    }
                ]
            }
            ejercicios: {
                Row: {
                    id: string
                    rutina_id: string
                    nombre: string
                    descripcion: string | null
                    grupo_muscular: string | null
                    equipamiento: string[] | null
                    series: number | null
                    repeticiones: string | null
                    descanso_segundos: number | null
                    dia_numero: number
                    orden_en_dia: number
                    instrucciones: string | null
                    url_video: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    rutina_id: string
                    nombre: string
                    descripcion?: string | null
                    grupo_muscular?: string | null
                    equipamiento?: string[] | null
                    series?: number | null
                    repeticiones?: string | null
                    descanso_segundos?: number | null
                    dia_numero: number
                    orden_en_dia: number
                    instrucciones?: string | null
                    url_video?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    rutina_id?: string
                    nombre?: string
                    descripcion?: string | null
                    grupo_muscular?: string | null
                    equipamiento?: string[] | null
                    series?: number | null
                    repeticiones?: string | null
                    descanso_segundos?: number | null
                    dia_numero?: number
                    orden_en_dia?: number
                    instrucciones?: string | null
                    url_video?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exercises_routine_id_fkey"
                        columns: ["rutina_id"]
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    }
                ]
            }
            equipamiento: {
                Row: {
                    id: string
                    nombre: string
                    categoria: string
                    marca: string | null
                    cantidad: number | null
                    esta_disponible: boolean | null
                    condicion: string | null
                    notas: string | null
                    url_imagen: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    nombre: string
                    categoria: string
                    marca?: string | null
                    cantidad?: number | null
                    esta_disponible?: boolean | null
                    condicion?: string | null
                    notas?: string | null
                    url_imagen?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    categoria?: string
                    marca?: string | null
                    cantidad?: number | null
                    esta_disponible?: boolean | null
                    condicion?: string | null
                    notas?: string | null
                    url_imagen?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: []
            }
            mediciones: {
                Row: {
                    id: string
                    usuario_id: string
                    peso: number | null
                    grasa_corporal: number | null
                    masa_muscular: number | null
                    notes: string | null
                    registrado_en: string | null
                    creado_por: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    peso?: number | null
                    grasa_corporal?: number | null
                    masa_muscular?: number | null
                    notes?: string | null
                    registrado_en?: string | null
                    creado_por?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    peso?: number | null
                    grasa_corporal?: number | null
                    masa_muscular?: number | null
                    notes?: string | null
                    registrado_en?: string | null
                    creado_por?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "measurements_created_by_fkey"
                        columns: ["creado_por"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "measurements_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            mensajes: {
                Row: {
                    id: string
                    remitente_id: string
                    receptor_id: string
                    contenido: string
                    esta_leido: boolean | null
                    leido_en: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    remitente_id: string
                    receptor_id: string
                    contenido: string
                    esta_leido?: boolean | null
                    leido_en?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    remitente_id?: string
                    receptor_id?: string
                    contenido?: string
                    esta_leido?: boolean | null
                    leido_en?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receptor_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["remitente_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
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
                    comidas: Json | null
                    suplementos: Json | null
                    litros_agua: number | null
                    pautas_generales: string | null
                    restricciones: string[] | null
                    esta_activo: boolean | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id?: string | null
                    entrenador_id?: string | null
                    calorias_diarias?: number | null
                    gramos_proteina?: number | null
                    gramos_carbohidratos?: number | null
                    gramos_grasas?: number | null
                    comidas?: Json | null
                    suplementos?: Json | null
                    litros_agua?: number | null
                    pautas_generales?: string | null
                    restricciones?: string[] | null
                    esta_activo?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string | null
                    entrenador_id?: string | null
                    calorias_diarias?: number | null
                    gramos_proteina?: number | null
                    gramos_carbohidratos?: number | null
                    gramos_grasas?: number | null
                    comidas?: Json | null
                    suplementos?: Json | null
                    litros_agua?: number | null
                    pautas_generales?: string | null
                    restricciones?: string[] | null
                    esta_activo?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "nutrition_plans_coach_id_fkey"
                        columns: ["entrenador_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "nutrition_plans_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            pagos: {
                Row: {
                    id: string
                    usuario_id: string | null
                    monto: number
                    moneda: string | null
                    concepto: string
                    metodo_pago: string
                    payment_provider: string | null
                    provider_payment_id: string | null
                    estado: string
                    aprobado_por: string | null
                    aprobado_en: string | null
                    notes: string | null
                    metadatos: Json | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id?: string | null
                    monto: number
                    moneda?: string | null
                    concepto: string
                    metodo_pago: string
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    estado?: string
                    aprobado_por?: string | null
                    aprobado_en?: string | null
                    notes?: string | null
                    metadatos?: Json | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string | null
                    monto?: number
                    moneda?: string | null
                    concepto?: string
                    metodo_pago?: string
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    estado?: string
                    aprobado_por?: string | null
                    aprobado_en?: string | null
                    notes?: string | null
                    metadatos?: Json | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_approved_by_fkey"
                        columns: ["aprobado_por"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            historial_de_cambios_de_perfil: {
                Row: {
                    id: string
                    perfil_id: string | null
                    cambiado_por: string | null
                    campo_cambiado: string
                    valor_anterior: string | null
                    valor_nuevo: string | null
                    razon: string | null
                    creado_en: string | null
                }
                Insert: {
                    id?: string
                    perfil_id?: string | null
                    cambiado_por?: string | null
                    campo_cambiado: string
                    valor_anterior?: string | null
                    valor_nuevo?: string | null
                    razon?: string | null
                    creado_en?: string | null
                }
                Update: {
                    id?: string
                    perfil_id?: string | null
                    cambiado_por?: string | null
                    campo_cambiado?: string
                    valor_anterior?: string | null
                    valor_nuevo?: string | null
                    razon?: string | null
                    creado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profile_change_history_changed_by_fkey"
                        columns: ["changed_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profile_change_history_profile_id_fkey"
                        columns: ["profile_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            perfiles: {
                Row: {
                    id: string
                    email: string
                    nombre_completo: string | null
                    url_avatar: string | null
                    telefono: string | null
                    gender: string | null
                    rol: Database["public"]["Enums"]["user_role"]
                    estado_membresia: Database["public"]["Enums"]["membership_status_enum"] | null
                    fecha_inicio_membresia: string | null
                    fecha_fin_membresia: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                    observaciones_entrenador: string | null
                    restricciones_adicionales: string | null
                    modificaciones_recomendadas: string | null
                    onboarding_completado: boolean | null
                    onboarding_completado_en: string | null
                    nombre: string | null
                    apellido: string | null
                    dni: string | null
                    direccion: string | null
                    ciudad: string | null
                    fecha_nacimiento: string | null
                    contacto_emergencia: Json | null
                    informacion_medica: Json | null
                    exencion_aceptada: boolean | null
                    fecha_exencion: string | null
                }
                Insert: {
                    id: string
                    email: string
                    nombre_completo?: string | null
                    url_avatar?: string | null
                    telefono?: string | null
                    gender?: string | null
                    rol?: Database["public"]["Enums"]["user_role"]
                    estado_membresia?: Database["public"]["Enums"]["membership_status_enum"] | null
                    fecha_inicio_membresia?: string | null
                    fecha_fin_membresia?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    observaciones_entrenador?: string | null
                    restricciones_adicionales?: string | null
                    modificaciones_recomendadas?: string | null
                    onboarding_completado?: boolean | null
                    onboarding_completado_en?: string | null
                    nombre?: string | null
                    apellido?: string | null
                    dni?: string | null
                    direccion?: string | null
                    ciudad?: string | null
                    fecha_nacimiento?: string | null
                    contacto_emergencia?: Json | null
                    informacion_medica?: Json | null
                    exencion_aceptada?: boolean | null
                    fecha_exencion?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    nombre_completo?: string | null
                    url_avatar?: string | null
                    telefono?: string | null
                    gender?: string | null
                    rol?: Database["public"]["Enums"]["user_role"]
                    estado_membresia?: Database["public"]["Enums"]["membership_status_enum"] | null
                    fecha_inicio_membresia?: string | null
                    fecha_fin_membresia?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    observaciones_entrenador?: string | null
                    restricciones_adicionales?: string | null
                    modificaciones_recomendadas?: string | null
                    onboarding_completado?: boolean | null
                    onboarding_completado_en?: string | null
                    nombre?: string | null
                    apellido?: string | null
                    dni?: string | null
                    direccion?: string | null
                    ciudad?: string | null
                    fecha_nacimiento?: string | null
                    contacto_emergencia?: Json | null
                    informacion_medica?: Json | null
                    exencion_aceptada?: boolean | null
                    fecha_exencion?: string | null
                }
                Relationships: []
            }
            registros_acceso_rutina: {
                Row: {
                    id: string
                    rutina_id: string | null
                    usuario_id: string | null
                    action: string
                    ip_address: string | null
                    user_agent: string | null
                    info_dispositivo: Json | null
                    latitude: number | null
                    longitude: number | null
                    creado_en: string | null
                    fue_resuelto: boolean | null
                    resuelto_en: string | null
                }
                Insert: {
                    id?: string
                    rutina_id?: string | null
                    usuario_id?: string | null
                    action: string
                    ip_address?: string | null
                    user_agent?: string | null
                    info_dispositivo?: Json | null
                    latitude?: number | null
                    longitude?: number | null
                    creado_en?: string | null
                    fue_resuelto?: boolean | null
                    resuelto_en?: string | null
                }
                Update: {
                    id?: string
                    rutina_id?: string | null
                    usuario_id?: string | null
                    action?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    info_dispositivo?: Json | null
                    latitude?: number | null
                    longitude?: number | null
                    creado_en?: string | null
                    fue_resuelto?: boolean | null
                    resuelto_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "routine_access_logs_routine_id_fkey"
                        columns: ["rutina_id"]
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routine_access_logs_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            rutinas: {
                Row: {
                    id: string
                    usuario_id: string
                    entrenador_id: string | null
                    nombre: string
                    descripcion: string | null
                    objetivo: string | null
                    duracion_semanas: number | null
                    generada_por_ia: boolean | null
                    prompt_ia: string | null
                    esta_activa: boolean | null
                    creado_en: string | null
                    actualizado_en: string | null
                    plan_nutricional_id: string | null
                    objetivo_usuario_id: string | null
                    estado: string | null
                    aprobado_por: string | null
                    aprobado_en: string | null
                    consideraciones_medicas: string | null
                    equipamiento_usado: string[] | null
                    contador_vistas: number | null
                    ultima_vista_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    entrenador_id?: string | null
                    nombre: string
                    descripcion?: string | null
                    objetivo?: string | null
                    duracion_semanas?: number | null
                    generada_por_ia?: boolean | null
                    prompt_ia?: string | null
                    esta_activa?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    plan_nutricional_id?: string | null
                    objetivo_usuario_id?: string | null
                    estado?: string | null
                    aprobado_por?: string | null
                    aprobado_en?: string | null
                    consideraciones_medicas?: string | null
                    equipamiento_usado?: string[] | null
                    contador_vistas?: number | null
                    ultima_vista_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    entrenador_id?: string | null
                    nombre?: string
                    descripcion?: string | null
                    objetivo?: string | null
                    duracion_semanas?: number | null
                    generada_por_ia?: boolean | null
                    prompt_ia?: string | null
                    esta_activa?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    plan_nutricional_id?: string | null
                    objetivo_usuario_id?: string | null
                    estado?: string | null
                    aprobado_por?: string | null
                    aprobado_en?: string | null
                    consideraciones_medicas?: string | null
                    equipamiento_usado?: string[] | null
                    contador_vistas?: number | null
                    ultima_vista_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "routines_approved_by_fkey"
                        columns: ["aprobado_por"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_coach_id_fkey"
                        columns: ["entrenador_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_nutrition_plan_id_fkey"
                        columns: ["plan_nutricional_id"]
                        referencedRelation: "planes_nutricionales"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_goal_id_fkey"
                        columns: ["objetivo_usuario_id"]
                        referencedRelation: "objetivos_del_usuario"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reportes_de_alumnos: {
                Row: {
                    id: string
                    usuario_id: string
                    titulo: string
                    descripcion: string | null
                    tipo: string
                    estado: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                    resuelto_en: string | null
                    resuelto_por: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    titulo: string
                    descripcion?: string | null
                    tipo: string
                    estado?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    resuelto_en?: string | null
                    resuelto_por?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    titulo?: string
                    descripcion?: string | null
                    tipo?: string
                    estado?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    resuelto_en?: string | null
                    resuelto_por?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "student_reports_resolved_by_fkey"
                        columns: ["resuelto_por"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "student_reports_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            logros_del_usuario: {
                Row: {
                    id: string
                    usuario_id: string
                    logro_id: string
                    desbloqueado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    logro_id: string
                    desbloqueado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    logro_id?: string
                    desbloqueado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_achievements_achievement_id_fkey"
                        columns: ["logro_id"]
                        referencedRelation: "logros"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_achievements_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            gamificacion_del_usuario: {
                Row: {
                    usuario_id: string
                    points: number | null
                    racha_actual: number | null
                    racha_mas_larga: number | null
                    level: number | null
                    fecha_ultima_actividad: string | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    usuario_id: string
                    points?: number | null
                    racha_actual?: number | null
                    racha_mas_larga?: number | null
                    level?: number | null
                    fecha_ultima_actividad?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    usuario_id?: string
                    points?: number | null
                    racha_actual?: number | null
                    racha_mas_larga?: number | null
                    level?: number | null
                    fecha_ultima_actividad?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_gamification_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            objetivos_del_usuario: {
                Row: {
                    id: string
                    usuario_id: string | null
                    objetivo_principal: string
                    objetivos_secundarios: string[] | null
                    peso_objetivo: number | null
                    porcentaje_grasa_corporal_objetivo: number | null
                    masa_muscular_objetivo: number | null
                    fecha_inicio: string
                    fecha_objetivo: string | null
                    frecuencia_entrenamiento_por_semana: number | null
                    tiempo_entrenamiento_preferido: string | null
                    dias_disponibles: string[] | null
                    tiempo_por_sesion_minutos: number | null
                    acceso_a_equipamiento: string[] | null
                    notas_entrenador: string | null
                    esta_activo: boolean | null
                    creado_en: string | null
                    actualizado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id?: string | null
                    objetivo_principal: string
                    objetivos_secundarios?: string[] | null
                    peso_objetivo?: number | null
                    porcentaje_grasa_corporal_objetivo?: number | null
                    masa_muscular_objetivo?: number | null
                    fecha_inicio?: string
                    fecha_objetivo?: string | null
                    frecuencia_entrenamiento_por_semana?: number | null
                    tiempo_entrenamiento_preferido?: string | null
                    dias_disponibles?: string[] | null
                    tiempo_por_sesion_minutos?: number | null
                    acceso_a_equipamiento?: string[] | null
                    notas_entrenador?: string | null
                    esta_activo?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string | null
                    objetivo_principal?: string
                    objetivos_secundarios?: string[] | null
                    peso_objetivo?: number | null
                    porcentaje_grasa_corporal_objetivo?: number | null
                    masa_muscular_objetivo?: number | null
                    fecha_inicio?: string
                    fecha_objetivo?: string | null
                    frecuencia_entrenamiento_por_semana?: number | null
                    tiempo_entrenamiento_preferido?: string | null
                    dias_disponibles?: string[] | null
                    tiempo_por_sesion_minutos?: number | null
                    acceso_a_equipamiento?: string[] | null
                    notas_entrenador?: string | null
                    esta_activo?: boolean | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_goals_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sesiones_de_entrenamiento: {
                Row: {
                    id: string
                    usuario_id: string
                    rutina_id: string
                    hora_inicio: string | null
                    hora_fin: string | null
                    estado: string | null
                    total_points: number | null
                    mood_rating: number | null
                    notes: string | null
                    creado_en: string | null
                }
                Insert: {
                    id?: string
                    usuario_id: string
                    rutina_id: string
                    hora_inicio?: string | null
                    hora_fin?: string | null
                    estado?: string | null
                    total_points?: number | null
                    mood_rating?: number | null
                    notes?: string | null
                    creado_en?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string
                    rutina_id?: string
                    hora_inicio?: string | null
                    hora_fin?: string | null
                    estado?: string | null
                    total_points?: number | null
                    mood_rating?: number | null
                    notes?: string | null
                    creado_en?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "workout_sessions_routine_id_fkey"
                        columns: ["rutina_id"]
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workout_sessions_user_id_fkey"
                        columns: ["usuario_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        },
        audit_logs: {
            Row: {
                id: string
                tabla: string
                operacion: "INSERT" | "UPDATE" | "DELETE"
                registro_id: string | null
                usuario_id: string | null
                datos_anteriores: Json | null
                datos_nuevos: Json | null
                direccion_ip: string | null
                agente_usuario: string | null
                creado_en: string | null
            }
            Insert: {
                id?: string
                tabla: string
                operacion: "INSERT" | "UPDATE" | "DELETE"
                registro_id?: string | null
                usuario_id?: string | null
                datos_anteriores?: Json | null
                datos_nuevos?: Json | null
                direccion_ip?: string | null
                agente_usuario?: string | null
                creado_en?: string | null
            }
            Update: {
                id?: string
                tabla?: string
                operacion?: "INSERT" | "UPDATE" | "DELETE"
                registro_id?: string | null
                usuario_id?: string | null
                datos_anteriores?: Json | null
                datos_nuevos?: Json | null
                direccion_ip?: string | null
                agente_usuario?: string | null
                creado_en?: string | null
            }
            Relationships: [
                {
                    foreignKeyName: "audit_logs_usuario_id_fkey"
                    columns: ["usuario_id"]
                    isOneToOne: false
                    referencedRelation: "perfiles"
                    referencedColumns: ["id"]
                }
            ]
        },
        videos_ejercicio: {
            Row: {
                id: string
                usuario_id: string
                subido_por: string
                ejercicio_id: string | null
                url_video: string
                url_thumbnail: string | null
                duracion_segundos: number | null
                estado: "subido" | "procesando" | "analizado" | "error" | null
                procesado_en: string | null
                correcciones_ia: Json | null
                puntaje_confianza: number | null
                compartido_con_alumno: boolean | null
                compartido_en: string | null
                feedback_alumno: string | null
                calificacion_alumno: number | null
                creado_en: string | null
                actualizado_en: string | null
            }
            Insert: {
                id?: string
                usuario_id: string
                subido_por: string
                ejercicio_id?: string | null
                url_video: string
                url_thumbnail?: string | null
                duracion_segundos?: number | null
                estado?: "subido" | "procesando" | "analizado" | "error" | null
                procesado_en?: string | null
                correcciones_ia?: Json | null
                puntaje_confianza?: number | null
                compartido_con_alumno?: boolean | null
                compartido_en?: string | null
                feedback_alumno?: string | null
                calificacion_alumno?: number | null
                creado_en?: string | null
                actualizado_en?: string | null
            }
            Update: {
                id?: string
                usuario_id?: string
                subido_por?: string
                ejercicio_id?: string | null
                url_video?: string
                url_thumbnail?: string | null
                duracion_segundos?: number | null
                estado?: "subido" | "procesando" | "analizado" | "error" | null
                procesado_en?: string | null
                correcciones_ia?: Json | null
                puntaje_confianza?: number | null
                compartido_con_alumno?: boolean | null
                compartido_en?: string | null
                feedback_alumno?: string | null
                calificacion_alumno?: number | null
                creado_en?: string | null
                actualizado_en?: string | null
            }
            Relationships: [
                {
                    foreignKeyName: "videos_ejercicio_usuario_id_fkey"
                    columns: ["usuario_id"]
                    isOneToOne: false
                    referencedRelation: "perfiles"
                    referencedColumns: ["id"]
                },
                {
                    foreignKeyName: "videos_ejercicio_subido_por_fkey"
                    columns: ["subido_por"]
                    isOneToOne: false
                    referencedRelation: "perfiles"
                    referencedColumns: ["id"]
                },
                {
                    foreignKeyName: "videos_ejercicio_ejercicio_id_fkey"
                    columns: ["ejercicio_id"]
                    isOneToOne: false
                    referencedRelation: "ejercicios"
                    referencedColumns: ["id"]
                }
            ]
        },
        ejercicios_equipamiento: {
            Row: {
                id: string
                ejercicio_id: string
                equipamiento_id: string
                es_opcional: boolean | null
                alternativa_id: string | null
                creado_en: string | null
            }
            Insert: {
                id?: string
                ejercicio_id: string
                equipamiento_id: string
                es_opcional?: boolean | null
                alternativa_id?: string | null
                creado_en?: string | null
            }
            Update: {
                id?: string
                ejercicio_id?: string
                equipamiento_id?: string
                es_opcional?: boolean | null
                alternativa_id?: string | null
                creado_en?: string | null
            }
            Relationships: [
                {
                    foreignKeyName: "ejercicios_equipamiento_ejercicio_id_fkey"
                    columns: ["ejercicio_id"]
                    isOneToOne: false
                    referencedRelation: "ejercicios"
                    referencedColumns: ["id"]
                },
                {
                    foreignKeyName: "ejercicios_equipamiento_equipamiento_id_fkey"
                    columns: ["equipamiento_id"]
                    isOneToOne: false
                    referencedRelation: "equipamiento"
                    referencedColumns: ["id"]
                }
            ]
        }
    }
    Views: {
        clases_con_disponibilidad: {
            Row: {
                id: string
                actividad_id: string | null
                entrenador_id: string | null
                dia_de_la_semana: number
                hora_inicio: string
                hora_fin: string
                capacidad_maxima: number
                capacidad_actual: number
                esta_activa: boolean
                nombre_actividad: string
            }
        }
        user_bookings_detailed: {
            Row: {
                id: string
                usuario_id: string
                fecha: string
                estado: string
                horario_clase_id: string
                hora_inicio: string
                hora_fin: string
                nombre_actividad: string
                nombre_entrenador: string
            }
        }
    }

}
Functions: {
    [_ in never]: never
}
Enums: {
    nivel_dificultad: "principiante" | "intermedio" | "avanzado" | "competitivo"
    tipo_conversacion: "individual" | "grupal" | "soporte"
    categoria_equipamiento: "cardio" | "fuerza" | "flexibilidad" | "accesorios" | "otros"
    estado_condicion: "nuevo" | "bueno" | "regular" | "mantenimiento" | "fuera_de_servicio"
    tipo_objetivo_principal: "perder_peso" | "ganar_musculo" | "mejorar_resistencia" | "flexibilidad" | "salud_general"
    tiempo_entrenamiento_preferido: "mañana" | "mediodia" | "tarde" | "noche"
    tipo_metodo_pago: "efectivo" | "tarjeta" | "transferencia" | "mercado_pago" | "otro"
    estado_pago: "pendiente" | "completado" | "fallido" | "reembolsado" | "cancelado"
    estado_clase: "confirmada" | "cancelada" | "asistida" | "no_asistio"
    estado_rutina: "borrador" | "pendiente_aprobacion" | "activa" | "completada" | "archivada"
    estado_sesion: "en_progreso" | "completada" | "cancelada" | "pausada"
    user_role: "admin" | "coach" | "member"
    membership_status_enum: "active" | "inactive" | "suspended" | "expired"
}
CompositeTypes: {
    [_ in never]: never
}
}
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) |
    keyof (Database[PublicTableNameOrOptions["schema"]] extends { Views: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Views"]
        : never)
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) extends { [key in TableName]: { Row: infer R } }
    ? R
    : (Database[PublicTableNameOrOptions["schema"]] extends { Views: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Views"]
        : never) extends { [key in TableName]: { Row: infer R } }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never)
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) extends { [key in TableName]: { Insert: infer I } }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never)
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) extends { [key in TableName]: { Update: infer U } }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]] extends { Enums: any }
        ? Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never)
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicEnumNameOrOptions["schema"]] extends { Enums: any }
        ? Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never) extends { [key in EnumName]: infer E }
    ? E
    : never
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[PublicCompositeTypeNameOrOptions["schema"]] extends { CompositeTypes: any }
        ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never)
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicCompositeTypeNameOrOptions["schema"]] extends { CompositeTypes: any }
        ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never) extends { [key in CompositeTypeName]: infer C }
    ? C
    : never
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
