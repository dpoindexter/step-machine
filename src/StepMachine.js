

var StepMachine = function () {
    this.steps = {};
    this._isTransitioning = false;
};

StepMachine.prototype = {

    define: function define (stepName) {
        this.steps[stepName] = new Step(this, stepName);
        return this.steps[stepName];
    },

    isTransitioning: function isInitialized (val) {
        utils.getOrSetFlag.call(this, '_isTransitioning', val);
    },

    _move: function _move (fromStep, toStep) {

        if (!this.steps.hasOwnProperty(fromStep)) throw new Error('Invalid transition: FromStep "{0}" is not defined.');
        if (!this.steps.hasOwnProperty(toStep)) throw new Error('Invalid transition: ToStep "{0}" is not defined.');

        fromStep = this[fromStep];
        toStep = this[toStep];

        var self = this;

        this.isTransitioning(true);

        $.when(fromStep._validate)
            .then(fromStep._exit)
            .then(toStep._enter)
            .done(function () {
                fromStep.isActive(false);
                this.publish('step.exited', fromStep);
                this.publish('step.entered', toStep);
            }).fail(function (failure) {
                this.publish('step.failedtransition', {from: fromStep, to: toStep, failure: failure});
            }).always(function () {
                self.isTransitioning(false);
            });
    }

};