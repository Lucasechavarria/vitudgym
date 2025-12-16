import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

/**
 * Service for managing bookings
 */
export const bookingsService = {
    /**
     * Get user bookings with details
     */
    async getUserBookings(userId: string) {
        const { data, error } = await supabase
            .from('user_bookings_detailed')
            .select('*')
            .eq('user_id', userId)
            .order('booking_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get upcoming bookings for user
     */
    async getUpcomingBookings(userId: string) {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('user_bookings_detailed')
            .select('*')
            .eq('user_id', userId)
            .gte('booking_date', today)
            .in('status', ['confirmed', 'waitlist'])
            .order('booking_date')
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
            .from('bookings')
            .select(`
        *,
        user:profiles(id, full_name, email, avatar_url)
      `)
            .eq('class_id', classId)
            .eq('booking_date', date)
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
            .from('classes')
            .select('max_capacity, current_capacity, waitlist_enabled')
            .eq('id', booking.class_id)
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
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', booking.class_id)
                .eq('booking_date', booking.booking_date)
                .eq('is_waitlist', true);

            waitlistPosition = (count || 0) + 1;
        }

        const { data, error } = await (supabase
            .from('bookings') as any)
            .insert({
                ...booking,
                status: isWaitlist ? 'waitlist' : 'confirmed',
                is_waitlist: isWaitlist,
                waitlist_position: waitlistPosition,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Booking;
    },

    /**
     * Cancel a booking
     */
    async cancel(bookingId: string) {
        const { data, error } = await (supabase
            .from('bookings') as any)
            .update({ status: 'cancelled' })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Booking not found');

        // Promote waitlist if applicable
        if (data.status === 'confirmed') {
            await this.promoteFromWaitlist(data.class_id, data.booking_date);
        }

        return data as Booking;
    },

    /**
     * Check in a user
     */
    async checkIn(bookingId: string, checkedInBy: string) {
        const { data, error } = await (supabase
            .from('bookings') as any)
            .update({
                status: 'attended',
                checked_in_at: new Date().toISOString(),
                checked_in_by: checkedInBy,
            })
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
            .from('bookings')
            .select('*')
            .eq('class_id', classId)
            .eq('booking_date', date)
            .eq('is_waitlist', true)
            .order('waitlist_position')
            .limit(1);

        if (error) throw error;
        if (!waitlistBookings || waitlistBookings.length === 0) return;

        const firstWaitlist = waitlistBookings[0];

        await (supabase
            .from('bookings') as any)
            .update({
                status: 'confirmed',
                is_waitlist: false,
                waitlist_position: null,
            })
            .eq('id', firstWaitlist.id);

        // Update positions for remaining waitlist
        const { data: remaining } = await supabase
            .from('bookings')
            .select('*')
            .eq('class_id', classId)
            .eq('booking_date', date)
            .eq('is_waitlist', true)
            .order('waitlist_position');

        if (remaining) {
            for (let i = 0; i < remaining.length; i++) {
                await (supabase
                    .from('bookings') as any)
                    .update({ waitlist_position: i + 1 })
                    .eq('id', remaining[i].id);
            }
        }
    },

    /**
     * Check if user has already booked this class
     */
    async hasUserBooked(userId: string, classId: string, date: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', userId)
            .eq('class_id', classId)
            .eq('booking_date', date)
            .in('status', ['confirmed', 'waitlist'])
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },
};
