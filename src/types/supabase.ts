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
            actividades: {
                Row: {
                    actualizado_en: string | null
                    capacidad_maxima: number | null
                    categoria: string | null
                    color: string | null
                    creado_en: string | null
                    descripcion: string | null
                    dificultad: string | null
                    duracion_minutos: number | null
                    esta_activa: boolean | null
                    id: string
                    nombre: string
                    tipo: string
                    url_imagen: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    capacidad_maxima?: number | null
                    categoria?: string | null
                    color?: string | null
                    creado_en?: string | null
                    descripcion?: string | null
                    dificultad?: string | null
                    duracion_minutos?: number | null
                    esta_activa?: boolean | null
                    id?: string
                    nombre: string
                    tipo: string
                    url_imagen?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    capacidad_maxima?: number | null
                    categoria?: string | null
                    color?: string | null
                    creado_en?: string | null
                    descripcion?: string | null
                    dificultad?: string | null
                    duracion_minutos?: number | null
                    esta_activa?: boolean | null
                    id?: string
                    nombre?: string
                    tipo?: string
                    url_imagen?: string | null
                }
                Relationships: []
            }
            asistencias: {
                Row: {
                    creado_en: string | null
                    entrada: string | null
                    id: string
                    rol_asistencia: Database["public"]["Enums"]["user_role"]
                    salida: string | null
                    source: string | null
                    usuario_id: string
                }
                Insert: {
                    creado_en?: string | null
                    entrada?: string | null
                    id?: string
                    rol_asistencia: Database["public"]["Enums"]["user_role"]
                    salida?: string | null
                    source?: string | null
                    usuario_id: string
                }
                Update: {
                    creado_en?: string | null
                    entrada?: string | null
                    id?: string
                    rol_asistencia?: Database["public"]["Enums"]["user_role"]
                    salida?: string | null
                    source?: string | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "asistencias_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            audit_logs: {
                Row: {
                    agente_usuario: string | null
                    creado_en: string | null
                    datos_anteriores: Json | null
                    datos_nuevos: Json | null
                    direccion_ip: unknown
                    id: string
                    operacion: string
                    registro_id: string | null
                    tabla: string | null
                    usuario_id: string | null
                }
                Insert: {
                    agente_usuario?: string | null
                    creado_en?: string | null
                    datos_anteriores?: Json | null
                    datos_nuevos?: Json | null
                    direccion_ip?: unknown
                    id?: string
                    operacion: string
                    registro_id?: string | null
                    tabla?: string | null
                    usuario_id?: string | null
                }
                Update: {
                    agente_usuario?: string | null
                    creado_en?: string | null
                    datos_anteriores?: Json | null
                    datos_nuevos?: Json | null
                    direccion_ip?: unknown
                    id?: string
                    operacion?: string
                    registro_id?: string | null
                    tabla?: string | null
                    usuario_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "audit_logs_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            campanas_marketing: {
                Row: {
                    actualizado_en: string | null
                    contenido: string | null
                    creado_en: string | null
                    estado: string | null
                    fecha_envio: string | null
                    id: string
                    tipo: string | null
                    titulo: string
                }
                Insert: {
                    actualizado_en?: string | null
                    contenido?: string | null
                    creado_en?: string | null
                    estado?: string | null
                    fecha_envio?: string | null
                    id?: string
                    tipo?: string | null
                    titulo: string
                }
                Update: {
                    actualizado_en?: string | null
                    contenido?: string | null
                    creado_en?: string | null
                    estado?: string | null
                    fecha_envio?: string | null
                    id?: string
                    tipo?: string | null
                    titulo?: string
                }
                Relationships: []
            }
            conversaciones: {
                Row: {
                    created_at: string | null
                    id: string
                    metadata: Json | null
                    type: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    metadata?: Json | null
                    type?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    metadata?: Json | null
                    type?: string | null
                }
                Relationships: []
            }
            desafios: {
                Row: {
                    actualizado_en: string | null
                    creado_en: string | null
                    creator_id: string | null
                    descripcion: string | null
                    estado: string
                    fecha_fin: string | null
                    fecha_inicio: string | null
                    id: string
                    judge_id: string | null
                    premio_puntos: number | null
                    reglas: string | null
                    tipo: string
                    titulo: string
                }
                Insert: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    creator_id?: string | null
                    descripcion?: string | null
                    estado?: string
                    fecha_fin?: string | null
                    fecha_inicio?: string | null
                    id?: string
                    judge_id?: string | null
                    premio_puntos?: number | null
                    reglas?: string | null
                    tipo: string
                    titulo: string
                }
                Update: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    creator_id?: string | null
                    descripcion?: string | null
                    estado?: string
                    fecha_fin?: string | null
                    fecha_inicio?: string | null
                    id?: string
                    judge_id?: string | null
                    premio_puntos?: number | null
                    reglas?: string | null
                    tipo?: string
                    titulo?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "challenges_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_judge_id_fkey"
                        columns: ["judge_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            ejercicios: {
                Row: {
                    creado_en: string | null
                    descanso_segundos: number | null
                    dia_numero: number
                    equipamiento: string[] | null
                    grupo_muscular: string | null
                    id: string
                    instrucciones: string | null
                    nombre: string
                    orden_en_dia: number
                    repeticiones: string | null
                    rutina_id: string
                    series: number | null
                    url_video: string | null
                }
                Insert: {
                    creado_en?: string | null
                    descanso_segundos?: number | null
                    dia_numero: number
                    equipamiento?: string[] | null
                    grupo_muscular?: string | null
                    id?: string
                    instrucciones?: string | null
                    nombre: string
                    orden_en_dia: number
                    repeticiones?: string | null
                    rutina_id: string
                    series?: number | null
                    url_video?: string | null
                }
                Update: {
                    creado_en?: string | null
                    descanso_segundos?: number | null
                    dia_numero?: number
                    equipamiento?: string[] | null
                    grupo_muscular?: string | null
                    id?: string
                    instrucciones?: string | null
                    nombre?: string
                    orden_en_dia?: number
                    repeticiones?: string | null
                    rutina_id?: string
                    series?: number | null
                    url_video?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exercises_routine_id_fkey"
                        columns: ["rutina_id"]
                        isOneToOne: false
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                ]
            }
            ejercicios_equipamiento: {
                Row: {
                    alternativa_id: string | null
                    creado_en: string | null
                    ejercicio_id: string
                    equipamiento_id: string
                    es_opcional: boolean | null
                    id: string
                }
                Update: {
                    alternativa_id?: string | null
                    creado_en?: string | null
                    ejercicio_id?: string
                    equipamiento_id?: string
                    es_opcional?: boolean | null
                    id?: string
                }
                Insert: {
                    alternativa_id?: string | null
                    creado_en?: string | null
                    ejercicio_id: string
                    equipamiento_id: string
                    es_opcional?: boolean | null
                    id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ejercicios_equipamiento_alternativa_id_fkey"
                        columns: ["alternativa_id"]
                        isOneToOne: false
                        referencedRelation: "equipamiento"
                        referencedColumns: ["id"]
                    },
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
                    },
                ]
            }
            equipamiento: {
                Row: {
                    actualizado_en: string | null
                    categoria: string | null
                    creado_en: string | null
                    esta_disponible: boolean | null
                    estado: string | null
                    id: string
                    nombre: string
                    ultimo_mantenimiento: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    categoria?: string | null
                    creado_en?: string | null
                    esta_disponible?: boolean | null
                    estado?: string | null
                    id?: string
                    nombre: string
                    ultimo_mantenimiento?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    categoria?: string | null
                    creado_en?: string | null
                    esta_disponible?: boolean | null
                    estado?: string | null
                    id?: string
                    nombre?: string
                    ultimo_mantenimiento?: string | null
                }
                Relationships: []
            }
            gamificacion_del_usuario: {
                Row: {
                    actualizado_en: string | null
                    creado_en: string | null
                    fecha_ultima_actividad: string | null
                    nivel: number | null
                    puntos: number | null
                    racha_actual: number | null
                    racha_mas_larga: number | null
                    usuario_id: string
                }
                Insert: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    fecha_ultima_actividad?: string | null
                    nivel?: number | null
                    puntos?: number | null
                    racha_actual?: number | null
                    racha_mas_larga?: number | null
                    usuario_id: string
                }
                Update: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    fecha_ultima_actividad?: string | null
                    nivel?: number | null
                    puntos?: number | null
                    racha_actual?: number | null
                    racha_mas_larga?: number | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_gamification_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: true
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            historial_engagement: {
                Row: {
                    fecha_evento: string | null
                    id: string
                    metadatos: Json | null
                    tipo_evento: string
                    usuario_id: string
                }
                Insert: {
                    fecha_evento?: string | null
                    id?: string
                    metadatos?: Json | null
                    tipo_evento: string
                    usuario_id: string
                }
                Update: {
                    fecha_evento?: string | null
                    id?: string
                    metadatos?: Json | null
                    tipo_evento?: string
                    usuario_id?: string
                }
                Relationships: []
            }
            horarios_de_clase: {
                Row: {
                    actividad_id: string | null
                    capacidad_actual: number | null
                    capacidad_maxima: number | null
                    creado_en: string | null
                    dia_de_la_semana: number
                    entrenador_id: string | null
                    esta_activa: boolean | null
                    hora_fin: string
                    hora_inicio: string
                    id: string
                    notas_entrenador: string | null
                    profesor_texto: string | null
                }
                Insert: {
                    actividad_id?: string | null
                    capacidad_actual?: number | null
                    capacidad_maxima?: number | null
                    creado_en?: string | null
                    dia_de_la_semana: number
                    entrenador_id?: string | null
                    esta_activa?: boolean | null
                    hora_fin: string
                    hora_inicio: string
                    id?: string
                    notas_entrenador?: string | null
                    profesor_texto?: string | null
                }
                Update: {
                    actividad_id?: string | null
                    capacidad_actual?: number | null
                    capacidad_maxima?: number | null
                    creado_en?: string | null
                    dia_de_la_semana?: number
                    entrenador_id?: string | null
                    esta_activa?: boolean | null
                    hora_fin?: string
                    hora_inicio?: string
                    id?: string
                    notas_entrenador?: string | null
                    profesor_texto?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "classes_activity_id_fkey"
                        columns: ["actividad_id"]
                        isOneToOne: false
                        referencedRelation: "actividades"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "classes_coach_id_fkey"
                        columns: ["entrenador_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            mensajes: {
                Row: {
                    actualizado_en: string | null
                    contenido: string
                    conversacion_id: string | null
                    creado_en: string | null
                    esta_leido: boolean | null
                    id: string
                    receptor_id: string
                    remitente_id: string
                }
                Insert: {
                    actualizado_en?: string | null
                    contenido: string
                    conversacion_id?: string | null
                    creado_en?: string | null
                    esta_leido?: boolean | null
                    id?: string
                    receptor_id: string
                    remitente_id: string
                }
                Update: {
                    actualizado_en?: string | null
                    contenido?: string
                    conversacion_id?: string | null
                    creado_en?: string | null
                    esta_leido?: boolean | null
                    id?: string
                    receptor_id?: string
                    remitente_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "mensajes_conversation_id_fkey"
                        columns: ["conversacion_id"]
                        isOneToOne: false
                        referencedRelation: "conversaciones"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receptor_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["remitente_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notificaciones_preferencias: {
                Row: {
                    clases_recordatorio: boolean | null
                    logros_nuevos: boolean | null
                    mensajes_nuevos: boolean | null
                    pagos_confirmacion: boolean | null
                    rutinas_nuevas: boolean | null
                    sistema: boolean | null
                    updated_at: string | null
                    usuario_id: string
                }
                Insert: {
                    clases_recordatorio?: boolean | null
                    logros_nuevos?: boolean | null
                    mensajes_nuevos?: boolean | null
                    pagos_confirmacion?: boolean | null
                    rutinas_nuevas?: boolean | null
                    sistema?: boolean | null
                    updated_at?: string | null
                    usuario_id: string
                }
                Update: {
                    clases_recordatorio?: boolean | null
                    logros_nuevos?: boolean | null
                    mensajes_nuevos?: boolean | null
                    pagos_confirmacion?: boolean | null
                    rutinas_nuevas?: boolean | null
                    sistema?: boolean | null
                    updated_at?: string | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notificaciones_preferencias_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: true
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            objetivos_del_usuario: {
                Row: {
                    actualizado_en: string | null
                    creado_en: string | null
                    esta_activo: boolean | null
                    id: string
                    notas_entrenador: string | null
                    objetivo_principal: string | null
                    peso_objetivo: number | null
                    usuario_id: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    esta_activo?: boolean | null
                    id?: string
                    notas_entrenador?: string | null
                    objetivo_principal?: string | null
                    peso_objetivo?: number | null
                    usuario_id?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    esta_activo?: boolean | null
                    id?: string
                    notas_entrenador?: string | null
                    objetivo_principal?: string | null
                    peso_objetivo?: number | null
                    usuario_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_goals_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            pagos: {
                Row: {
                    actualizado_en: string | null
                    aprobado_en: string | null
                    aprobado_por: string | null
                    concepto: string
                    conteo_prorrogas: number | null
                    creado_en: string | null
                    es_prorroga: boolean | null
                    estado: string
                    fecha_vencimiento: string | null
                    fecha_vencimiento_original: string | null
                    id: string
                    id_pago_proveedor: string | null
                    metadatos: Json | null
                    metodo_pago: string
                    moneda: string | null
                    monto: number
                    notas: string | null
                    proveedor_pago: string | null
                    usuario_id: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    aprobado_en?: string | null
                    aprobado_por?: string | null
                    concepto: string
                    conteo_prorrogas?: number | null
                    creado_en?: string | null
                    es_prorroga?: boolean | null
                    estado?: string
                    fecha_vencimiento?: string | null
                    fecha_vencimiento_original?: string | null
                    id?: string
                    id_pago_proveedor?: string | null
                    metadatos?: Json | null
                    metodo_pago: string
                    moneda?: string | null
                    monto: number
                    notas?: string | null
                    proveedor_pago?: string | null
                    usuario_id?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    aprobado_en?: string | null
                    aprobado_por?: string | null
                    concepto?: string
                    conteo_prorrogas?: number | null
                    creado_en?: string | null
                    es_prorroga?: boolean | null
                    estado?: string
                    fecha_vencimiento?: string | null
                    fecha_vencimiento_original?: string | null
                    id?: string
                    id_pago_proveedor?: string | null
                    metadatos?: Json | null
                    metodo_pago?: string
                    moneda?: string | null
                    monto?: number
                    notas?: string | null
                    proveedor_pago?: string | null
                    usuario_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_approved_by_fkey"
                        columns: ["aprobado_por"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            perfiles: {
                Row: {
                    actualizado_en: string | null
                    apellido: string | null
                    ciudad: string | null
                    contacto_emergencia: Json | null
                    correo: string
                    creado_en: string | null
                    direccion: string | null
                    dni: string | null
                    estado_membresia:
                    | Database["public"]["Enums"]["membership_status_enum"]
                    | null
                    exencion_aceptada: boolean | null
                    fecha_exencion: string | null
                    fecha_fin_membresia: string | null
                    fecha_inicio_membresia: string | null
                    fecha_nacimiento: string | null
                    gender: string | null
                    id: string
                    informacion_medica: Json | null
                    modificaciones_recomendadas: string | null
                    nombre: string | null
                    nombre_completo: string | null
                    observaciones_entrenador: string | null
                    onboarding_completado: boolean | null
                    onboarding_completado_en: string | null
                    restricciones_adicionales: string | null
                    rol: Database["public"]["Enums"]["user_role"]
                    telefono: string | null
                    url_avatar: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    apellido?: string | null
                    ciudad?: string | null
                    contacto_emergencia?: Json | null
                    correo: string
                    creado_en?: string | null
                    direccion?: string | null
                    dni?: string | null
                    estado_membresia?:
                    | Database["public"]["Enums"]["membership_status_enum"]
                    | null
                    exencion_aceptada?: boolean | null
                    fecha_exencion?: string | null
                    fecha_fin_membresia?: string | null
                    fecha_inicio_membresia?: string | null
                    fecha_nacimiento?: string | null
                    gender?: string | null
                    id: string
                    informacion_medica?: Json | null
                    modificaciones_recomendadas?: string | null
                    nombre?: string | null
                    nombre_completo?: string | null
                    observaciones_entrenador?: string | null
                    onboarding_completado?: boolean | null
                    onboarding_completado_en?: string | null
                    restricciones_adicionales?: string | null
                    rol?: Database["public"]["Enums"]["user_role"]
                    telefono?: string | null
                    url_avatar?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    apellido?: string | null
                    ciudad?: string | null
                    contacto_emergencia?: Json | null
                    correo?: string
                    creado_en?: string | null
                    direccion?: string | null
                    dni?: string | null
                    estado_membresia?:
                    | Database["public"]["Enums"]["membership_status_enum"]
                    | null
                    exencion_aceptada?: boolean | null
                    fecha_exencion?: string | null
                    fecha_fin_membresia?: string | null
                    fecha_inicio_membresia?: string | null
                    fecha_nacimiento?: string | null
                    gender?: string | null
                    id?: string
                    informacion_medica?: Json | null
                    modificaciones_recomendadas?: string | null
                    nombre?: string | null
                    nombre_completo?: string | null
                    observaciones_entrenador?: string | null
                    onboarding_completado?: boolean | null
                    onboarding_completado_en?: string | null
                    restricciones_adicionales?: string | null
                    rol?: Database["public"]["Enums"]["user_role"]
                    telefono?: string | null
                    url_avatar?: string | null
                }
                Relationships: []
            }
            planes_nutricionales: {
                Row: {
                    actualizado_en: string | null
                    calorias_diarias: number | null
                    comidas: Json | null
                    creado_en: string | null
                    entrenador_id: string | null
                    esta_activo: boolean | null
                    gramos_carbohidratos: number | null
                    gramos_grasas: number | null
                    gramos_proteina: number | null
                    id: string
                    rutina_id: string | null
                    suplementos: Json | null
                    usuario_id: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    calorias_diarias?: number | null
                    comidas?: Json | null
                    creado_en?: string | null
                    entrenador_id?: string | null
                    esta_activo?: boolean | null
                    gramos_carbohidratos?: number | null
                    gramos_grasas?: number | null
                    gramos_proteina?: number | null
                    id?: string
                    rutina_id?: string | null
                    suplementos?: Json | null
                    usuario_id?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    calorias_diarias?: number | null
                    comidas?: Json | null
                    creado_en?: string | null
                    entrenador_id?: string | null
                    esta_activo?: boolean | null
                    gramos_carbohidratos?: number | null
                    gramos_grasas?: number | null
                    gramos_proteina?: number | null
                    id?: string
                    rutina_id?: string | null
                    suplementos?: Json | null
                    usuario_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "nutrition_plans_coach_id_fkey"
                        columns: ["entrenador_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "nutrition_plans_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "planes_nutricionales_rutina_id_fkey"
                        columns: ["rutina_id"]
                        isOneToOne: false
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                ]
            }
            registros_de_ejercicio: {
                Row: {
                    creado_en: string | null
                    ejercicio_id: string
                    fue_completado: boolean | null
                    id: string
                    peso_real: number | null
                    puntuacion_dificultad: number | null
                    repeticiones_reales: string | null
                    segundos_descanso_real: number | null
                    series_reales: number | null
                    sesion_id: string
                }
                Insert: {
                    creado_en?: string | null
                    ejercicio_id: string
                    fue_completado?: boolean | null
                    id?: string
                    peso_real?: number | null
                    puntuacion_dificultad?: number | null
                    repeticiones_reales?: string | null
                    segundos_descanso_real?: number | null
                    series_reales?: number | null
                    sesion_id: string
                }
                Update: {
                    creado_en?: string | null
                    ejercicio_id?: string
                    fue_completado?: boolean | null
                    id?: string
                    peso_real?: number | null
                    puntuacion_dificultad?: number | null
                    repeticiones_reales?: string | null
                    segundos_descanso_real?: number | null
                    series_reales?: number | null
                    sesion_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exercise_performance_logs_exercise_id_fkey"
                        columns: ["ejercicio_id"]
                        isOneToOne: false
                        referencedRelation: "ejercicios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exercise_performance_logs_session_id_fkey"
                        columns: ["sesion_id"]
                        isOneToOne: false
                        referencedRelation: "sesiones_de_entrenamiento"
                        referencedColumns: ["id"]
                    },
                ]
            }
            registros_nutricion: {
                Row: {
                    actualizado_en: string
                    calorias_estimadas: number | null
                    creado_en: string
                    id: string
                    ingredientes_detectados: string[] | null
                    macros: Json | null
                    nombre_comida: string
                    puntuacion_salud: number | null
                    recomendacion_tactica: string | null
                    url_imagen: string | null
                    usuario_id: string
                }
                Insert: {
                    actualizado_en?: string
                    calorias_estimadas?: number | null
                    creado_en?: string
                    id?: string
                    ingredientes_detectados?: string[] | null
                    macros?: Json | null
                    nombre_comida: string
                    puntuacion_salud?: number | null
                    recomendacion_tactica?: string | null
                    url_imagen?: string | null
                    usuario_id: string
                }
                Update: {
                    actualizado_en?: string
                    calorias_estimadas?: number | null
                    creado_en?: string
                    id?: string
                    ingredientes_detectados?: string[] | null
                    macros?: Json | null
                    nombre_comida?: string
                    puntuacion_salud?: number | null
                    recomendacion_tactica?: string | null
                    url_imagen?: string | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "registros_nutricion_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            relacion_alumno_coach: {
                Row: {
                    asignado_en: string | null
                    entrenador_id: string | null
                    es_principal: boolean | null
                    esta_activo: boolean | null
                    id: string
                    usuario_id: string
                }
                Insert: {
                    asignado_en?: string | null
                    entrenador_id?: string | null
                    es_principal?: boolean | null
                    esta_activo?: boolean | null
                    id?: string
                    usuario_id: string
                }
                Update: {
                    asignado_en?: string | null
                    entrenador_id?: string | null
                    es_principal?: boolean | null
                    esta_activo?: boolean | null
                    id?: string
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "asignaciones_coaches_coach_id_fkey"
                        columns: ["entrenador_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "asignaciones_coaches_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            reservas_de_clase: {
                Row: {
                    actualizado_en: string | null
                    creado_en: string | null
                    estado: string
                    fecha: string
                    horario_clase_id: string | null
                    id: string
                    usuario_id: string | null
                }
                Insert: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    estado?: string
                    fecha: string
                    horario_clase_id?: string | null
                    id?: string
                    usuario_id?: string | null
                }
                Update: {
                    actualizado_en?: string | null
                    creado_en?: string | null
                    estado?: string
                    fecha?: string
                    horario_clase_id?: string | null
                    id?: string
                    usuario_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_class_id_fkey"
                        columns: ["horario_clase_id"]
                        isOneToOne: false
                        referencedRelation: "classes_with_availability"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_class_id_fkey"
                        columns: ["horario_clase_id"]
                        isOneToOne: false
                        referencedRelation: "horarios_de_clase"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            rutinas: {
                Row: {
                    actualizado_en: string | null
                    aprobado_en: string | null
                    aprobado_por: string | null
                    consideraciones_medicas: string | null
                    contador_vistas: number | null
                    creado_en: string | null
                    duracion_semanas: number | null
                    entrenador_id: string | null
                    equipamiento_usado: string[] | null
                    esta_activa: boolean | null
                    estado: string | null
                    generado_por_ia: boolean | null
                    id: string
                    nombre: string
                    objetivo: string | null
                    objetivo_usuario_id: string | null
                    plan_nutricional_id: string | null
                    prompt_ia: string | null
                    ultima_vista_en: string | null
                    usuario_id: string
                }
                Insert: {
                    actualizado_en?: string | null
                    aprobado_en?: string | null
                    aprobado_por?: string | null
                    consideraciones_medicas?: string | null
                    contador_vistas?: number | null
                    creado_en?: string | null
                    duracion_semanas?: number | null
                    entrenador_id?: string | null
                    equipamiento_usado?: string[] | null
                    esta_activa?: boolean | null
                    estado?: string | null
                    generado_por_ia?: boolean | null
                    id?: string
                    nombre: string
                    objetivo?: string | null
                    objetivo_usuario_id?: string | null
                    plan_nutricional_id?: string | null
                    prompt_ia?: string | null
                    ultima_vista_en?: string | null
                    usuario_id: string
                }
                Update: {
                    actualizado_en?: string | null
                    aprobado_en?: string | null
                    aprobado_por?: string | null
                    consideraciones_medicas?: string | null
                    contador_vistas?: number | null
                    creado_en?: string | null
                    duracion_semanas?: number | null
                    entrenador_id?: string | null
                    equipamiento_usado?: string[] | null
                    esta_activa?: boolean | null
                    estado?: string | null
                    generado_por_ia?: boolean | null
                    id?: string
                    nombre?: string
                    objetivo?: string | null
                    objetivo_usuario_id?: string | null
                    plan_nutricional_id?: string | null
                    prompt_ia?: string | null
                    ultima_vista_en?: string | null
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "routines_approved_by_fkey"
                        columns: ["aprobado_por"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_coach_id_fkey"
                        columns: ["entrenador_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_nutrition_plan_id_fkey"
                        columns: ["plan_nutricional_id"]
                        isOneToOne: false
                        referencedRelation: "planes_nutricionales"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_goal_id_fkey"
                        columns: ["objetivo_usuario_id"]
                        isOneToOne: false
                        referencedRelation: "objetivos_del_usuario"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            sesiones_de_entrenamiento: {
                Row: {
                    creado_en: string | null
                    estado: string | null
                    hora_fin: string | null
                    hora_inicio: string | null
                    id: string
                    notas: string | null
                    puntos_totales: number | null
                    puntuacion_animo: number | null
                    rutina_id: string
                    usuario_id: string
                }
                Insert: {
                    creado_en?: string | null
                    estado?: string | null
                    hora_fin?: string | null
                    hora_inicio?: string | null
                    id?: string
                    notas?: string | null
                    puntos_totales?: number | null
                    puntuacion_animo?: number | null
                    rutina_id: string
                    usuario_id: string
                }
                Update: {
                    creado_en?: string | null
                    estado?: string | null
                    hora_fin?: string | null
                    hora_inicio?: string | null
                    id?: string
                    notas?: string | null
                    puntos_totales?: number | null
                    puntuacion_animo?: number | null
                    rutina_id?: string
                    usuario_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "workout_sessions_routine_id_fkey"
                        columns: ["rutina_id"]
                        isOneToOne: false
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workout_sessions_user_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            videos_ejercicio: {
                Row: {
                    actualizado_en: string | null
                    calificacion_alumno: number | null
                    compartido_con_alumno: boolean | null
                    compartido_en: string | null
                    correcciones_ia: Json | null
                    creado_en: string | null
                    duracion_segundos: number | null
                    ejercicio_id: string | null
                    estado: string | null
                    feedback_alumno: string | null
                    id: string
                    procesado_en: string | null
                    puntaje_confianza: number | null
                    subido_por: string
                    url_thumbnail: string | null
                    url_video: string
                    usuario_id: string
                    visto_por_alumno: boolean | null
                }
                Insert: {
                    actualizado_en?: string | null
                    calificacion_alumno?: number | null
                    compartido_con_alumno?: boolean | null
                    compartido_en?: string | null
                    correcciones_ia?: Json | null
                    creado_en?: string | null
                    duracion_segundos?: number | null
                    ejercicio_id?: string | null
                    estado?: string | null
                    feedback_alumno?: string | null
                    id?: string
                    procesado_en?: string | null
                    puntaje_confianza?: number | null
                    subido_por: string
                    url_thumbnail?: string | null
                    url_video: string
                    usuario_id: string
                    visto_por_alumno?: boolean | null
                }
                Update: {
                    actualizado_en?: string | null
                    calificacion_alumno?: number | null
                    compartido_con_alumno?: boolean | null
                    compartido_en?: string | null
                    correcciones_ia?: Json | null
                    creado_en?: string | null
                    duracion_segundos?: number | null
                    ejercicio_id?: string | null
                    estado?: string | null
                    feedback_alumno?: string | null
                    id?: string
                    procesado_en?: string | null
                    puntaje_confianza?: number | null
                    subido_por?: string
                    url_thumbnail?: string | null
                    url_video?: string
                    usuario_id?: string
                    visto_por_alumno?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "videos_ejercicio_ejercicio_id_fkey"
                        columns: ["ejercicio_id"]
                        isOneToOne: false
                        referencedRelation: "ejercicios"
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
                        foreignKeyName: "videos_ejercicio_usuario_id_fkey"
                        columns: ["usuario_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            classes_with_availability: {
                Row: {
                    activity_color: string | null
                    activity_id: string | null
                    activity_image: string | null
                    activity_name: string | null
                    booked_count: number | null
                    coach_id: string | null
                    coach_name: string | null
                    created_at: string | null
                    current_capacity: number | null
                    day_of_week: number | null
                    end_time: string | null
                    id: string | null
                    is_active: boolean | null
                    max_capacity: number | null
                    notes: string | null
                    start_time: string | null
                    teacher_text: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "classes_activity_id_fkey"
                        columns: ["activity_id"]
                        isOneToOne: false
                        referencedRelation: "actividades"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "classes_coach_id_fkey"
                        columns: ["coach_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_bookings_detailed: {
                Row: {
                    activity_image: string | null
                    activity_name: string | null
                    class_schedule_id: string | null
                    coach_name: string | null
                    created_at: string | null
                    date: string | null
                    day_of_week: number | null
                    end_time: string | null
                    id: string | null
                    start_time: string | null
                    status: string | null
                    user_id: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_class_id_fkey"
                        columns: ["class_schedule_id"]
                        isOneToOne: false
                        referencedRelation: "classes_with_availability"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_class_id_fkey"
                        columns: ["class_schedule_id"]
                        isOneToOne: false
                        referencedRelation: "horarios_de_clase"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Functions: {
            increment_points: {
                Args: { points_param: number; user_id_param: string }
                Returns: undefined
            }
            is_admin: { Args: never; Returns: boolean }
            is_coach: { Args: never; Returns: boolean }
        }
        Enums: {
            estado_pago: "pendiente" | "aprobado" | "rechazado" | "reembolsado"
            membership_status_enum: "active" | "inactive" | "suspended" | "expired"
            metodo_pago: "efectivo" | "tarjeta" | "transferencia" | "mercadopago"
            user_role: "admin" | "coach" | "member"
        }
    }
}
