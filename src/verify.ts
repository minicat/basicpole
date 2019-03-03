import {createHmac, timingSafeEqual} from "crypto";
import {IncomingMessage, ServerResponse} from "http";

export class ValidationError extends Error {}

export function verifier(secret: string): (request: IncomingMessage, response: ServerResponse, body: Buffer, encoding: string) => void {
    return (request: IncomingMessage, _response: ServerResponse, body: Buffer, _encoding: string): void => {
        const request_ts = request.headers['x-slack-request-timestamp'];
        const signature_header = request.headers['x-slack-signature'];
        if (typeof request_ts != 'string' || typeof signature_header != 'string') {
            throw new ValidationError("Bad headers");
        }
        if (Math.abs(Date.now() / 1000 - (+request_ts)) > 60 * 5) {
            // timestamp too far
            throw new ValidationError("Bad timestamp");
        }
        const hmac = createHmac('sha256', secret);
        hmac.update(`v0:${request_ts}:`);
        hmac.update(body);
        const required_signature = Buffer.from('v0=' + hmac.digest('hex'));
        const provided_signature = Buffer.from(signature_header);
        if (!timingSafeEqual(required_signature, provided_signature)) {
            throw new ValidationError("Bad signature");
        }
    }
}
