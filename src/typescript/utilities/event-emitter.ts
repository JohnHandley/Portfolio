export class EventEmitter {

    callbacks: any;

    /**
     * Constructor
     */
    constructor() {
        this.callbacks = {}
        this.callbacks.base = {}
    }

    /**
     * On
     */
    public on(names: string, callback: Function) {
        const that = this;

        // Errors
        if (typeof names === 'undefined' || names === '') {
            console.warn('wrong names');
            return false;
        }

        if (typeof callback === 'undefined') {
            console.warn('wrong callback');
            return false;
        }

        // Resolve names
        const resolvedNames = this.resolveNames(names)

        // Each name
        resolvedNames.forEach(function (name: string) {
            // Resolve name
            const resolvedName: any = that.resolveName(name);

            // Create namespace if not exist
            if (!(that.callbacks[resolvedName.namespace] instanceof Object)) {
                that.callbacks[resolvedName.namespace] = {};
            }

            // Create callback if not exist
            if (!(that.callbacks[resolvedName.namespace][resolvedName.value] instanceof Array)) {
                that.callbacks[resolvedName.namespace][resolvedName.value] = [];
            }
            // Add callback
            that.callbacks[resolvedName.namespace][resolvedName.value].push(callback);
        });

        return this;
    }

    /**
     * Off
     */
    off(names: string) {
        const that = this

        // Errors
        if (typeof names === 'undefined' || names === '') {
            console.warn('wrong name')
            return false
        }

        // Resolve names
        const resolvedNames = this.resolveNames(names)

        // Each name
        resolvedNames.forEach(function (name: string) {
            // Resolve name
            const resolvedName = that.resolveName(name);

            // Remove namespace
            if (resolvedName.namespace !== 'base' && resolvedName.value === '') {
                delete that.callbacks[resolvedName.namespace];
            }

            // Remove specific callback in namespace
            else {
                // Default
                if (resolvedName.namespace === 'base') {
                    // Try to remove from each namespace
                    for (const namespace in that.callbacks) {
                        if (that.callbacks[namespace] instanceof Object && that.callbacks[namespace][resolvedName.value] instanceof Array) {
                            delete that.callbacks[namespace][resolvedName.value];

                            // Remove namespace if empty
                            if (Object.keys(that.callbacks[namespace]).length === 0)
                                delete that.callbacks[namespace];
                        }
                    }
                }

                // Specified namespace
                else if (that.callbacks[resolvedName.namespace] instanceof Object && that.callbacks[resolvedName.namespace][resolvedName.value] instanceof Array) {
                    delete that.callbacks[resolvedName.namespace][resolvedName.value];

                    // Remove namespace if empty
                    if (Object.keys(that.callbacks[resolvedName.namespace]).length === 0)
                        delete that.callbacks[resolvedName.namespace];
                }
            }
        })

        return this;
    }

    /**
     * Trigger
     */
    trigger(name: string, args?: any[]) {
        // Errors
        if (typeof name === 'undefined' || name === '') {
            console.warn('wrong name')
            return false
        }

        const that = this;
        let finalResult: any = null;
        let result = null;

        // Default args
        const safeArgs = !(args instanceof Array) ? [] : args;

        // Resolve names (should on have one event)
        const resolvedNames = this.resolveNames(name);

        // Resolve name
        const resolvedName = this.resolveName(resolvedNames[0]);

        // Default namespace
        if (resolvedName.namespace === 'base') {
            // Try to find callback in each namespace
            for (const namespace in that.callbacks) {
                if (that.callbacks[namespace] instanceof Object && that.callbacks[namespace][resolvedName.value] instanceof Array) {
                    that.callbacks[namespace][resolvedName.value].forEach(function (callback: any) {
                        result = callback.apply(that, safeArgs);

                        if (typeof finalResult === 'undefined') {
                            finalResult = result;
                        }
                    });
                }
            }
        }

        // Specified namespace
        else if (this.callbacks[resolvedName.namespace] instanceof Object) {
            if (resolvedName.value === '') {
                console.warn('wrong name');
                return this;
            }

            that.callbacks[resolvedName.namespace][resolvedName.value].forEach(function (callback: any) {
                result = callback.apply(that, safeArgs);

                if (typeof finalResult === 'undefined')
                    finalResult = result;
            });
        }

        return finalResult;
    }

    /**
     * Resolve names
     */
    resolveNames(namesToResolve: string) {
        let names = namesToResolve;

        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
        names = names.replace(/[,/]+/g, ' ');

        return names.split(' ');
    }

    /**
     * Resolve name
     */
    resolveName(nameToResolve: string) {
        const parts = nameToResolve.split('.');
        const newName: {
            original: string
            value: string;
            namespace: string;
        } = {
            original: nameToResolve,
            value: parts[0],
            namespace: 'base',
        };

        // Specified namespace
        if (parts.length > 1 && parts[1] !== '') {
            newName.namespace = parts[1];
        }

        return newName;
    }
}