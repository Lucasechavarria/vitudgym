import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { videoAnalysisQueue } from '@/lib/queue';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Verificar sesión y rol
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

        if (profile?.rol !== 'coach' && profile?.rol !== 'admin') {
            return NextResponse.json({ error: 'Solo entrenadores pueden subir videos' }, { status: 403 });
        }

        const formData = await req.formData();
        const videoFile = formData.get('video') as File;
        const usuarioId = formData.get('usuarioId') as string;
        const ejercicioId = formData.get('ejercicioId') as string;
        const exerciseName = formData.get('exerciseName') as string;

        if (!videoFile || !usuarioId) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // Validar tipo de archivo (solo video)
        if (!videoFile.type.startsWith('video/')) {
            return NextResponse.json({ error: 'El archivo debe ser un video' }, { status: 400 });
        }

        // 1. Subir a Supabase Storage
        const fileName = `${Date.now()}_${videoFile.name} `;
        const filePath = `${usuarioId}/${fileName}`;

        const { data: storageData, error: storageError } = await supabase.storage
            .from('videos_ejercicio')
            .upload(filePath, videoFile);

        if (storageError) {
            throw storageError;
        }

        // Obtener URL pública (o firmada si es privado)
        const { data: { publicUrl } } = supabase.storage
            .from('videos_ejercicio')
            .getPublicUrl(filePath);

        // 2. Registrar en la tabla videos_ejercicio
        const { data: videoRecord, error: dbError } = await supabase
            .from('videos_ejercicio')
            .insert({
                usuario_id: usuarioId,
                subido_por: session.user.id,
                ejercicio_id: ejercicioId || null,
                nombre_ejercicio_custom: exerciseName || null,
                url_video: publicUrl,
                estado: 'subido'
            })
            .select()
            .single();

        if (dbError) {
            throw dbError;
        }

        // 3. Encolar trabajo de análisis
        await videoAnalysisQueue.add('analyze_video', {
            videoId: videoRecord.id,
            url: publicUrl,
            ejercicioId: ejercicioId || null,
            exerciseName: exerciseName || null
        });

        return NextResponse.json({
            success: true,
            videoId: videoRecord.id,
            message: 'Video subido y encolado para análisis'
        });

    } catch (error: any) {
        console.error('Error in upload route:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
