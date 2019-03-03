export class Mutex {
    storage: Map<string, Promise<void>>;
    constructor() {
        this.storage = new Map();
    }

    async enqueue(key: string, fn: () => Promise<void>): Promise<void> {
        const prior = this.storage.get(key);
        let promise;
        if (prior !== undefined) {
            promise = prior.then(fn);
        } else {
            promise = fn();
        }
        const caught = promise.catch((_) => {})
        this.storage.set(key, caught);
        caught.then((_) => {
            if (this.storage.get(key) === caught) {
                this.storage.delete(key);
            }
        });
        return promise;
    }
}
