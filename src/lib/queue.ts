import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
});

// Cola para análisis de video
export const videoAnalysisQueue = new Queue('video_analysis_jobs', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    },
});

// Eventos de la cola (opcional, para logging)
export const queueEvents = new QueueEvents('video_analysis_jobs', { connection });
