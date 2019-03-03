import {createHmac, timingSafeEqual} from "crypto";
import {Request, Response} from "express";

export function verifier(secret: string): (request: Request, response: Response, next: () => void) => void {
    return (request: Request, response: Response, next: () => void): void => {
        const request_ts = request.headers['x-slack-request-timestamp'];
        const signature_header = request.headers['x-slack-signature'];
        if (typeof request_ts != 'string' || typeof signature_header != 'string') {
            // there must only be one
            response.sendStatus(400);
            return;
        }
        if (Math.abs(Date.now() - (+request_ts)) > 60 * 5) {
            // timestamp too far
            response.sendStatus(400);
            return;
        }
        const request_body = request.body;
        const message = `v0:${request_ts}:${request_body}`;
        const hmac = createHmac('sha256', secret);
        hmac.update(message);
        const required_signature = Buffer.from('v0=' + hmac.digest('hex'));
        const provided_signature = Buffer.from(signature_header);
        if (timingSafeEqual(required_signature, provided_signature)) {
            // good.
            next();
        } else {
            response.sendStatus(400);
        }
    }
}
