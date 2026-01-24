'use client';

import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MessageBubbleProps {
    content: string;
    isOwn: boolean;
    timestamp: string;
}

export function MessageBubble({ content, isOwn, timestamp }: MessageBubbleProps) {
    return (
        <div className={clsx("flex flex-col mb-4", isOwn ? "items-end" : "items-start")}>
            <div
                className={clsx(
                    "max-w-[70%] px-4 py-2 rounded-lg text-sm",
                    isOwn
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                )}
            >
                <p>{content}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1 px-1">
                {format(new Date(timestamp), 'HH:mm', { locale: es })}
            </span>
        </div>
    );
}
