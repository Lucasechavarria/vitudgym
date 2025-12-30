export interface ChatParticipant {
    id: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
}

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_pending?: boolean;
}
