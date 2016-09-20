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
            parent = parent.parent;
            value = parent.data[prop];
        }
        return value;
    };

    this.update = function (newData, additive) {
        //assigns all values present in newData object to data
        var childContainer;

        self.turnOffBindings();

        for (var prop in newData) {
            if (typeof (newData[prop]) == "object") {
                childContainer = (self.childArrays[prop] && self.childArrays[prop].elementTemplate) || self.container.querySelector('[' + self.toPrefixedHyphenated('databind') + '="' + prop + '"]');
                if (newData[prop] instanceof Array && childContainer) {
                    self.updateChildArray(prop, childContainer, newData, additive);
                } else {
                    self.createChild(prop, childContainer, newData[prop]);
                }
            } else {
                self.set(prop, newData[prop]);
            }
        }

        self.parseNode(self.container);

        self.turnOnBindings();

        return self.data;
    };

    this.updateChildArray = function (prop, childContainerTemplate, newData, additive) {
        if (self.childArrays[prop]) {
            if (additive !== true) {
                self.removeCommentedElements(self.childArrays[prop].placeholder, "databind", prop);
                self.childArrays[prop].length = 0;
            }
        } else {
            self.childArrays[prop] = [];
            self.surroundByComments(self.childArrays[prop], "child array " + prop, childContainerTemplate);
        }
        //TODO: create more robust indexing
        //and/or remove index logic from changehanlder
        //knowing that index is used to determine proper data in array
        for (var repeaterChildIndex = 0, stop = newData[prop].length; repeaterChildIndex < stop; repeaterChildIndex++) {
            child = self.createChild(prop + repeaterChildIndex, self.cloneInPlace(childContainerTemplate, self.childArrays[prop].placeholder), newData[prop][repeaterChildIndex]);
            child.index = repeaterChildIndex;
            self.childArrays[prop].push(child);
        };
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

    this.cloneInPlace = function (el, placeholder) {
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
            if (el.type != "radio" && el.type != "checkbox" && el.tagName != "OPTION") {
                var val = el.getAttribute("value");//NOT el.value since Chrome populates this with "on" by default in some contexts
                if (val && val.substr(0, 2) !== "{{") {
                    self.set(el.name, self.getNodeValue(el));
                }
            }
        }
    };

    this.surroundByComments = function (obj, message, elementTemplate, retain) {
        obj.elementTemplate = elementTemplate;
        obj.placeholder = document.createComment("end " + message);
        elementTemplate.parentNode.insertBefore(document.createComment("start " + message), elementTemplate);
        elementTemplate.parentNode.insertBefore(obj.placeholder, elementTemplate);
        if ( ! retain) {
            elementTemplate.parentElement.removeChild(elementTemplate);
        }
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

    this.setNodeValue = function (el, prop, attr) {
        //sets node value to data property value
        var value = self.get(prop, true);
        
        if (value !== undefined) {
            if (el.type == "radio" && attr == "name") {
                el.checked = (value == el.value);
            } else if (el.type == "checkbox" && attr == "name") {
                el.checked = (value.indexOf(el.value) != -1);
            } else if (el.tagName == "OPTION" && attr == "value") {
                el.value = value;
                el.selected = (value.indexOf(el.value) != -1);
            } else {
                el.value = value;
            }
        }
    };

    this.parseNode = function (node) {
        //recursively update node and its children's properties with double curly braces
        var resolvedName;

        if (node.nodeType == 3) {
            self.resolveDoubleCurlyBraces(node);
        } else if (node.nodeType == 1) {
            for (var i = 0; i < node.attributes.length; i++) {
                self.resolveAttrNode(node.attributes[i]);
                if (node.attributes[i].nodeName == "name") {
                    resolvedName = true;
                }
                if (node.attributes[i].nodeName == "value" && resolvedName && node.attributes[i].nodeTemplate && (node.type == "radio" || node.type == "checkbox")) {
                    //if we've attempted to resolve the selected value based on the name before resolving the value
                    //checkboxes && radios need some extra love here
                    self.setNodeValue(node, node.name, "name");
                } else if (node.tagName == "OPTION" && node.attributes[i].nodeName == "value") {
                    //options probably don't have a name but must have a value
                    //they need some extra love as well hinging on the parent's value
                    self.setNodeValue(node, node.parentElement.name, "name");
                }
            }
            if (!(node.hasAttribute("databind") && node != self.container)) {
                //do not recurse if we have hit the container of a child SimpleDataBinding instance
                //let the instance handle it
                for (var i = 0; i < node.childNodes.length; i++) {
                    self.parseNode(node.childNodes[i]);
                }
            }
        }
    };
    
    this.resolveAttrNode = function (node) {
        //resolve curly braces and call attribute based methods
        var methodName = node.nodeName == "name" ? "name" : self.toPrefixedHyphenated(node.nodeName),
            method = self.attrMethods[methodName],
            value = node.value || node.ownerElement[node.name],/* be ware of element properties like node.href which may differ dramatically from the attribute node value */
            watchName = value || "*";

        self.resolveDoubleCurlyBraces(node, value);
        if (method) {
            self.addWatch(watchName, node);
            method.apply(self, [node.ownerElement, node.nodeValue, node.nodeName, self.get(node.nodeValue)]);
        }
    };

    this.resolveDoubleCurlyBraces = function (node, testTemplate) {
        //replace value (attribute value or text node value) in curly braces with corresponding data value
        if (!node) {
            return "";
        }

        var isInitialPass = node.nodeTemplate === undefined;

        if (isInitialPass) {
            testTemplate = testTemplate || node.nodeValue;
            if (typeof(testTemplate) == "string" && testTemplate.indexOf("{{") != -1) {
                node.nodeTemplate = testTemplate;
            } else {
                node.nodeTemplate = null;
            }
        }

        if (node.nodeTemplate) {
            node.nodeValue = node.nodeTemplate.replace(/{{(.*?)}}/g, function ($0) {
                var prop = $0.slice(2, -2);
                if (isInitialPass) {
                    self.addWatch(prop, node);
                }
                return self.get(prop, true);
            });
        }

        return node.nodeValue;
    };


    //<<<<<< Listeners, Handlers, and Watches >>>>>>

    this.setListeners = function () {
        //listen for changes in the container element's dataset
        self.observer = new MutationObserver(self.mutationHandler);
        self.turnOnBindings();

        //listen for form control changes within our container
        self.container.addEventListener("change", self.changeHandler);
    };

    this.turnOnBindings = function () {
        if (self.observer) {
            self.observer.observe(self.container, {
                attributes: true
            });
        }
    };

    this.turnOffBindings = function () {
        if (self.observer) {
            self.observer.disconnect();
        }
    }

    this.mutationHandler = function (mutations) {
        //on mutation of the dataset calls into methods to update the DOM and fire watches

        mutations.forEach(function (mutation) {
            var prefix = "data-",
              prop;

            if (self.nameSpace) {
                prefix += self.nameSpace + "-";
            }

            //we are only interested in changes to data attributes and only ones within the namesspace if one is configured
            if (mutation.target == (self.boundHiddenInput || self.container) && mutation.attributeName.substr(0, prefix.length) == prefix) {
                prop = self.toCamelCase(mutation.attributeName.substr(prefix.length));
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

        if (self.index !== undefined && self.parent.get(prop) !== undefined && (e.target.type == "radio" || e.target.type =="checkbox")) {
            //checkboxes and radios created in childArrays should change the value in the parent DataBinding instance
            self.parent.set(prop, val);
        } else {
            return self.set(prop, val);
        } 
    };

    this.watch = function (props, fn) {
        //adds a watch function to a data property or array of data properties
        var globalWatch = ["*"];

        props = props || globalWatch;
        if (typeof (props) == "function") {
            fn = props;
            props = globalWatch;
        } else if (typeof (props) == "string") {
            props = [props];
        }
        for (var i = 0, stop = props.length; i < stop; i++) {
            self.addWatch(props[i], { fn: fn, props: props });
        }
    };

    this.addWatch = function (watchName, node) {
        //adds a watch function or node with implicit function to a given data property
        self.watches[watchName] = self.watches[watchName] || [];
        if (self.watches[watchName].indexOf(node) == -1) {
            self.watches[watchName].push(node);
        }
    };

    this.checkWatches = function (prop) {
        if (self.watches[prop]) {
            for (var i = self.watches[prop].length - 1; i >= 0; i--) {
                if (self.watches[prop][i].fn) {
                    self.executeWatchFn(self.watches[prop][i], prop)
                } else {
                    node = self.watches[prop][i];
                    if (self.container.contains(node.ownerElement || node.parentElement)) {
                        //do not execute watches on document fragments or nodes outside of our container
                        if (node.nodeType == 2) {
                            self.resolveAttrNode(node);
                        } else {
                            self.resolveDoubleCurlyBraces(node);
                        }      
                    }
                }
            }
        }
        for (childKey in self.children) {
            self.children[childKey].checkWatches(prop);
        }
    };

    this.executeWatchFn = function (watch, prop) {
        //execute a watch function in the context of the instance with designated arguments
        var args = [];

        for (var i = 0, stop = watch.props.length; i < stop; i++) {
            args.push(self.get(watch.props[i]))
        }
        //global watch functions with no specified properties receive the chagned property value as the only argument
        if (args.length == 0) {
            args.push(self.get(prop));
        }
        watch.fn.apply(self, args);
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
        this.checkboxDataDelimiter = this.configs.checkboxDataDelimiter || ",";

        this.attrMethods = this.assign({
            name: this.setNodeValue
        }, this.configs.attrMethods || {});

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

        return this;
    };

    this.init();
}
