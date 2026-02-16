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
                    creado_en: string | null
                    actualizado_en: string | null
                    informacion_medica: Json | null
                }
                Insert: {
                    id: string
                    nombre_completo?: string | null
                    url_avatar?: string | null
                    rol?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    informacion_medica?: Json | null
                }
                Update: {
                    id?: string
                    nombre_completo?: string | null
                    url_avatar?: string | null
                    rol?: string | null
                    creado_en?: string | null
                    actualizado_en?: string | null
                    informacion_medica?: Json | null
                }
            }
            sesiones_de_entrenamiento: {
                Row: {
                    id: string
                    usuario_id: string | null
                    rutina_id: string | null
                    estado: string | null
                    hora_inicio: string | null
                    hora_fin: string | null
                    puntos_totales: number | null
                    notas: string | null
                }
                Insert: {
                    id?: string
                    usuario_id?: string | null
                    rutina_id?: string | null
                    estado?: string | null
                    hora_inicio?: string | null
                    hora_fin?: string | null
                    puntos_totales?: number | null
                    notas?: string | null
                }
                Update: {
                    id?: string
                    usuario_id?: string | null
                    rutina_id?: string | null
                    estado?: string | null
                    hora_inicio?: string | null
                    hora_fin?: string | null
                    puntos_totales?: number | null
                    notas?: string | null
                }
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
                Insert: {
                    id?: string
                    sesion_id?: string | null
                    ejercicio_id?: string | null
                    series_reales?: number | null
                    repeticiones_reales?: string | null
                    peso_real?: number | null
                    fue_completado?: boolean | null
                }
                Update: {
                    id?: string
                    sesion_id?: string | null
                    ejercicio_id?: string | null
                    series_reales?: number | null
                    repeticiones_reales?: string | null
                    peso_real?: number | null
                    fue_completado?: boolean | null
                }
            }
            mensajes: {
                Row: {
                    id: string
                    remitente_id: string | null
                    receptor_id: string | null
                    contenido: string | null
                    creado_en: string | null
                    esta_leido: boolean | null
                }
                Insert: {
                    id?: string
                    remitente_id?: string | null
                    receptor_id?: string | null
                    contenido?: string | null
                    creado_en?: string | null
                    esta_leido?: boolean | null
                }
                Update: {
                    id?: string
                    remitente_id?: string | null
                    receptor_id?: string | null
                    contenido?: string | null
                    creado_en?: string | null
                    esta_leido?: boolean | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            is_coach: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            nivel_dificultad: 'principiante' | 'intermedio' | 'avanzado' | 'todos_los_niveles'
            tipo_conversacion: 'privada' | 'soporte' | 'grupo'
        }
    }
}
