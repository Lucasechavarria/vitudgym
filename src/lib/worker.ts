import { Worker } from 'bullmq';
import { getRedisConnection } from './queue';
import { aiService } from '@/services/ai.service';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Solo inicializar el worker si no estamos en fase de build
export const videoWorker = (process.env.NEXT_PHASE !== 'phase-production-build') ? new Worker(
    'video_analysis_jobs',
    async (job) => {
        const { videoId, url, ejercicioId } = job.data;

        logger.info(`Processing video ${videoId} for job ${job.id}`);

        try {
            // 1. Obtener registro del video para saber la ruta real en Storage
            const { data: videoRecord, error: fetchError } = await supabase
                .from('videos_ejercicio')
                .select('*, ejercicios(nombre)')
                .eq('id', videoId)
                .single();

            if (fetchError || !videoRecord) throw new Error("Video no encontrado en BD");

            // 2. Actualizar estado a 'procesando'
            await supabase
                .from('videos_ejercicio')
                .update({ estado: 'procesando' })
                .eq('id', videoId);

            // 3. Descargar el video de Supabase Storage
            // Asumimos que la URL es pública o tenemos acceso vía service role
            // Extraemos el path del bucket si no viene directo
            const urlObj = new URL(videoRecord.url_video);
            const pathSegments = urlObj.pathname.split('/videos_ejercicio/');
            const storagePath = pathSegments[pathSegments.length - 1];

            const { data: blob, error: downloadError } = await supabase.storage
                .from('videos_ejercicio')
                .download(storagePath);

            if (downloadError || !blob) throw new Error(`Error descargando video: ${downloadError?.message}`);

            // 4. Convertir Blob a Base64 para Gemini (inlineData)
            const buffer = Buffer.from(await blob.arrayBuffer());
            const base64Video = buffer.toString('base64');

            // 5. Llamar al servicio de IA con el video real
            const exerciseName = videoRecord.nombre_ejercicio_custom ||
                videoRecord.ejercicios?.nombre ||
                "Ejercicio desconocido";

            const analysisJson = await aiService.analyzeMovement(base64Video, blob.type, exerciseName);

            // 6. Guardar resultados estructurados
            const { error: updateError } = await supabase
                .from('videos_ejercicio')
                .update({
                    estado: 'analizado',
                    correcciones_ia: analysisJson,
                    procesado_en: new Date().toISOString()
                })
                .eq('id', videoId);

            if (updateError) throw updateError;

            logger.info(`Video ${videoId} analyzed successfully with AI`);

        } catch (error: any) {
            logger.error(`Error processing video ${videoId}:`, { error: error.message || error });

            await supabase
                .from('videos_ejercicio')
                .update({
                    estado: 'error',
                    correcciones_ia: { error: error.message || "Error desconocido en el worker" }
                })
                .eq('id', videoId);

            throw error;
        }
    },
    {
        connection: getRedisConnection(),
        concurrency: 1 // Procesar uno a la vez por ahora
    }
) : null;

if (videoWorker) {
    videoWorker.on('completed', (job) => {
        logger.info(`Job ${job.id} completed!`);
    });

    videoWorker.on('failed', (job, err) => {
        logger.error(`Job ${job?.id} failed with error: ${err.message}`, { error: err });
    });
}
