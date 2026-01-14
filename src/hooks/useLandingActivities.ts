import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Activity } from "@/types/activity";

export const useLandingActivities = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const { data, error } = await supabase
                    .from('actividades')
                    .select('*')
                    .limit(20);

                if (error) throw error;

                // Ensure data matches Activity interface
                setActivities(data as unknown as Activity[]);
            } catch (err) {
                console.error("Error fetching activities:", err);
                setError("Error al cargar actividades");
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    return { activities, loading, error };
};

