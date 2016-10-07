function SimpleDataBinding(el, startData, configs, parent) {
    //binds data to and from form controls, text nodes, and attributes
    //automatically repeats markup bound to arrays
    //easily extended for templating and more complex DOM interaction
    //
    //arguments
    //
    //  el:  element or string selector (optional) - container element for the two way binding instance  (if not present defaults to first [namespace]-databind attribute)
    //  startData: object (optional)
    //  configs: object (optional) - static configuration properties, watches
    //    nameSpace: string - appended to data prevent dataset name collisions
    //    delimmiter: string - separates selected checkbox values
    //    watches: object - specifies watches in the form {watchName: { props: [] /* optional string or array of strings */, fn: function }} or just {watchName: function}
    //parent: parent SimpleDataBinding instance - used internally

    var self = this;


    //<<<< Core Data Methods >>>>

    this.set = function (prop, val) {
        //setter
        self.data[self.toPrefixedCamel(prop)] = val;
        return prop;
    };

    this.get = function (prop, inherit) {
        //getter
        var parent = self, value;

        prop = self.toPrefixedCamel(prop);
        value = self.data[prop];

        while (value === undefined && inherit !== false && parent.parent) {
            //values of a null string or even null will not inherit from the parent
            //only undefined
            parent = parent.parent;
            value = parent.data[prop];
        }
        return value;
    };

    this.update = function (newData, bindDuringUpdate, additive) {
        //assigns all values present in newData object to data
        var childContainer;

        //data binding is asynchronous
        //child updates will be handled synchronously via the wathces
        //so better to turn off the bindings unless specified otherwise
        if (!bindDuringUpdate) {
            self.turnOffBindings();
        }

        for (var prop in newData) {
            if (typeof (newData[prop]) == "object") {
                childContainer = (self.childArrays[prop] && self.childArrays[prop].elementTemplate) || self.container.querySelector('[' + self.toPrefixedHyphenated('databind') + '="' + prop + '"]');
                if (newData[prop] instanceof Array && childContainer) {
                    self.updateChildArray(prop, childContainer, newData, additive);
                } else {
                    self.createChild(prop, childContainer, newData[prop]);
                }
            } else {
                self.root.lastMutation = { value: newData[prop], oldValue: self.get(prop), prop: prop };
                self.set(prop, newData[prop]);
                self.checkWatches(prop);
            }
        }

        self.parseNode(self.container);

        self.checkWatches("*", false);

        if (self.root.initialized) {
            self.turnOnBindings();
        }

        return self.data;
    };

    this.updateChildArray = function (prop, childContainerTemplate, newData, additive) {
        var id;

        if (self.childArrays[prop]) {
            if (additive !== true) {
                self.removeCommentedElements(self.childArrays[prop].placeholder, "databind", prop);
                self.childArrays[prop].length = 0;
            }
        } else {
            self.childArrays[prop] = [];        
            self.childArrays[prop].idIndex = 0;
            self.childArrays[prop].ownerInstance = self;
            self.childArrays[prop].key = prop;
            self.surroundByComments(self.childArrays[prop], "child array " + prop, childContainerTemplate);
        }

        for (var i = 0, stop = newData[prop].length; i < stop; i++) {
            self.childArrays[prop].push(self.createChildArrayMember(self.childArrays[prop], newData[prop][i], childContainerTemplate));
        };

        if (self.arrayEnhancer) {
            self.arrayEnhancer.enhance(self.childArrays[prop]);
        }

        return self.childArrays[prop];
    };


    this.createChildArrayMember = function (childArray, data, template, placeholder) {
        var id = self.generateChildArrayMemberId(childArray, data),
            el = self.cloneInPlace(template || childArray.elementTemplate, placeholder || childArray.placeholder),
            child = self.createChild(id, el, data);

        child.containingArray = childArray;
        return child;
    };

    this.generateChildArrayMemberId = function (childArray, data) {
        //generate a meaningful id for child instance within a child array
        var id = data.name || data.id || data.value;

        if (!id || self.children[id]) {
            id = (id || childArray.key) + childArray.idIndex;
            childArray.idIndex++;
        }
        return id;
    };

    this.assign = Object.assign || function (obj1, obj2) {
        //polyfill for Object.assign
        for (var prop in obj2) {
            obj1[prop] = obj2[prop];
        }
        return obj1;
    };

    this.createChild = function (prop, el, data) {
        self.children[prop] = new SimpleDataBinding(el, data, self.configs, self);
        return self.children[prop];
    };

    this.export = function () {
        //creates an (unbound) clone of data
        //recreates nesting via recursion
        //removes namespace from property names
        var dataClone = self.unprefixData(self.assign({}, self.data));

        for (childKey in self.children) {
            dataClone[childKey] = self.children[childKey].export();
        }
        return dataClone;
    };


    //<<<<< String Utilities >>>>>

    this.toCamelCase = function (str) {
        //converts hyphenated to camel case
        return str.replace(/-([a-z])/gi, function (s, group1) {
            return group1.toUpperCase();
        });
    };

    this.toHyphenated = function (str) {
        //converts camel case to hyphenated lower case
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    };

    this.toPrefixedCamel = function (str) {
        //prefixes camel case string with namespace if not already prefixed
        if (str && str.substring(0, self.nameSpace.length) != self.nameSpace) {
            str = self.nameSpace + str.charAt(0).toUpperCase() + str.slice(1);
        }
        return str;
    };

    this.toPrefixedHyphenated = function (str) {
        //prefixes hyphenated string with namespace
        return self.nameSpace ? self.hyphenated(self.nameSpace) + "-" : "" + str;
    };

    this.toUnprefixedCamel = function (str) {
        //strips the namespace from camel strings
        str = str.substring(self.nameSpace.length);
        return str.charAt(0).toLowerCase() + str.slice(1);
    };

    this.prefixData = function (dataset) {
        //prefix data property names with namespace as needed
        for (var prop in dataset) {
            if (prop.substring(0, self.nameSpace.length) != self.nameSpace) {
                self.set(prop, dataset[prop]);
                delete dataset[prop];
            }
        }
        return dataset;
    };

    this.unprefixData = function (obj) {
        //remove namespace prefix from data property names
        if (self.nameSpace) {
            for (var prop in obj) {
                obj[self.toUnprefixedCamel(prop)] = obj[prop];
                delete obj[prop];
            }
        }
        return obj;
    };


    //<<< DOM Methods >>>

    this.is = function (el, selector) {
        //polyfill for matches method
        var matchesTest = (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector);
        if (matchesTest) {
            return matchesTest.call(el, selector);
        } else {
            //ie8 polyfill
            var nodes = el.parentNode.querySelectorAll(selector);
            for (var i = nodes.length; i--;) {
                if (nodes[i] === el)
                    return true;
            }
            return false;
        }
    };

    this.closest = function (el, selector) {
        //returns closest selector match in el or ancestors
        //currently not used - may need for possible performance enhancements
        while (!self.is(el, selector) && el !== document.body) {
            el == el.parentElement;
        }
        return el;
    };

    this.cloneInPlace = function (el, placeholder, index) {
        //inserts a clone of an element before a placeholder
        var clone = el.cloneNode(true);

        placeholder.parentElement.insertBefore(clone, placeholder);
        return clone;
    };

    this.getNodeValue = function (el) {
        //returns value of form control or selected value of radio or checkbox group
        var val;

        if (el.type == "radio") {
            if (el.checked) {
                val = el.value;
            }
        } else if (el.type == "checkbox") {
            val = self.get(el.name, true);
            val = val !== undefined ? val.split(self.checkboxDataDelimiter) : [];
            if (el.checked) {
                val.push(el.value);
            } else {
                val.splice(val.indexOf(el.value), 1);
            }
            val = val.join(self.delimiter);
        } else if (el.tagName == "OPTION") {
            val = self.get(el.name, true);
            val = val !== undefined ? val.split(self.checkboxDataDelimiter) : [];
            if (el.selected) {
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

    this.getInitialNodeValues = function () {
        //assigns initial form values in elements with a name or a [namespace-]val attribute to data
        var selector = "[name]", nodes;

        if (self.container.tagName == "form") {
            for (var controlName in self.container.elements) {
                getControlValue(self.container.elements[controlName]);
            }
        } else {
            nodes = Array.prototype.slice.call(self.container.querySelectorAll(selector));

            if (self.is(self.container, selector)) {
                nodes.push(self.container);
            }

            for (var i = 0, stop = nodes.length; i < stop; i++) {
                getControlValue(nodes[i]);
            }
        }

        return self.data;

        function getControlValue(el) {
            if (el.name != "undefined" && el.type != "radio" && el.type != "checkbox" && el.tagName != "OPTION") {
                var val = el.getAttribute("value");//NOT el.value since Chrome populates this with "on" by default in some contexts
                if (val && val.substr(0, 2) !== "{{") {
                    self.set(el.name, self.getNodeValue(el));
                }
            }
        }
    };

    this.surroundByComments = function (obj, message, elementTemplate, retain) {
        if (!obj.placeholder) {
            obj.elementTemplate = elementTemplate;
            obj.placeholder = document.createComment("end " + message);
            elementTemplate.parentNode.insertBefore(document.createComment("start " + message), elementTemplate);
            elementTemplate.parentNode.insertBefore(obj.placeholder, elementTemplate);
            if (!retain) {
                elementTemplate.parentElement.removeChild(elementTemplate);
            }
        }
        return obj;
    };

    this.removeCommentedElements = function (placeholder, attr, value) {
        while (placeholder.previousSibling && placeholder.previousSibling.nodeType != 8) {
            if (placeholder.previousSibling.nodeType == 1 && placeholder.previousSibling.getAttribute(attr) == value) {
                placeholder.parentElement.removeChild(placeholder.previousSibling);
            } else {
                placeholder = placeholder.previousSibling;
            }
        }

        return placeholder;
    };

    this.parseNode = function (node) {
        //recursively update node and its children's properties with dynamic values
        var resolvedName, prop, attr;

        if (node.parsed) {
            return false;
        } else {
            if (node.nodeType == 3) {
                self.resolveDoubleCurlyBraces(node);
            } else if (node.nodeType == 1) {
                for (var i = 0; i < node.attributes.length; i++) {
                    self.resolveAttrNode(node.attributes[i]);
                }

                for (var i = 0; i < node.childNodes.length; i++) {
                    //do not recurse if we have hit the container of a child SimpleDataBinding instance
                    //let the instance handle it
                    if (!(node.childNodes[i].hasAttribute && node.childNodes[i].hasAttribute("databind"))) {
                        self.parseNode(node.childNodes[i]);
                    }
                }
            }
            node.parsed = true;
            return node;
        }
    };

    this.resolveAttrNode = function (node) {
        //resolve dynamic references in an attribute
        if (node.nodeName.substr(0, 5) != "data-") {
            self.resolveAttrNodeName(node);
            self.resolveAttrNodeValue(node);
            return node;
        }
    };

    this.resolveAttrNodeName = function (node) {
        //resolve dynamically populated attribute names
        if (node.boundAttrNameProp === undefined) {
            if (node.nodeName.substr(-2, 2) == "__") {
                prop = node.nodeName.slice(2, -2);
                if (prop) {
                    node.boundAttrNameProp = prop;
                    self.addWatch(node.boundAttrNameProp, node);
                }
            } else {
                node.boundAttrNameProp = null;
            }
        }
        if (node.boundAttrNameProp) {
            attr = self.get(node.boundAttrNameProp, true);
            if (attr) {
                node.boundAttrName = attr;
                setTimeout(function () {
                //wait for our current dynamcally named node to resolve it's value
                    node.ownerElement.setAttribute(attr, node.nodeValue);
                });
            } else if (node.boundAttrName) {
                node.ownerElement.removeAttribute(node.boundAttrName);
            }
        }
        return node;
    };

    this.resolveAttrNodeValue = function (node) {
        //resolve curly braces and call attribute based methods

        var methodName = node.nodeName == "name" ? "name" : self.toPrefixedHyphenated(node.nodeName),
            method = self.attrMethods[methodName], value, watchName;
            
        self.resolveDoubleCurlyBraces(node, node.nodeValue);
        value = node.value || node.ownerElement[node.name];/* be ware of element properties like node.href which may differ dramatically from the attribute node value */
        watchName = value || "*";
        if (methodName == "value" && (node.ownerElement.type == "radio" || node.ownerElement.type == "radio" || node.ownerElement.tagName == "OPTION")) {
            self.setNodeValue(node.ownerElement, node.ownerElement.getAttribute("name"), "name");
        }
        if (method) {
            self.addWatch(watchName, node);
            method.apply(self, [node.ownerElement, node.nodeValue, node.nodeName, self.get(node.nodeValue)]);
        }
        return node;
    };

    this.resolveDoubleCurlyBraces = function (node, testTemplate) {
        //replace value (attribute value or text node value) in curly braces with corresponding data value
        if (!node) {
            return "";
        }

        var isInitialPass = node.nodeTemplate === undefined;

        if (isInitialPass) {
            testTemplate = testTemplate || node.nodeValue;
            if (typeof (testTemplate) == "string" && testTemplate.indexOf("{{") != -1) {
                node.nodeTemplate = testTemplate;
            } else {
                node.nodeTemplate = null;
            }
        }

        if (node.nodeTemplate) {
            node.nodeValue = node.nodeTemplate.replace(/{{(.*?)}}/g, function ($0) {
                var prop = $0.slice(2, -2),
                    value = self.get(prop, true) || "";

                if (isInitialPass) {
                    self.addWatch(prop, node);
                }
                if (node.nodeName == "name" && value) {
                    self.addWatch(value, node);
                }
                return value;
            });
        }

        return node.nodeValue;
    };


    //<<<<<<<<<< attribute based methods >>>>>>>>>>

    function childTemplate(el, rawValue, prop, dataValue) {
        if (dataValue) {
            var templateWrapper = document.getElementById(dataValue),
              template = templateWrapper && templateWrapper.firstElementChild,
              clone;

            if (template) {
                clone = template.cloneNode(true);
                el.appendChild(clone);
                this.parseNode(clone);
                this.childFromTemplate = clone;
            }
        }
        return el;
    }

    function renderIf(el, rawValue, prop, dataValue) {
        this.surroundByComments(el, "render if " + rawValue, el, true);
        if (dataValue && !el.parentElement) {
            el.placeholder.parentElement.insertBefore(el, el.placeholder);
        } else if (!dataValue && el.parentElement) {
            el.parentElement.removeChild(el);
        }
        return el;
    }

    this.setNodeValue = function (el, prop, attr) {
        //sets node value to data property value
        var value = self.get(prop, true);

        if (value !== undefined) {
            if (el.type == "radio" && attr == "name") {
                el.checked = (value == el.value);
            } else if (el.type == "checkbox" && attr == "name") {
                el.checked = (value.indexOf(el.value) != -1);
            } else if (el.tagName == "SELECT" && !value) {
                setTimeout(function () {
                    el.selectedIndex = "-1";
                }, 0);
            } else if (el.tagName == "OPTION" && attr == "value") {
                el.selected = (self.get(node.parentElement.name) || "").indexOf(node.value) != -1;
            } else {
                el.value = value;
            }
        }
    };

    this.attrMethods = {
        name: this.setNodeValue,
        renderif: renderIf,
        childtemplate: childTemplate
    }


    //<<<<<< Listeners, Handlers, and Watches >>>>>>

    this.setListeners = function () {
        //listen for changes in the container element's dataset
        self.observer = new MutationObserver(self.mutationHandler);

        //listen for form control changes within our container
        self.container.addEventListener("change", self.changeHandler);
    };

    this.turnOnBindings = function () {
        if (self.observer) {
            self.observer.observe(self.container, {
                attributes: true,
                attributeOldValue: true
            });
        }
    };

    this.turnOnAllBindings = function () {
        self.turnOnBindings();
        for (childKey in self.children) {
            self.children[childKey].turnOnAllBindings();
        }
    }

    this.turnOffBindings = function () {
        if (self.observer) {
            self.observer.disconnect();
        }
    }

    this.mutationHandler = function (mutations) {
        //on mutation of the dataset calls into methods to update the DOM and fire watches

        mutations.forEach(function (mutation) {
            var prefix = "data-",
                value = mutation.target.getAttribute(mutation.attributeName),
                prop;

            if (self.nameSpace) {
                prefix += self.nameSpace + "-";
            }

            //we are only interested in changes to data attributes and only ones within the namesspace if one is configured
            if (mutation.target == (self.boundHiddenInput || self.container) && mutation.attributeName.substr(0, prefix.length) == prefix && value != mutation.oldValue) {
                prop = self.toCamelCase(mutation.attributeName.substr(prefix.length));
                self.root.lastMutation = { prop: prop, value: value, oldValue: mutation.oldValue };
                self.checkWatches(prop);
                self.checkWatches("*");
            }
        });
        return mutations;
    };

    this.changeHandler = function (e) {
        //handles changes to form control values within the container
        var val = self.getNodeValue(e.target),
          prop = e.target.name || e.target.getAttribute(self.toPrefixedHyphenated("val"));

        e.stopPropagation();

        if (self.containingArray && self.parent.get(prop) !== undefined && (e.target.type == "radio" || e.target.type == "checkbox")) {
            //checkboxes and radios created in childArrays should change the value in the parent DataBinding instance
            self.parent.set(prop, val);
        } else {
            return self.set(prop, val);
        }
    };

    this.watch = function (props, fn, globalScope) {
        //adds a watch function to a data property or array of data properties
        var globalWatch = ["*"],
            instance;

        if (typeof (props) == "function") {
            globalScope = fn;
            fn = props;
            props = globalWatch;
        } else if (typeof (props) == "string") {
            props = [props];
        }
        props = props || globalWatch;
        instance = globalScope ? self.root : self

        for (var i = 0, stop = props.length; i < stop; i++) {
            instance.addWatch(props[i], { fn: fn, props: props }, globalScope);
        }
    };

    this.addWatch = function (prop, node, globalScope) {
        //adds a watch function or node with implicit function to a given data property
        var watchType = globalScope ? "globalScopeWatches" : "watches",
            instance = globalScope ? self.root : self;

        instance[watchType][prop] = instance[watchType][prop] || [];
        if (instance[watchType][prop].indexOf(node) == -1) {
            instance[watchType][prop].push(node);
        }
    };

    this.checkWatches = function (prop, recursive) {
        //check all watches related to the property change and execute

        if (self.watches[prop]) {
            iterateWatchArray(prop, false);
            //global watches are only executed if there is a relevant local watch
            if (self.root.globalScopeWatches[prop]) {
                iterateWatchArray(prop, true);
            }
            if (self.root.globalScopeWatches["*"]) {
                iterateWatchArray("*", true);
            }
        }

        if (recursive !== false) {
            for (childKey in self.children) {
                //recurse through child instances in case the property is inheritted
                self.children[childKey].checkWatches(prop);
            }
        }

        function iterateWatchArray(prop, globalScope) {
            var instance = globalScope ? self.root : self,
                watchType = globalScope ? "globalScopeWatches" : "watches";

            for (var i = instance[watchType][prop].length - 1; i >= 0; i--) {
                if (instance[watchType][prop][i].fn) {
                    //for watches of global scope we pull the function from the root instance
                    //but execute it in the context of local instance
                    self.executeWatchFn(instance[watchType][prop][i], prop)
                } else {
                    node = instance[watchType][prop][i];
                    if (node.nodeType == 2) {
                        self.resolveAttrNode(node);
                    } else {
                        self.resolveDoubleCurlyBraces(node);
                    }
                }
            }
        }

        return prop;
    };

    this.executeWatchFn = function (watch, prop) {
        //execute a watch function in the context of the instance with designated arguments

        var lastMut = self.root.lastMutation,
            args = [lastMut.value, lastMut.oldValue, lastMut.prop],
            watchProps = {};

        //on recursive watch functions
        //only execute once in the context that contains the changed property
        if (self.get(lastMut.prop) != undefined || !watch.recursive) {

            if (watch.props[0] != "*") {
                for (var i = 0, stop = watch.props.length; i < stop; i++) {
                    watchProps[watch.props[i]] = self.get(watch.props[i]);
                }
                args.push(watchProps);
            }

            watch.fn.apply(self, args);
        }
    };


    //<<<<<<<<< Initialization >>>>>>>>>>

    this.initProps = function () {
        //initialize properties

        this.configs = configs || {};
        this.nameSpace = typeof (this.configs.nameSpace) === "string" ? this.configs.nameSpace : "";
        this.container = el && el.tagName ? el : document.querySelector(el || '[' + this.toPrefixedHyphenated('databind') + ']') || document.forms[0] || document.body;
        if (this.configs.containInHiddenInput) {
            this.boundHiddenInput = document.createElement("input");
            this.boundHiddenInput.type = "hidden";
            this.container.appendChild(this.boundHiddenInput);
        }
        this.watches = this.configs.watches || {};
        this.globalScopeWatches = this.configs.globalScopeWatches || {};
        this.checkboxDataDelimiter = this.configs.checkboxDataDelimiter || ",";
        this.attrMethods = this.assign(this.attrMethods, this.configs.attrMethods || {});

        return this
    };

    this.initFamilyTree = function () {
        //establish SimpleDataBinding instance relationships with other SimpleDataBinding instances 

        this.parent = parent;
        if (this.parent) {
            this.ancestors = this.parent.ancestors.slice();
            this.ancestors.push(parent);
        } else {
            this.ancestors = [];
        }
        this.root = this.ancestors[0] || this;
        this.children = {};
        this.childArrays = {};

        return this;
    }

    this.initData = function () {
        //cascade initial data:
        //first capture values in container data attributes if presentvalues 
        //overwrite with values in form controls if present
        //overwrite again with start dataArgument if present

        this.data = this.prefixData((this.boundHiddenInput || this.container).dataset);
        this.update(this.data);
        this.getInitialNodeValues();
        this.update(startData || {});
        return this;
    }

    this.init = function () {
        //sets core properties
        //inits listeners
        //processes initial data

        this.initFamilyTree();
        this.initProps();
        this.initData();
        this.setListeners();
        if (this == this.root) {
            this.turnOnAllBindings();
        }

        this.initialized = true;

        return this;
    };

    this.init();
}
