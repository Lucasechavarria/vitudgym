const { TextEncoder, TextDecoder } = require('util');
const fetch = require('node-fetch');
// Extraer clases de fetch (node-fetch v2)
const { Request, Response, Headers } = fetch;

// Polyfill para Response.json estático (requerido por NextResponse.json)
if (!Response.json) {
    Response.json = function (data, init) {
        const body = JSON.stringify(data);
        const headers = new Headers(init && init.headers);
        if (!headers.has('content-type')) {
            headers.set('content-type', 'application/json');
        }
        return new Response(body, {
            ...init,
            headers
        });
    };
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
global.fetch = fetch;
