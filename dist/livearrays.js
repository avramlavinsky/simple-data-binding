/*
 * simpledatabinding - data binding ala carte, by Avram Lavinsky, copyright 2016-2017
 * @version v1.2.0
 * @link https://github.com/avramlavinsky/simple-data-binding#readme
 * @license MIT
 */
(function () {
    function LiveArrayFactory(MemberClass, removeMethodName, updateMethodName) {
        //creates an object that adds callbacks to array methods
        //for synchronization of the array members with an expected class
        //insures that all members are class instances after array methods are executed
        //ARGUMENTS
        //MemberClass: function (constructor)
        //removeMethodName: string (MemberClass method name)
        //updateMethodName: string (MemberClass method name)

        var self = this;

        this.enhance = function (array) {
            //sync the array, add the callbacks and set method
            array.update = self.update;
            self.addArrayCallBacks(array);
            array.set = function (i, val) {
                array[i] = val;
                array.update();
            };
            return array;
        };

        this.update = function () {
            //our main callback to be executed after array method calls
            var array = this;

            array.ownerInstance[updateMethodName](array.id, array, array.placeHolderNode);
            return array;
        };

        var addArrayCallBacks = function (array) {
            //add callbacks to all array methods being careful to avoid infinite loops in update methods
            var methods = ["pop", "push", "reverse", "shift", "unshift", "splice", "sort", "filter", "forEach", "reduce", "reduceRight", "copyWithin", "fill"];

            for (var i = 0, stop = methods.length; i < stop; i++) {
                addCallBack(array, methods[i], array.update);
            }
            return array;
        };

        var addCallBack = function (obj, originalMethodName, callBackMethod, context) {
            //generically add callback method in context
            var fnOriginal = obj[originalMethodName], args;

            context = context || obj;

            obj[originalMethodName] = function () {
                args = arguments;
                newMethod();
            };
            obj[originalMethodName].apply = function () {
                args = arguments[1];
                newMethod();
            };

            function newMethod() {
                var outcome;

                if (this.callingBack !== true) {
                    this.callingBack = true;
                    outcome = fnOriginal.apply(context, args);
                    callBackMethod.apply(context, arguments);
                    this.callingBack = false;
                    return outcome;
                }
            }

            return obj[originalMethodName];
        };

        /* test-code */
        this.addArrayCallBacks = addArrayCallBacks;
        this.addCallBack = addCallBack;
        window.LiveArrayFactory = LiveArrayFactory;
        /* end test-code */
    }



    var Bind = window.SimpleDataBinding, liveArrayFactory;

    if (Bind) {
        liveArrayFactory = new LiveArrayFactory(Bind, "removeChild", "updateChildArray");
        Bind.prototype.arrayEnhancer = liveArrayFactory;
    }


    window.$bind = function (container, startData, configs, id) {
        configs = configs || {};
        configs.updateInputObjects = true;
        return new SimpleDataBinding(container, startData, configs, id);
    };
})();