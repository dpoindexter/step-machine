var Step = function (parent, name) {
    this.parent = parent;
    this.name = name;
    this.model = null;

    this._ctor = null;
    this._enterQueue = [];
    this._exitQueue = [];
    this._initializeQueue = [];
    this._validationQueue = [];
    this._listeners = {};

    this._isInitialized = false;
    this._isActive = false;
    this._isValid = false;
    this._isComplete = false;
};

Step.prototype = (function () {

    function _initialize () {
        var self = this;

        this.model = createInstance(this._ctor, this._ctor._initializeWith);
        var onInit = this._runQueue('_initializeQueue');

        onInit.then(function () {
            self.isInitialized(true);
        });

        return onInit;
    };

    function _enter () {
        if (!this.isInitialized()) this._initialize();
        return this._runQueue('_enterQueue');
    };

    function _validate () {
        var validationResult = $.Deferred();

        this._runQueue('_validationQueue')
            .done(function () {
                var passed = utils.toArray(arguments).every(function (x) {
                    return utils.isArray(x) ? x[0] : x;
                });

                if (passed) {
                    validationResult.resolve();
                } else {
                    validationResult.reject();
                }
            }).fail(function () {
                validationResult.reject();
            });

        return validationResult;
    };

    function _exit () {
        return this._runQueue('_exitQueue');
    };

    function _runQueue (which) {
        if (!this.hasOwnProperty(which)) return;

        var runQueue = this[which].filter(function (fn) {
            return fn(this);
        }.bind(this));

        return $.when.apply($, runQueue);
    };

    return {
        model: function model (model) {
            this.model = model;
            this.isInitialized(true);
            return this;
        },

        constructor: function constructor (ctor) {
            this._ctor = ctor;
            var initArgs = uship.utils.toArray(arguments, 1);
            if (initArgs.length) this._ctor._initializeWith = initArgs;
            return this;
        },

        transition: function transition (step) {
            parent.move(this, step);
        },

        onInitialize: function onInitialize (fn) {
            this._initializeQueue.push(fn);
            return this;
        },

        onEnter: function onEnter (fn) {
            this._enterQueue.push(fn);
            return this;
        },

        onValidate: function onValidate () {
            this._validationQueue.push(fn);
            return this;
        },

        onExit: function onExit (fn) {
            this._exitQueue.push(fn);
            return this;
        },

        on: function on (eventNameOrHash, fn) {
            var eventsHash = {};

            if (typeof eventNameOrHash === 'string') {
                eventsHash[eventNameOrHash] = fn;
            } else {
                eventsHash = eventNameOrHash;
            }

            for (var ev in eventsHash) {
                if (eventsHash.hasOwnProperty(ev)) {
                    this._listeners[ev] = parent.subscribe(function () {
                        funcOrHash.apply(this, arguments);
                    }.bind(this));
                }
            }
            return this;
        },

        remove: function remove (eventName) {
            if (!this._listeners.hasOwnProperty(eventName)) return;
            this._listeners[eventName].dispose();
        },

        as: function as (mixin) {
            mixin.call(this);
            return this;
        },

        isInitialized: function isInitialized (val) {
            utils.getOrSetFlag.call(this, '_isInitialized', val);
        },

        isActive: function isInitialized (val) {
            utils.getOrSetFlag.call(this, '_isActive', val);
        },

        isValid: function isInitialized (val) {
            utils.getOrSetFlag.call(this, '_isValid', val);
        },

        isComplete: function isInitialized (val) {
            utils.getOrSetFlag.call(this, '_isComplete', val);
        }
    }
}());