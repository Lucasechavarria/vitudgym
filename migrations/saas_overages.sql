-- Añadir precios por exceso a los planes
ALTER TABLE public.planes_suscripcion 
ADD COLUMN IF NOT EXISTS precio_alumno_extra NUMERIC(10,2) DEFAULT 0.50,
ADD COLUMN IF NOT EXISTS precio_sede_extra NUMERIC(10,2) DEFAULT 20.00;

-- Actualizar planes existentes con valores razonables
UPDATE public.planes_suscripcion SET precio_alumno_extra = 0.80, precio_sede_extra = 25.00 WHERE nombre = 'Básico';
UPDATE public.planes_suscripcion SET precio_alumno_extra = 0.50, precio_sede_extra = 20.00 WHERE nombre = 'Pro';
UPDATE public.planes_suscripcion SET precio_alumno_extra = 0.30, precio_sede_extra = 15.00 WHERE nombre = 'Elite';
