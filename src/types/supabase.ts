export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          actualizado_en: string | null
          categoria: string | null
          color: string | null
          creado_en: string | null
          descripcion: string | null
          duration_minutes: number | null
          esta_activa: boolean | null
          id: string
          image_url: string | null
          nombre: string
          tipo: string
        }
        Insert: {
          actualizado_en?: string | null
          categoria?: string | null
          color?: string | null
          creado_en?: string | null
          descripcion?: string | null
          duration_minutes?: number | null
          esta_activa?: boolean | null
          id?: string
          image_url?: string | null
          nombre: string
          tipo: string
        }
        Update: {
          actualizado_en?: string | null
          categoria?: string | null
          color?: string | null
          creado_en?: string | null
          descripcion?: string | null
          duration_minutes?: number | null
          esta_activa?: boolean | null
          id?: string
          image_url?: string | null
          nombre?: string
          tipo?: string
        }
        Relationships: []
      }
      asistencias: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          id: string
          role_at_time: Database["public"]["Enums"]["user_role"]
          source: string | null
          user_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          id?: string
          role_at_time: Database["public"]["Enums"]["user_role"]
          source?: string | null
          user_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          id?: string
          role_at_time?: Database["public"]["Enums"]["user_role"]
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          creator_id: string | null
          description: string | null
          end_date: string | null
          id: string
          judge_id: string | null
          points_prize: number | null
          rules: string | null
          start_date: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          judge_id?: string | null
          points_prize?: number | null
          rules?: string | null
          start_date?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          judge_id?: string | null
          points_prize?: number | null
          rules?: string | null
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
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
      equipamiento: {
        Row: {
          categoria: string | null
          created_at: string | null
          disponible: boolean | null
          estado: string | null
          id: string
          nombre: string
          ultimo_mantenimiento: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          disponible?: boolean | null
          estado?: string | null
          id?: string
          nombre: string
          ultimo_mantenimiento?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          disponible?: boolean | null
          estado?: string | null
          id?: string
          nombre?: string
          ultimo_mantenimiento?: string | null
        }
        Relationships: []
      }
      gamificación_del_usuario: {
        Row: {
          created_at: string | null
          fecha_ultima_actividad: string | null
          nivel: number | null
          puntos: number | null
          racha_actual: number | null
          racha_mas_larga: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fecha_ultima_actividad?: string | null
          nivel?: number | null
          puntos?: number | null
          racha_actual?: number | null
          racha_mas_larga?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fecha_ultima_actividad?: string | null
          nivel?: number | null
          puntos?: number | null
          racha_actual?: number | null
          racha_mas_larga?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_cambios_perfil: {
        Row: {
          changed_by: string | null
          created_at: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          profile_id: string | null
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          profile_id?: string | null
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          profile_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_change_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_change_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_notificaciones: {
        Row: {
          creado_en: string | null
          cuerpo: string
          datos: Json | null
          enviada: boolean | null
          enviada_en: string | null
          error: string | null
          id: string
          tipo: string
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          creado_en?: string | null
          cuerpo: string
          datos?: Json | null
          enviada?: boolean | null
          enviada_en?: string | null
          error?: string | null
          id?: string
          tipo: string
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          creado_en?: string | null
          cuerpo?: string
          datos?: Json | null
          enviada?: boolean | null
          enviada_en?: string | null
          error?: string | null
          id?: string
          tipo?: string
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_de_clase: {
        Row: {
          actividad_id: string | null
          capacidad_actual: number | null
          capacidad_maxima: number | null
          created_at: string | null
          dia_semana: number
          entrenador_id: string | null
          esta_activo: boolean | null
          hora_fin: string
          hora_inicio: string
          id: string
          notas: string | null
          profesor_texto: string | null
        }
        Insert: {
          actividad_id?: string | null
          capacidad_actual?: number | null
          capacidad_maxima?: number | null
          created_at?: string | null
          dia_semana: number
          entrenador_id?: string | null
          esta_activo?: boolean | null
          hora_fin: string
          hora_inicio: string
          id?: string
          notas?: string | null
          profesor_texto?: string | null
        }
        Update: {
          actividad_id?: string | null
          capacidad_actual?: number | null
          capacidad_maxima?: number | null
          created_at?: string | null
          dia_semana?: number
          entrenador_id?: string | null
          esta_activo?: boolean | null
          hora_fin?: string
          hora_inicio?: string
          id?: string
          notas?: string | null
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
      logros: {
        Row: {
          categoria: string | null
          created_at: string | null
          descripcion: string | null
          icon: string | null
          id: string
          nombre: string
          puntos_recompensa: number | null
          tipo_condicion: string | null
          valor_condicion: number | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          icon?: string | null
          id?: string
          nombre: string
          puntos_recompensa?: number | null
          tipo_condicion?: string | null
          valor_condicion?: number | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          icon?: string | null
          id?: string
          nombre?: string
          puntos_recompensa?: number | null
          tipo_condicion?: string | null
          valor_condicion?: number | null
        }
        Relationships: []
      }
      logros_del_usuario: {
        Row: {
          desbloqueado_en: string | null
          id: string
          logro_id: string | null
          user_id: string | null
        }
        Insert: {
          desbloqueado_en?: string | null
          id?: string
          logro_id?: string | null
          user_id?: string | null
        }
        Update: {
          desbloqueado_en?: string | null
          id?: string
          logro_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["logro_id"]
            isOneToOne: false
            referencedRelation: "logros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mediciones: {
        Row: {
          created_at: string | null
          grasa_corporal: number | null
          id: string
          masa_muscular: number | null
          notas: string | null
          peso: number | null
          registrado_en: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grasa_corporal?: number | null
          id?: string
          masa_muscular?: number | null
          notas?: string | null
          peso?: number | null
          registrado_en?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          grasa_corporal?: number | null
          id?: string
          masa_muscular?: number | null
          notas?: string | null
          peso?: number | null
          registrado_en?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes: {
        Row: {
          contenido: string
          conversacion_id: string | null
          created_at: string | null
          emisor_id: string
          id: string
          leido: boolean | null
          receptor_id: string
        }
        Insert: {
          contenido: string
          conversacion_id?: string | null
          created_at?: string | null
          emisor_id: string
          id?: string
          leido?: boolean | null
          receptor_id: string
        }
        Update: {
          contenido?: string
          conversacion_id?: string | null
          created_at?: string | null
          emisor_id?: string
          id?: string
          leido?: boolean | null
          receptor_id?: string
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
            columns: ["emisor_id"]
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
          creado_en: string | null
          esta_activo: boolean | null
          id: string
          objetivo_principal: string | null
          peso_objetivo: number | null
          usuario_id: string | null
        }
        Insert: {
          creado_en?: string | null
          esta_activo?: boolean | null
          id?: string
          objetivo_principal?: string | null
          peso_objetivo?: number | null
          usuario_id?: string | null
        }
        Update: {
          creado_en?: string | null
          esta_activo?: boolean | null
          id?: string
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
          aprobado_por: string | null
          concepto: string
          created_at: string | null
          estado: string
          fecha_aprobacion: string | null
          id: string
          id_pago_proveedor: string | null
          metadata: Json | null
          metodo_pago: string
          moneda: string | null
          monto: number
          notas: string | null
          proveedor_pago: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          aprobado_por?: string | null
          concepto: string
          created_at?: string | null
          estado?: string
          fecha_aprobacion?: string | null
          id?: string
          id_pago_proveedor?: string | null
          metadata?: Json | null
          metodo_pago: string
          moneda?: string | null
          monto: number
          notas?: string | null
          proveedor_pago?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          aprobado_por?: string | null
          concepto?: string
          created_at?: string | null
          estado?: string
          fecha_aprobacion?: string | null
          id?: string
          id_pago_proveedor?: string | null
          metadata?: Json | null
          metodo_pago?: string
          moneda?: string | null
          monto?: number
          notas?: string | null
          proveedor_pago?: string | null
          updated_at?: string | null
          user_id?: string | null
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
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_conversacion: {
        Row: {
          conversation_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_conversacion_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_conversacion_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_desafio: {
        Row: {
          challenge_id: string | null
          current_score: string | null
          id: string
          joined_at: string | null
          proof_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          current_score?: string | null
          id?: string
          joined_at?: string | null
          proof_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          current_score?: string | null
          id?: string
          joined_at?: string | null
          proof_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "desafios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          apellido: string | null
          ciudad: string | null
          condiciones_medicas: string[] | null
          contacto_emergencia: Json | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_telefono: string | null
          correo: string
          created_at: string | null
          descargo_aceptado: boolean | null
          direccion: string | null
          dni: string | null
          estado_membresia:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          fecha_completado_onboarding: string | null
          fecha_descargo: string | null
          fecha_fin_membresia: string | null
          fecha_inicio_membresia: string | null
          fecha_nacimiento: string | null
          genero: string | null
          id: string
          info_medica: Json | null
          lesiones: string[] | null
          medicamentos: string | null
          modificaciones_recomendadas: string | null
          nombre: string | null
          nombre_completo: string | null
          observaciones_coach: string | null
          onboarding_completado: boolean | null
          restricciones: string | null
          restricciones_adicionales: string | null
          rol: Database["public"]["Enums"]["user_role"]
          telefono: string | null
          updated_at: string | null
          url_avatar: string | null
        }
        Insert: {
          apellido?: string | null
          ciudad?: string | null
          condiciones_medicas?: string[] | null
          contacto_emergencia?: Json | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          correo: string
          created_at?: string | null
          descargo_aceptado?: boolean | null
          direccion?: string | null
          dni?: string | null
          estado_membresia?:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          fecha_completado_onboarding?: string | null
          fecha_descargo?: string | null
          fecha_fin_membresia?: string | null
          fecha_inicio_membresia?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          id: string
          info_medica?: Json | null
          lesiones?: string[] | null
          medicamentos?: string | null
          modificaciones_recomendadas?: string | null
          nombre?: string | null
          nombre_completo?: string | null
          observaciones_coach?: string | null
          onboarding_completado?: boolean | null
          restricciones?: string | null
          restricciones_adicionales?: string | null
          rol?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          updated_at?: string | null
          url_avatar?: string | null
        }
        Update: {
          apellido?: string | null
          ciudad?: string | null
          condiciones_medicas?: string[] | null
          contacto_emergencia?: Json | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          correo?: string
          created_at?: string | null
          descargo_aceptado?: boolean | null
          direccion?: string | null
          dni?: string | null
          estado_membresia?:
            | Database["public"]["Enums"]["membership_status_enum"]
            | null
          fecha_completado_onboarding?: string | null
          fecha_descargo?: string | null
          fecha_fin_membresia?: string | null
          fecha_inicio_membresia?: string | null
          fecha_nacimiento?: string | null
          genero?: string | null
          id?: string
          info_medica?: Json | null
          lesiones?: string[] | null
          medicamentos?: string | null
          modificaciones_recomendadas?: string | null
          nombre?: string | null
          nombre_completo?: string | null
          observaciones_coach?: string | null
          onboarding_completado?: boolean | null
          restricciones?: string | null
          restricciones_adicionales?: string | null
          rol?: Database["public"]["Enums"]["user_role"]
          telefono?: string | null
          updated_at?: string | null
          url_avatar?: string | null
        }
        Relationships: []
      }
      planes_nutricionales: {
        Row: {
          calorias_diarias: number | null
          comidas: Json | null
          creado_en: string | null
          entrenador_id: string | null
          esta_activo: boolean | null
          gramos_carbos: number | null
          gramos_grasas: number | null
          gramos_proteina: number | null
          id: string
          rutina_id: string | null
          suplementos: Json | null
          usuario_id: string | null
        }
        Insert: {
          calorias_diarias?: number | null
          comidas?: Json | null
          creado_en?: string | null
          entrenador_id?: string | null
          esta_activo?: boolean | null
          gramos_carbos?: number | null
          gramos_grasas?: number | null
          gramos_proteina?: number | null
          id?: string
          rutina_id?: string | null
          suplementos?: Json | null
          usuario_id?: string | null
        }
        Update: {
          calorias_diarias?: number | null
          comidas?: Json | null
          creado_en?: string | null
          entrenador_id?: string | null
          esta_activo?: boolean | null
          gramos_carbos?: number | null
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          usuario_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          usuario_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_acceso_rutina: {
        Row: {
          action: string
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: unknown
          latitude: number | null
          longitude: number | null
          routine_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          latitude?: number | null
          longitude?: number | null
          routine_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          latitude?: number | null
          longitude?: number | null
          routine_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_access_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "rutinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
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
      registros_recuperacion: {
        Row: {
          calidad_sueno: number | null
          creado_en: string
          fecha: string
          horas_sueno: number | null
          id: string
          nivel_estres: number | null
          nivel_fatiga: number | null
          notas: string | null
          usuario_id: string
        }
        Insert: {
          calidad_sueno?: number | null
          creado_en?: string
          fecha?: string
          horas_sueno?: number | null
          id?: string
          nivel_estres?: number | null
          nivel_fatiga?: number | null
          notas?: string | null
          usuario_id: string
        }
        Update: {
          calidad_sueno?: number | null
          creado_en?: string
          fecha?: string
          horas_sueno?: number | null
          id?: string
          nivel_estres?: number | null
          nivel_fatiga?: number | null
          notas?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_recuperacion_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relacion_alumno_coach: {
        Row: {
          assigned_at: string | null
          coach_id: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          coach_id?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          coach_id?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relacion_alumno_coach_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relacion_alumno_coach_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_de_alumnos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          estado: string | null
          id: string
          resuelto_en: string | null
          resuelto_por: string | null
          titulo: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          resuelto_en?: string | null
          resuelto_por?: string | null
          titulo: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          id?: string
          resuelto_en?: string | null
          resuelto_por?: string | null
          titulo?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_reports_resolved_by_fkey"
            columns: ["resuelto_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_de_clase: {
        Row: {
          created_at: string | null
          estado: string
          fecha: string
          horario_clase_id: string | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha: string
          horario_clase_id?: string | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
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
          ai_prompt: string | null
          aprobado_por: string | null
          cantidad_vistas: number | null
          consideraciones_medicas: string | null
          created_at: string | null
          duracion_semanas: number | null
          entrenador_id: string | null
          equipamiento_usado: string[] | null
          esta_activa: boolean | null
          estado: string | null
          fecha_aprobacion: string | null
          generado_por_ia: boolean | null
          id: string
          nombre: string
          objetivo: string | null
          plan_nutricional_id: string | null
          ultima_vista_en: string | null
          user_goal_id: string | null
          usuario_id: string
        }
        Insert: {
          ai_prompt?: string | null
          aprobado_por?: string | null
          cantidad_vistas?: number | null
          consideraciones_medicas?: string | null
          created_at?: string | null
          duracion_semanas?: number | null
          entrenador_id?: string | null
          equipamiento_usado?: string[] | null
          esta_activa?: boolean | null
          estado?: string | null
          fecha_aprobacion?: string | null
          generado_por_ia?: boolean | null
          id?: string
          nombre: string
          objetivo?: string | null
          plan_nutricional_id?: string | null
          ultima_vista_en?: string | null
          user_goal_id?: string | null
          usuario_id: string
        }
        Update: {
          ai_prompt?: string | null
          aprobado_por?: string | null
          cantidad_vistas?: number | null
          consideraciones_medicas?: string | null
          created_at?: string | null
          duracion_semanas?: number | null
          entrenador_id?: string | null
          equipamiento_usado?: string[] | null
          esta_activa?: boolean | null
          estado?: string | null
          fecha_aprobacion?: string | null
          generado_por_ia?: boolean | null
          id?: string
          nombre?: string
          objetivo?: string | null
          plan_nutricional_id?: string | null
          ultima_vista_en?: string | null
          user_goal_id?: string | null
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
            columns: ["user_goal_id"]
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
      membership_status_enum: "active" | "inactive" | "suspended" | "expired"
      user_role: "admin" | "coach" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      membership_status_enum: ["active", "inactive", "suspended", "expired"],
      user_role: ["admin", "coach", "member"],
    },
  },
} as const
