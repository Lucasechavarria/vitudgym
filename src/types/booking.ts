/**
 * Booking and Class Types
 */

export interface Class {
    id: string;
    name: string;
    description?: string;
    coach: string;
    coachId: string;
    time: string;
    date: Date;
    duration: number; // minutes
    capacity: number;
    spotsAvailable: number;
    waitlist: string[]; // user IDs
    attendees: string[]; // user IDs
}

export interface Booking {
    id: string;
    userId: string;
    classId: string;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
    isWaitlist: boolean;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface BookingRequest {
    userId: string;
    classId: string;
}

export interface BookingResponse {
    success: boolean;
    booking?: Booking;
    message?: string;
}
