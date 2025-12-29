export interface Activity {
    id: string;
    title: string;
    instructor: string;
    time: string;
    imageUrl: string;
    type?: 'gym' | 'martial_arts' | 'tcm' | string; // Campo para segmentación
}
