export class Mutex {
    storage: Map<string, Promise<void>>;
    constructor() {
        this.storage = new Map();
    }

    async enqueue(key: string, fn: () => Promise<void>): Promise<void> {
        const prior = this.storage.get(key);
        if (prior !== undefined) {
            const promise = prior.then(fn);
            this.storage.set(key, promise.catch((_) => {}));
            return promise;
        } else {
            const promise = fn();
            this.storage.set(key, promise.catch((_) => {}));
            return promise;
        }
    }
}
