import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Booking = Database['public']['Tables']['reservas_de_clase']['Row'];
type BookingInsert = Database['public']['Tables']['reservas_de_clase']['Insert'];
type BookingUpdate = Database['public']['Tables']['reservas_de_clase']['Update'];

/**
 * Service for managing bookings
 */
export const bookingsService = {
    /**
     * Get user bookings with details
     */
    async getUserBookings(userId: string) {
        const { data, error } = await supabase
            .from('user_bookings_detailed' as any)
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get upcoming bookings for user
     */
    async getUpcomingBookings(userId: string) {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('user_bookings_detailed' as any)
            .select('*')
            .eq('user_id', userId)
            .gte('date', today)
            .in('status', ['confirmed', 'waitlist'])
            .order('date')
            .order('start_time');

        if (error) throw error;
        return data;
    },

    /**
     * Get user's next confirmed class
     */
    async getNextClass(userId: string) {
        const bookings = await this.getUpcomingBookings(userId);
        return bookings && bookings.length > 0 ? bookings[0] : null;
    },

    /**
     * Get bookings for a specific class and date
     */
    async getClassBookings(classId: string, date: string) {
        const { data, error } = await supabase
            .from('reservas_de_clase')
            .select(`
        *,
        user:perfiles(id, full_name, email, avatar_url)
      `)
            .eq('class_schedule_id', classId)
            .eq('date', date)
            .order('created_at');

        if (error) throw error;
        return data;
    },

    /**
     * Create a new booking
     */
    async create(booking: BookingInsert) {
        // Check if class has available spots
        const { data: classData, error: classError } = await supabase
            .from('horarios_de_clase')
            .select('max_capacity, current_capacity, waitlist_enabled' as any)
            .eq('id', booking.class_schedule_id)
            .single() as { data: any; error: any };


        if (classError) throw classError;
        if (!classData) throw new Error('Class not found');

        // Determine if booking should be waitlisted
        const isWaitlist = classData.current_capacity >= classData.max_capacity;

        if (isWaitlist && !classData.waitlist_enabled) {
            throw new Error('Class is full and waitlist is not enabled');
        }

        // Get waitlist position if needed
        let waitlistPosition = null;
        if (isWaitlist) {
            const { count } = await supabase
                .from('reservas_de_clase')
                .select('*', { count: 'exact', head: true } as any)
                .eq('class_schedule_id', booking.class_schedule_id)
                .eq('date', booking.date)
                .eq('is_waitlist' as any, true);

            waitlistPosition = (count || 0) + 1;
        }

        const { data, error } = await supabase
            .from('reservas_de_clase')
            .insert({
                ...booking,
                status: isWaitlist ? 'waitlist' : 'confirmed',
            } as any)
            .select()
            .single();

        if (error) throw error;
        return data as Booking;
    },

    /**
     * Cancel a booking
     */
    async cancel(bookingId: string) {
        const { data, error } = await supabase
            .from('reservas_de_clase')
            .update({ status: 'cancelled' } as any)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Booking not found');

        // Promote waitlist if applicable
        if (data.status === 'confirmed') {
            await this.promoteFromWaitlist(data.class_schedule_id, data.date);
        }

        return data as Booking;
    },

    /**
     * Check in a user
     */
    async checkIn(bookingId: string, checkedInBy: string) {
        const { data, error } = await supabase
            .from('reservas_de_clase')
            .update({
                status: 'attended',
                checked_in_at: new Date().toISOString(),
                checked_in_by: checkedInBy,
            } as any)
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        return data as Booking;
    },

    /**
     * Promote first person from waitlist
     */
    async promoteFromWaitlist(classId: string, date: string) {
        const { data: waitlistBookings, error } = await supabase
            .from('reservas_de_clase')
            .select('*')
            .eq('class_schedule_id', classId)
            .eq('date', date)
            .eq('is_waitlist' as any, true)
            .order('waitlist_position' as any)
            .limit(1);


        if (error) throw error;
        if (!waitlistBookings || waitlistBookings.length === 0) return;

        const firstWaitlist = waitlistBookings[0];

        await supabase
            .from('reservas_de_clase')
            .update({
                status: 'confirmed',
                is_waitlist: false,
                waitlist_position: null,
            } as any)
            .eq('id', firstWaitlist.id);

        // Update positions for remaining waitlist
        const { data: remaining } = await supabase
            .from('reservas_de_clase')
            .select('*')
            .eq('class_schedule_id', classId)
            .eq('date', date)
            .eq('is_waitlist' as any, true)
            .order('waitlist_position' as any);

        if (remaining) {
            for (let i = 0; i < remaining.length; i++) {
                await supabase
                    .from('reservas_de_clase')
                    .update({ waitlist_position: i + 1 } as any)
                    .eq('id', remaining[i].id);
            }
        }
    },

    /**
     * Check if user has already booked this class
     */
    async hasUserBooked(userId: string, classId: string, date: string) {
        const { data, error } = await supabase
            .from('reservas_de_clase')
            .select('id')
            .eq('user_id', userId)
            .eq('class_schedule_id', classId)
            .eq('date', date)
            .in('status', ['confirmed', 'waitlist'])
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },
};
