function createInstance (constructor, argsArray) {
    var inst = Object.create(constructor.prototype || {});
    return constructor.apply(inst, argsArray || []);
}

function toType (obj) {
    // Angus Croll (http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator)
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

function toArray (obj, from) {
    return ([]).slice.call(obj, +from || 0);
}

function isSomething (val) {
    // slight twist on truthiness in which we consider only null and undefined to be falsy
    // useful for checking the existence of arguments which may legitimately be e.g. 0 or false
    var asType = toType(val);
    return asType !== 'null' && asType !== 'undefined';
}

function getOrSetFlag (flag, val) {
    if (!this.hasOwnProperty(flag)) return !!val;
    isSomething(val) && this[flag] = !!val;
    return this[flag];
}

function identityFn (val) {
    return function () {
        return val;
    }
}

function isArray (test) {
    return toType(test) === 'array';
}

function isString (test) {
    return toType(test) === 'string';
}