function LiveArrayFactory(MemberClass, createMethodName, moveMethodName, removeMethodName) {
  //creates an object that adds callbacks to array methods
  //for synchronization of the array members with an expected class
  //insures that all members are class instances after array methods are executed
  //ARGUMENTS
  //MemberClass: function (constructor)
  //createMethodName: string (must correspond to name method of MemberClass PROTOTYPE, not just a method within the constructor)
  //moveMethodName: function (MemberClass method)
  //removeMethodName: function (MemberClass method)
  
  var self = this;

  this.enhance = function(array) {
    //sync the array, add the callbacks and set method
    array.update = self.update;
    self.addArrayCallBacks(array);
    array.set = function(i, val){
      array[i] = val;
      array.update();
    };
    return array;
  };

  this.update = function() {
    //our main callback to be executed after array method calls
    var array = this,
        args = Array.prototype.slice.call(arguments),
        member, callBackArgs, i, stop;
    
    if (removeMethodName && array.priorState) {
      for(i = 0, stop = array.priorState.length; i < stop; i++){
        member = array.priorState[i];
        if (member instanceof MemberClass && array.indexOf(member) === -1) {
          callBackArgs = args.slice();
          callBackArgs.unshift(i);
          callBackArgs.unshift(array);
          member[removeMethodName].apply(member, callBackArgs);
        }
      }
    }
    for(i = 0, stop = array.length; i < stop; i++){    
      callBackArgs = args.slice(); 
      
      member = array[i];
      //take action only if the array member has changed
      if (! array.priorState || member !== array.priorState[i] || ! member || ! array.priorState[i]) {
        if (member instanceof MemberClass) {
          if (moveMethodName && array.priorState) {
            callBackArgs.unshift(i);
            callBackArgs.unshift(array);
            member[moveMethodName].apply(member, callBackArgs);
          }
        } else if(member !== undefined){
          if(createMethodName){
            callBackArgs.unshift.apply(callBackArgs, [member, array, i]);
            array[i] = MemberClass.prototype[createMethodName].apply(array, callBackArgs);
          }else{
            //techniques of using apply with constructor make for odd reporting of the constructor name in developer tools
            //so just limit arguments to seven total here
            array[i] = new MemberClass(member, array, i, callBackArgs[0], callBackArgs[1], callBackArgs[2], callBackArgs[3], callBackArgs[4]);
          }
        }
      }
    }
    array.priorState = array.slice();
    return array;
  };

  this.addArrayCallBacks = function(array) {
    //add callbacks to all array methods being careful to avoid infinite loops in update methods
    var methods = ["pop", "push", "reverse", "shift", "unshift", "splice", "sort", "filter", "forEach", "reduce", "reduceRight", "copyWithin", "fill"];
    
    for(var i = 0, stop = methods.length; i < stop; i++){
      if(typeof(array[methods[i]]) === "function"){
        self.addCallBack(array, methods[i], array.update);
      }
    }
    return array;
  };

  this.addCallBack = function(obj, originalMethodName, callBackMethod, context) {
    //generically add callback method in context
    var fnOriginal = obj[originalMethodName];

    context = context || obj;

    obj[originalMethodName] = function() {
      var outcome = fnOriginal.apply(this, arguments);

      callBackMethod.apply(this, arguments);
      return outcome;
    };
    return obj[originalMethodName];
  };
}


(function () {
    var liveArrayFactory;

    if (window.SimpleDataBinding) {
        window.SimpleDataBinding.prototype.createLiveArrayMember = function (data, array, i) {
            //called in the context of the array since no instance exists yet
            var placeholder = (array[i + 1] && array[i + 1].container) || array.placeholder;
            return array.ownerInstance.createChildArrayMember(array, data, null, placeholder);
        };
        window.SimpleDataBinding.prototype.moveLiveArrayMember = function (array, i) {
            var placeholder = (array[i + 1] && array[i + 1].container) || array.placeholder;
            this.container.parentElement.insertBefore(this.container, placeholder);
            return this;
        };
        window.SimpleDataBinding.prototype.removeLiveArrayMember = function () {
            this.container.parentElement.removeChild(this.container);
            return this;
        };
        liveArrayFactory = new LiveArrayFactory(window.SimpleDataBinding, "createLiveArrayMember", "moveLiveArrayMember", "removeLiveArrayMember");
        window.SimpleDataBinding.prototype.arrayEnhancer = liveArrayFactory;
    }
})();
