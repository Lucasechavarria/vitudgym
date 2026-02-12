import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Singleton para la conexión de Redis
let redisClient: IORedis | null = null;

export function getRedisConnection() {
    if (!redisClient) {
        redisClient = new IORedis(redisUrl, {
            maxRetriesPerRequest: null,
            // Habilitar TLS si la URL es rediss:// (requerido por Upstash)
            tls: redisUrl.startsWith('rediss://') ? {} : undefined,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        redisClient.on('error', (err) => {
            // Silenciamos errores durante el build/generación estática
            if (process.env.NEXT_PHASE !== 'phase-production-build') {
                console.error('Redis Connection Error:', err);
            }
        });
    }
    return redisClient;
}

// Lazy getters para las colas
let _videoAnalysisQueue: Queue | null = null;
export function getVideoAnalysisQueue() {
    if (!_videoAnalysisQueue) {
        _videoAnalysisQueue = new Queue('video_analysis_jobs', {
            connection: getRedisConnection(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
            },
        });
    }
    return _videoAnalysisQueue;
}

let _queueEvents: QueueEvents | null = null;
export function getQueueEvents() {
    if (!_queueEvents) {
        _queueEvents = new QueueEvents('video_analysis_jobs', { connection: getRedisConnection() });
    }
    return _queueEvents;
}
