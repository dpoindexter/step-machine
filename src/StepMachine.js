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
        var self = this;

        if (!self.steps.hasOwnProperty(fromStep)) throw new Error('Invalid transition: FromStep "{0}" is not defined.');
        if (!self.steps.hasOwnProperty(toStep)) throw new Error('Invalid transition: ToStep "{0}" is not defined.');

        fromStep = self[fromStep];
        toStep = self[toStep];

        self.isTransitioning(true);

        $.when(fromStep._validate)
            .then(fromStep._exit)
            .then(toStep._enter)
            .done(function () {
                fromStep.isActive(false);
                self.publish('step.exited', fromStep);
                self.publish('step.entered', toStep);
            }).fail(function (failure) {
                self.publish('step.failedtransition', {from: fromStep, to: toStep, failure: failure});
            }).always(function () {
                self.isTransitioning(false);
            });
    }

};