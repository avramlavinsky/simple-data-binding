function SimpleDataBinding(el, startData, configs) {
  //binds data to and from form controls or to static element text nodes
  //el:  element or string selector (optional) - container element for the two way binding instance  (if not present defaults to first [namespace]-databind attribute)
  //startData: object (optional)
  //configs: object (optional) - contains callback functions and  static configuration properties
  //  nameSpace: string - appended to data prevent dataset name collisions"
  //  dataChangeCallBack: function - is called on all data changes passing property name value, and aggregate data
  //  [specificProperty]CallBack: function -  called when value of [specificProperty] within data changes
  //  delimmiter: string - separates selected checkbox values

  var self = this;


  //<<<< Core Data Methods >>>>

  this.set = function(prop, val) {
    //setter
    self.data[self.toPrefixedCamel(prop)] = val;
    return prop;
  };

  this.get = function(prop) {
    //getter
    return self.data[self.toPrefixedCamel(prop)];
  };

  this.update = function(newData) {
    //sets all values present in newData object to data
    self.updating = true;
    for (var prop in newData) {
      if (typeof(newData[prop]) == "object") {
        self.branches[prop] = new SimpleDataBinding('[' + self.toPrefixedHyphenated('databind') + '="' + prop + '"]', newData[prop], self.configs);
      } else {
        self.set(prop, newData[prop]);
      }
    }
    setTimeout(function() {
      self.updating = false;
      self.previousData = self.assign({}, self.data);
    }, 0);

    return self.data;
  };

  this.prefixData = function(dataset) {
    //prefix data property names with namespace as needed
    for (var prop in dataset) {
      if (prop.substring(0, self.nameSpace.length) != self.nameSpace) {
        self.set(prop, dataset[prop]);
        delete dataset[prop];
      }
    }
    return dataset;
  };

  this.unprefixData = function(obj) {
    //remove namespace prefix from data property names
    if (self.nameSpace) {
      for (var prop in obj) {
        obj[self.toUnprefixedCamel(prop)] = obj[prop];
        delete obj[prop];
      }
    }
    return obj;
  };
  
  this.assign = Object.assign || function(obj1, obj2){
  //polyfill for Object.assign
    for (var prop in obj2){
      obj1[prop] = obj2[prop];
    }
    return obj1;
  };

  this.export = function() {
    //creates an (unbound) clone of data
    //recreates nesting via recursion
    //removes namespace from property names
    var dataClone = self.unprefixData(self.assign({}, self.data));

    for (branch in self.branches) {
      dataClone[branch] = self.branches[branch].export();
    }
    return dataClone;
  };


  //<<<<< String Utilities >>>>>

  this.toCamelCase = function(str) {
    //converts hyphenated to camel case
    return str.replace(/-([a-z])/gi, function(s, group1) {
      return group1.toUpperCase();
    });
  };

  this.toHyphenated = function(str) {
    //converts camel case to hyphenated lower case
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  };

  this.toPrefixedCamel = function(str) {
    //prefixes camel case string with namespace if not already prefixed
    if (str && str.substring(0, self.nameSpace.length) != self.nameSpace) {
      str = self.nameSpace + str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str;
  };

  this.toPrefixedHyphenated = function(str) {
    //prefixes hyphenated string with namespace
    return self.nameSpace ? self.hyphenated(self.nameSpace) + "-" : "" + str;
  };

  this.toUnprefixedCamel = function(str) {
    //strips the namespace from camel strings
    str = str.substring(self.nameSpace.length);
    return str.charAt(0).toLowerCase() + str.slice(1);
  };


  //<<< DOM Methods >>>

  this.setDomProp = function(prop) {
    //look for form control names matching property
    //or data-text attribute values matching property
    //and update the nodes that match

    var value = self.get(prop);

    self.eachDomNode("name", prop, self.setNodeValue, [value], true);
    self.eachDomNode(self.toPrefixedHyphenated("val"), prop, self.setNodeValue, [value]);
    self.eachDomNode(self.toPrefixedHyphenated("text"), prop, function(el, i, val) {
      self.setNodeText(el, val);
    }, [value]);
  };

  this.setNodeValue = function(el, i, value) {
    if (el.type == "radio") {
      el.checked = (value == el.value);
    } else if (el.type == "checkbox") {
      el.checked = (value.indexOf(el.value) != -1);
    } else {
      el.value = value;
    }
  };

  this.setNodeText = function(el, value) {
    if (el) {
      for (var i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeName === "#text") {
          el.childNodes[i].nodeValue = "";
        } else {
          break;
        }
      }
      if (i === 0) {
        el.innerText = value;
      } else {
        el.childNodes[i - 1].nodeValue = value;
      }
    }
  };

  this.eachDomNode = function(prop, value, fn, additionalArgs, explicit) {
    //dom collection iterator
    var selector, nodes, args;

    if (typeof(value) === "string") {
      selector = '[' + prop + '="' + value + '"]';
    } else {
      selector = '[' + prop + ']';
    }

    nodes = self.container.querySelectorAll(selector);

    for (var i = 0, stop = nodes.length; i < stop; i++) {
      args = [nodes[i], i];
      args.push.apply(args, additionalArgs || []);
      fn.apply(self, args);
    }
  };

  this.getNodeValue = function(el) {
    var val = "";

    if (el.type == "radio") {
      if (el.checked) {
        val = el.value;
      }
    } else if (el.type == "checkbox") {
      val = self.data[el.getAttribute("data-" + self.nameSpace + "value") || el.name] || "";
      val = val ? val.split(self.delimiter) : [];
      if (el.checked) {
        val.push(el.value);
      } else {
        val.splice(val.indexOf(el.value), 1);
      }
      val = val.join(self.delimiter);
    } else {
      val = el.value;
    }
    return val;
  };

  this.getInitialNodeValues = function() {
    self.eachDomNode("name", null, function(el) {
      if (el.getAttribute("value")) {
        self.set(el.name, self.getNodeValue(el));
      }
    }, [], true);
    self.eachDomNode(self.toPrefixedHyphenated("val"), null, function(el) {
      if (el.getAttribute("value")) {
        self.set(el.getAttribute(self.toPrefixedHyphenated("val")), el.value);
      }
    });
    return self.data;
  };



  //<<<<<< Listeners & Handlers >>>>>>

  this.setListeners = function() {
    //listen for changes in the container element's dataset
    this.observer = new MutationObserver(this.mutationHandler);
    this.observer.observe(self.container, {
      attributes: true,
      childList: true,
      characterData: true
    });

    //listen for form control changes within our container
    this.container.addEventListener("change", this.changeHandler);
  };

  this.mutationHandler = function(mutations) {
    //on mutation of the dataset updates dom and fire callbacks as needed 

    mutations.forEach(function(mutation) {
      var prefix = "data-",
        prop;

      if (self.nameSpace) {
        prefix += self.nameSpace + "-";
      }
      prop = self.toCamelCase(mutation.attributeName.substr(prefix.length));

      self.setDomProp(prop);
      self.dataChangeHandler(prop);
    });
    return mutations;
  };

  this.changeHandler = function(e) {
    //handles changes to form control values within the container
    var val = self.getNodeValue(e.target),
      prop = e.target.getAttribute(self.toPrefixedHyphenated("val")) || e.target.name;

    e.stopPropagation();
    if (prop) {
      return self.set(prop, val);
    }
  };

  this.dataChangeHandler = function(prop) {
    //verify changes to data and execute callbacks appropriately
    var val = self.get(prop);

    if (self.initialized && self.previousData && self.previousData[prop] != val) {
      if (self.configs.dataChangeCallBack) {
        self.callBack("dataChange", [prop, val, self.data]);
      }
      if (self.configs[prop + "CallBack"]) {
        self.callBack(prop, [val]);
      }
    }

    if (!self.updating) {
      self.previousData = JSON.parse(JSON.stringify(this.data));
    }

    return val;
  };

  this.callBack = function(stem, args) {
    //executes a callback function in the context of the data binder
    var fn = self.configs[stem + "CallBack"];

    return fn.apply(this, args);
  };


  //<<<<<<<<< Initialization >>>>>>>>>>

  this.init = function() {
    //sets core properties
    //inits listeners
    //processes initial data
    this.configs = configs || {};
    this.nameSpace = typeof(this.configs.nameSpace) === "string" ? this.configs.nameSpace : "";
    this.container = el && el.tagName ? el : document.querySelector(el || '[' + this.toPrefixedHyphenated('databind') + ']');
    if (!this.container) {
      this.container = document.createElement("input");
      this.container.type = "hidden";
      document.body.appendChild(this.container);
    }
    this.data = this.container.dataset;
    this.branches = {};
    this.delimiter = configs.delimiter || ","; //used for checkbox data

    this.setListeners();

    //cascade initial data:
    //first capture values in container data attributes if presentvalues 
    //overwrite with values in form controls if present
    //overwrite again with data argument if present
    this.data = this.prefixData(this.data);
    this.update(this.data);
    this.getInitialNodeValues();
    this.update(startData || {});

    setTimeout(function() {
      self.initialized = true;
    });
  };

  this.init();
}
