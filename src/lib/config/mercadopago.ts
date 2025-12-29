import MercadoPagoConfig, { Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-0000-0000-0000-000000000000'
});

export const preference = new Preference(client);

export default client;
