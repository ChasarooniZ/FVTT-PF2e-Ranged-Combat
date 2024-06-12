export class HookManager {

    /** @type Map<string, ((args) => Promise<boolean>)[]> */
    static checks = new Map();

    /** @type Map<string, ((args) => Promise<void>)[]> */
    static callbacks = new Map();

    /**
     * Register a callback for a specific key
     * 
     * @param {string} key 
     * @param {(args) => Promise<void>} callback 
     */
    static register(key, callback) {
        let callbacks = this.callbacks.get(key);
        if (!callbacks) {
            callbacks = [];
            this.callbacks.set(key, callbacks);
        }

        callbacks.push(callback);
    }

    /**
     * Register a check for a specific key
     * 
     * @param {string} key
     * @param {(args) => Promise<boolean>} check
     */
    static registerCheck(key, check) {
        let checks = this.checks.get(key);
        if (!checks) {
            checks = [];
            this.checks.set(key, checks);
        }

        checks.push(check);
    }

    /**
     * Call all the functions registered with this key, waiting for them all to be finished before continuing
     * 
     * @param {string} key
     * @param {*} args
     * 
     * @returns {boolean}
     */
    static async call(key, args) {
        let match = false;

        const callbacks = this.callbacks.get(key);
        if (callbacks) {
            for (let callback of callbacks) {
                match |= await callback(args);
            }
        }

        return match;
    }

    /**
     * Call all the check functions registered for this key. If any of them return false, return false, otherwise return true
     * 
     * @param {string} key
     * @param {*} args
     * 
     * @returns Promise<boolean>
     */
    static async runCheck(key, args) {
        const checks = this.checks.get(key);
        if (checks) {
            for (let check of checks) {
                const result = await check(args);
                if (!result) {
                    return false;
                }
            }
        }

        return true;
    }
}
