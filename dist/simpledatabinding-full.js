(function () {
    function SimpleDataBinding(container, startData, configs, id, parent) {
        //binds data to and from form controls, text nodes, and attributes
        //automatically repeats markup bound to arrays
        //includes basic templating and easily extended for more complex DOM interaction
        //
        //arguments
        //
        //  container:  element or string selector (optional) - container element for the two way binding instance  (if not present defaults to first [namespace]-databind attribute)
        //  startData: object (optional)
        //  configs: object (optional) - static configuration properties, watches
        //    nameSpace: string - appended to data prevent dataset name collisions
        //    delimmiter: string - separates selected checkbox values
        //    watches: object - specifies watches in the form {watchName: { props: [] /* optional string or array of strings */, fn: function }} or just {watchName: function}
        //    parent: parent SimpleDataBinding instance - used internally

        var self = this;


        //<<<< Core Data Methods >>>>

        this.set = function (prop, val, inherit, repository) {
            //set value in the closest instance where that value exists
            //or set it as a new property for this instance
            var parent = self, existingValue;

            prop = toPrefixedCamel(prop);
            repository = repository || "data";
            existingValue = self.data[prop];

            while (existingValue === undefined && inherit !== false && parent.parent) {
                //search for a reference to the property in ancestors
                parent = parent.parent;
                existingValue = parent[repository][prop];
            }

            if (existingValue === undefined) {
                //if there is no reference, set our existingValue in this instance
                self[repository][toPrefixedCamel(prop)] = val;
            } else {
                //otherwise set the existingValue in the parent
                parent[repository][toPrefixedCamel(prop)] = val;
            }

            return self[repository][prop];
        };

        this.get = function (prop, inherit, repository) {
            //get the closest inheritted value unless inherit is false
            var parent = self, value;

            prop = toPrefixedCamel(prop);
            repository = repository || "data";
            value = self[repository][prop];

            while (value === undefined && inherit !== false && parent.parent) {
                //values of a null string or even null will not inherit from the parent
                //only undefined
                parent = parent.parent;
                value = parent[repository][prop];
            }
            return value;
        };

        this.update = function (newData, bindDuringUpdate) {
            //assigns all values present in newData object to data
            var datum, val;

            //data binding is asynchronous
            //child updates will be handled synchronously via the wathces
            //so better to turn off the bindings unless specified otherwise
            if (!bindDuringUpdate) {
                turnOffBindings();
            }

            for (var prop in newData) {
                if (newData.hasOwnProperty(prop)) {
                    datum = newData[prop];
                    if (typeof (datum) === "object") {
                        if (datum instanceof Array) {
                            createChildArray(prop, datum);
                        } else {
                            self.createChild(prop, getContainer(prop), datum);
                        }
                    } else {
                        val = datum;
                        prop = toPrefixedCamel(prop);
                        self.root.lastMutation = { value: val, oldValue: self.get(prop), prop: prop };
                        self.set(prop, val);
                        self.checkWatches(prop);
                    }
                }
            }

            self.parseNode(self.container);

            self.checkWatches("*", false);

            if (self.root.initialized) {
                turnOnBindings();
            }

            return self.data;
        };

        var createChildArray = function (prop, data) {
            var ASSEMBLEASFRAGMENT = false,//possible performance enhancement currently not proven
                ar, parent, parentPlaceholder, grandparent;

            if (self.childArrays[prop]) {
                ar = self.childArrays[prop];
                self.removeCommentedElements(ar.placeholder, "databind", prop);
                ar.length = 0;
            } else {
                ar = self.configs.modifyInputArrays === true ? data : [],
                self.childArrays[prop] = ar;
                ar.idIndex = 0;
                ar.ownerInstance = self;
                ar.key = prop;
                self.surroundByComments(ar, "child array " + prop, getContainer(prop));
            }

            if (ASSEMBLEASFRAGMENT) {
                parent = self.childArrays[prop].placeholder.parentNode;
                parentPlaceholder = parent.nextElementSibling;
                grandparent = parent.parentElement;
                grandparent.removeChild(parent);
            }

            for (var i = 0, stop = data.length; i < stop; i++) {
                ar[i] = (self.createChildArrayMember(ar, data[i]));
            }

            if (ASSEMBLEASFRAGMENT) {
                if (parentPlaceholder) {
                    parentPlaceholder.parentNode.insertBefore(parent, parentPlaceholder);
                } else {
                    grandparent.appendChild(parent);
                }
            }

            if (self.arrayEnhancer && !ar.update) {
                self.arrayEnhancer.enhance(ar);
            }

            return ar;
        };

        this.createChildArrayMember = function (childArray, data, placeholder) {
            //creates a member of child array
            //accessed externally by live array methods

            if (data instanceof SimpleDataBinding) {
                return data;
            } else {
                var id = generateChildArrayMemberId(childArray, data),
                    el = cloneInPlace(childArray.elementTemplate, placeholder || childArray.placeholder),
                    child = self.createChild(id, el, data);

                child.containingArray = childArray;
                return child;
            }
        };

        var generateChildArrayMemberId = function (childArray, data) {
            //generate a meaningful id for child instance within a child array
            var id = data.name || data.id || data.value;

            if (!id || self.children[id]) {
                childArray.idIndex++;
                id = (id || childArray.key) + childArray.idIndex;
            }
            return id;
        };

        var assign = Object.assign || function (obj1, obj2) {
            //polyfill for Object.assign
            for (var prop in obj2) {
                if (obj2.hasOwnProperty(prop)) {
                    obj1[prop] = obj2[prop];
                }
            }
            return obj1;
        };

        this.createChild = function (id, container, data) {
            var child = new SimpleDataBinding(container, data, self.configs, id, self);

            self.children[id] = child;
            return child;
        };

        this.export = function (unprefix) {
            //creates an (unbound) clone of data
            //recreates nesting via recursion
            //removes namespace from property names
            var dataClone = assign({}, self.data);

            if (unprefix) {
                dataClone = unprefixData(dataClone);
            }

            for (var childKey in self.children) {
                if (self.children.hasOwnProperty(childKey)) {
                    dataClone[childKey] = self.children[childKey].export();
                }
            }
            return dataClone;
        };




        //<<<<< String Utilities >>>>>

        var toCamelCase = function (str) {
            //converts hyphenated to camel case
            return str.replace(/-([a-z])/gi, function (s, group1) {
                return group1.toUpperCase();
            });
        };

        var toHyphenated = function (str) {
            //converts camel case to hyphenated lower case
            return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        };

        var toPrefixedCamel = function (str) {
            //prefixes camel case string with namespace if not already prefixed
            if (self.nameSpace && str && str.substring(0, self.nameSpace.length) !== self.nameSpace) {
                str = self.nameSpace + str.charAt(0).toUpperCase() + str.slice(1);
            }
            return str;
        };

        var toPrefixedHyphenated = function (str) {
            //prefixes hyphenated string with namespace
            return (self.attrPrefix ? toHyphenated(self.attrPrefix) + "-" : "") + str;
        };

        var toUnprefixedCamel = function (str) {
            //strips the namespace from camel strings
            if (self.nameSpace) {
                str = str.substring(self.nameSpace.length);
                return str.charAt(0).toLowerCase() + str.slice(1);
            } else {
                return str;
            }
        };

        var prefixData = function (dataset) {
            //prefix data property names with namespace as needed
            if (self.nameSpace) {
                for (var prop in dataset) {
                    if (prop.substring(0, self.nameSpace.length) !== self.nameSpace) {
                        self.set(prop, dataset[prop]);
                        delete dataset[prop];
                    }
                }
            }
            return dataset;
        };

        var unprefixData = function (obj) {
            //remove namespace prefix from data property names
            if (self.nameSpace) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        obj[toUnprefixedCamel(prop)] = obj[prop];
                        delete obj[prop];
                    }
                }
            }
            return obj;
        };




        //<<< DOM Methods >>>

        var is = function (el, selector) {
            //polyfill for matches method
            var matchesTest = (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector);
            return matchesTest && matchesTest.call(el, selector);
        };

        var closest = function (el, selector) {
            //returns closest selector match in el or ancestors
            while (!is(el, selector) && el !== document.body) {
                el = el.parentElement;
            }
            return el;
        };

        var cloneInPlace = function (el, placeholder) {
            //inserts a clone of an element before a placeholder
            var clone = el.cloneNode(true);

            placeholder.parentNode.insertBefore(clone, placeholder);
            return clone;
        };

        var getNodeValue = function (el) {
            //returns value of form control or selected value of radio or checkbox group
            var val;

            if (el.type === "radio") {
                if (el.checked) {
                    val = el.value;
                }
            } else if (el.type === "checkbox") {
                val = self.get(el.name, true);
                val = val !== undefined ? val.split(self.checkboxDataDelimiter) : [];
                if (el.checked) {
                    val.push(el.value);
                } else {
                    val.splice(val.indexOf(el.value), 1);
                }
                val = val.join(self.delimiter);
            } else if (el.tagName === "OPTION") {
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

        var getInitialNodeValues = function () {
            //assigns initial form values in elements with a name or a [namespace-]val attribute to data
            var selector = "[name]", nodes;

            if (self.container.tagName === "form") {
                for (var controlName in self.container.elements) {
                    if (self.container.elements.hasOwnProperty(controlName)) {
                        getControlValue(self.container.elements[controlName]);
                    }
                }
            } else {
                nodes = Array.prototype.slice.call(self.container.querySelectorAll(selector));

                if (is(self.container, selector)) {
                    nodes.push(self.container);
                }

                for (var i = 0, stop = nodes.length; i < stop; i++) {
                    getControlValue(nodes[i]);
                }
            }

            return self.data;

            function getControlValue(el) {
                if (el.name !== "undefined" && el.type !== "radio" && el.type !== "checkbox" && el.tagName !== "OPTION") {
                    var val = el.getAttribute("value");//NOT el.value since Chrome populates this with "on" by default in some contexts
                    if (val && val.substr(0, 2) !== "{{") {
                        self.set(el.name, getNodeValue(el));
                    }
                }
            }
        };

        var setContainer = function () {
            //create instance's container element
            self.container = container && container.tagName ? container : document.querySelector(container || '[' + toPrefixedHyphenated('databind') + ']') || document.forms[0] || document.body;
            if (self.configs.useHiddenInput) {
                self.boundHiddenInput = document.createElement("input");
                self.boundHiddenInput.type = "hidden";
                self.container.appendChild(self.boundHiddenInput);
            }
            if (!self.container.getAttribute("databind")) {
                self.container.setAttribute("databind", "");
            }
            return self.container;
        };

        var getContainer = function (prop) {
            //finds the appropriate container for a child instance or element template for an array
            var container = self.container.querySelector('[' + toPrefixedHyphenated('databind') + '="' + prop + '"]');
            return container;
        };

        this.surroundByComments = function (obj, message, elementTemplate, retain) {
            //surround an element by comments
            //add properties to an associated object:
            //   elementTemplate:  the element
            //   placeholder:  the new trailing comment

            if (!obj.placeholder) {
                obj.elementTemplate = elementTemplate;
                obj.placeholder = document.createComment("end " + message);
                elementTemplate.placeholder = obj.placeholder;
                elementTemplate.parentNode.insertBefore(document.createComment("start " + message), elementTemplate);
                if (elementTemplate.nextElementSibling) {
                    elementTemplate.parentNode.insertBefore(obj.placeholder, elementTemplate.nextElementSibling);
                } else {
                    elementTemplate.parentNode.appendChild(obj.placeholder);
                }
                if (!retain) {
                    elementTemplate.parentNode.removeChild(elementTemplate);
                }
            }
            return obj.placeholder;
        };

        this.removeCommentedElements = function (placeholder, attr, value) {
            while (placeholder.previousSibling && placeholder.previousSibling.nodeType !== 8) {
                if (placeholder.previousSibling.nodeType === 1 && placeholder.previousSibling.getAttribute(attr) === value) {
                    placeholder.parentNode.removeChild(placeholder.previousSibling);
                } else {
                    placeholder = placeholder.previousSibling;
                }
            }

            return placeholder;
        };

        this.parseNode = function (node) {
            //recursively update node and its children's properties with dynamic values
            var i;

            if (node.parsed) {
                return false;
            } else {
                if (node.nodeType === 3) {
                    resolveDoubleCurlyBraces(node);
                } else if (node.nodeType === 1) {
                    for (i = 0; i < node.attributes.length; i++) {
                        resolveAttrNode(node.attributes[i]);
                    }

                    for (i = 0; i < node.childNodes.length; i++) {
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

        var resolveAttrNode = function (node) {
            //resolve dynamic references in an attribute
            if (node.nodeName.substr(0, 5) !== "data-") {
                resolveAttrNodeName(node);
                resolveAttrNodeValue(node);
                return node;
            }
        };

        var resolveAttrNodeName = function (node) {
            //resolve dynamically populated attribute names
            var prop, attr;

            if (node.boundAttrNameProp === undefined) {
                if (node.nodeName.substr(-2, 2) === "__") {
                    prop = toPrefixedCamel(node.nodeName.slice(2, -2));
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

        var resolveAttrNodeValue = function (node) {
            //resolve curly braces and call attribute based methods

            var methodName = node.nodeName,
                method = self.attrMethods[methodName], value, watchName;

            resolveDoubleCurlyBraces(node, node.nodeValue);
            value = node.value || node.ownerElement[node.name];//be ware of element properties like node.href which may differ dramatically from the attribute node value
            watchName = value || "*";
            if (methodName === "value" && (node.ownerElement.type === "radio" || node.ownerElement.type === "checkbox" || node.ownerElement.tagName === "OPTION")) {
                setNodeValue(node.ownerElement, node.ownerElement.getAttribute("name"), "name");
            }
            if (method) {
                self.addWatch(toPrefixedCamel(watchName), node);//prefixing here at watch creation to avoid prefixing properties corresponding to new instances or child arrays
                method.apply(self, [node.ownerElement, node.nodeValue, node.nodeName, self.get(node.nodeValue)]);
            }
            return node;
        };

        var resolveDoubleCurlyBraces = function (node, testTemplate) {
            //replace value (attribute value or text node value) in curly braces with corresponding data value
            if (!node) {
                return "";
            }

            var isInitialPass = node.nodeTemplate === undefined;

            if (isInitialPass) {
                testTemplate = testTemplate || node.nodeValue;
                if (typeof (testTemplate) === "string" && testTemplate.indexOf("{{") !== -1) {
                    node.nodeTemplate = testTemplate;
                } else {
                    node.nodeTemplate = null;
                }
            }

            if (node.nodeTemplate) {
                node.nodeValue = node.nodeTemplate.replace(/{{(.*?)}}/g, function ($0) {
                    var prop = toPrefixedCamel($0.slice(2, -2)),
                        value = self.get(prop, true) || "";

                    if (isInitialPass) {
                        self.addWatch(prop, node);
                    }
                    if (node.nodeName === "name" && value) {
                        self.addWatch(value, node);
                    }
                    return value;
                });
            }

            return node.nodeValue;
        };





        //<<<<<<<<<< attribute based methods >>>>>>>>>>

        var childTemplate = function (el, rawValue, prop, dataValue) {
            var clone;

            if (dataValue) {
                self.templates[dataValue] = self.templates[dataValue] || document.getElementById(dataValue);

                if (self.templates[dataValue]) {
                    clone = self.templates[dataValue].cloneNode(true);
                    clone.removeAttribute("id");
                    el.appendChild(clone);
                    this.parseNode(clone);
                    this.childFromTemplate = clone;
                }
            }
            return el;
        };

        var renderIf = function (el, rawValue, prop, dataValue) {
            this.surroundByComments(el, "render if " + rawValue, el, true);
            if (dataValue && !el.parentElement) {
                el.placeholder.parentNode.insertBefore(el, el.placeholder);
            } else if (!dataValue && el.parentElement) {
                el.parentElement.removeChild(el);
            }
            return el;
        };

        var setNodeValue = function (el, prop, attr) {
            //sets node value to data property value
            var value = self.get(prop, true);

            if (value !== undefined) {
                if (el.type === "radio" && attr === "name") {
                    el.checked = (value === el.value);
                } else if (el.type === "checkbox" && attr === "name") {
                    el.checked = (value.indexOf(el.value) !== -1);
                } else if (el.tagName === "SELECT" && !value) {
                    setTimeout(function () {
                        el.selectedIndex = "-1";
                    }, 0);
                } else if (el.tagName === "OPTION" && attr === "value") {
                    el.selected = (self.get(el.parentElement.name) || "").indexOf(el.value) !== -1;
                } else {
                    el.value = value;
                }
            }

            return el;
        };




        //<<<<<< Listeners, Handlers, and Watches >>>>>>

        var setListeners = function (handleKeyUp) {
            //listen for changes in the container element's dataset
            self.observer = new MutationObserver(mutationHandler);

            //listen for form control changes within our container
            self.container.addEventListener("change", changeHandler);

            if (handleKeyUp !== false) {
                //update data on keyup if desired
                self.container.addEventListener("keyup", keyUpHandler);
            }

            return self;
        };

        var turnOnBindings = function () {
            if (self.observer) {
                self.observer.observe(self.container, {
                    attributes: true,
                    attributeOldValue: true
                });
            }
            return self.observer;
        };

        this.turnOnAllBindings = function () {
            turnOnBindings();
            for (var childKey in self.children) {
                if (self.children.hasOwnProperty(childKey)) {
                    self.children[childKey].turnOnAllBindings();
                }
            }
            return self;
        };

        var turnOffBindings = function () {
            if (self.observer) {
                self.observer.disconnect();
            }
            return self.observer;
        };

        var mutationHandler = function (mutations) {
            //upon mutation of the dataset calls into methods to update the DOM and fire watches

            mutations.forEach(function (mutation) {
                if (mutation.target === (self.boundHiddenInput || self.container)) {
                    var prefix = "data-",
                    value = mutation.target.getAttribute(mutation.attributeName),
                    prop;

                    //we are only interested in changes to data attributes and only ones within the namesspace if one is configured
                    if (mutation.attributeName.substr(0, prefix.length) === prefix && value !== mutation.oldValue) {
                        prop = toCamelCase(mutation.attributeName.substr(prefix.length));
                        self.root.lastMutation = { prop: prop, value: value, oldValue: mutation.oldValue };
                        self.checkWatches(prop);
                        self.checkWatches("*");
                    }
                }
            });
            return mutations;
        };

        var keyUpHandler = function (e) {
            //triggers change if desired
            var changeEvent = document.createEvent('HTMLEvents');

            changeEvent.initEvent('change', true, false);
            e.target.dispatchEvent(changeEvent);
            return changeEvent;
        };

        var changeHandler = function (e) {
            //handles changes to form control values within the container
            var val = getNodeValue(e.target),
              prop = e.target.name;

            e.stopPropagation();

            if (self.containingArray && self.parent.get(prop) !== undefined && (e.target.type === "radio" || e.target.type === "checkbox")) {
                //checkboxes and radios created in childArrays should change the value in the parent DataBinding instance
                return self.parent.set(prop, val);
            } else {
                return self.set(prop, val);
            }
        };

        this.watch = function (props, fn, globalScope) {
            //adds a watch function to a data property or array of data properties
            var globalWatch = ["*"],
                instance;

            if (typeof (props) === "function") {
                globalScope = fn;
                fn = props;
                props = globalWatch;
            } else if (typeof (props) === "string") {
                props = [props];
            }
            props = props || globalWatch;
            instance = globalScope ? self.root : self;

            for (var i = 0, stop = props.length; i < stop; i++) {
                instance.addWatch(props[i], { fn: fn, props: props }, globalScope);
            }

            return instance[globalScope ? "globalScopeWatches" : "watches"];
        };

        this.addWatch = function (prop, nodeOrObj, globalScope) {
            //adds a watch object with a function or node with implicit function to a given data property
            var watchType = globalScope ? "globalScopeWatches" : "watches",
                instance = globalScope ? self.root : self;

            instance[watchType][prop] = instance[watchType][prop] || [];
            if (instance[watchType][prop].indexOf(nodeOrObj) === -1) {
                instance[watchType][prop].push(nodeOrObj);
            }

            return nodeOrObj;
        };

        this.checkWatches = function (prop, recursive) {
            //check watches on the specific property as well as general watches which apply and execute

            if (self.watches[prop]) {
                iterateWatchArray(prop, false);
                iterateWatchArray("*", false);
                //global watches are only executed if there is a relevant local watch
                if (self.root.globalScopeWatches[prop]) {
                    iterateWatchArray(prop, true);
                }
                if (self.root.globalScopeWatches["*"]) {
                    iterateWatchArray("*", true);
                }
            }

            if (recursive !== false) {
                for (var childKey in self.children) {
                    if (self.children.hasOwnProperty(childKey)) {
                        //recurse through child instances in case the property is inheritted
                        self.children[childKey].checkWatches(prop);
                    }
                }
            }

            function iterateWatchArray(prop, globalScope) {
                //iterate watches related to property and exectute
                var instance = globalScope ? self.root : self,
                    watchType = globalScope ? "globalScopeWatches" : "watches",
                    watches = instance[watchType][prop], node;

                if (watches) {
                    for (var i = watches.length - 1; i >= 0; i--) {
                        if (watches[i].fn) {
                            //for watches of global scope we pull the function from the root instance
                            //but execute it in the context of local instance
                            executeWatchFn(watches[i], prop);
                        } else {
                            node = watches[i];
                            if (node.nodeType === 2) {
                                resolveAttrNode(node);
                            } else {
                                resolveDoubleCurlyBraces(node);
                            }
                        }
                    }
                }
            }

            return prop;
        };

        var executeWatchFn = function (watch) {
            //execute a watch function in the context of the instance with designated arguments

            var lastMut = self.root.lastMutation,
                args = [lastMut.value, lastMut.oldValue, lastMut.prop],
                watchProps = {};

            //on recursive watch functions
            //only execute once in the context that contains the changed property
            if (self.get(lastMut.prop) !== undefined || !watch.recursive) {

                if (watch.props[0] !== "*") {
                    for (var i = 0, stop = watch.props.length; i < stop; i++) {
                        watchProps[watch.props[i]] = self.get(watch.props[i]);
                    }
                    args.push(watchProps);
                }

                return watch.fn.apply(self, args);
            }
        };





        //<<<<<<<<< Initialization >>>>>>>>>>

        var initProps = function () {
            //initialize properties

            self.configs = configs || {};
            self.nameSpace = typeof (self.configs.nameSpace) === "string" ? self.configs.nameSpace : "";
            self.attrPrefix = typeof (self.configs.attrPrefix) === "string" ? self.configs.attrPrefix : "";
            self.container = setContainer();
            self.id = id || self.container.id || self.container.name || "binding-" + new Date().getTime();
            self.watches = self.configs.watches || {};
            self.globalScopeWatches = self.configs.globalScopeWatches || {};
            self.checkboxDataDelimiter = self.configs.checkboxDataDelimiter || ",";
            self.attrMethods = assign({}, self.configs.attrMethods || {});
            self.attrMethods.name = setNodeValue;
            self.attrMethods[toPrefixedHyphenated("renderif")] = renderIf;
            self.attrMethods[toPrefixedHyphenated("childtemplate")] = childTemplate;
            self.templates = assign({}, self.configs.templates || {});

            return self;
        };

        var initFamilyTree = function () {
            //establish SimpleDataBinding instance relationships with other SimpleDataBinding instances 

            self.parent = parent;
            if (self.parent) {
                self.ancestors = self.parent.ancestors.slice();
                self.ancestors.push(parent);
            } else {
                self.ancestors = [];
            }
            self.root = self.ancestors[0] || self;
            self.children = {};
            self.childArrays = {};

            return self;
        };

        var initData = function () {
            //cascade initial data:
            //first capture values in container data attributes if presentvalues 
            //overwrite with values in form controls if present
            //overwrite again with start dataArgument if present

            self.data = prefixData((self.boundHiddenInput || self.container).dataset);
            self.update(self.data);
            getInitialNodeValues();
            self.update(startData || {});
            return self;
        };





        this.init = function () {
            //sets core properties
            //inits listeners
            //processes initial data

            initFamilyTree();
            initProps();
            initData();
            setListeners(this.configs.keyUp);
            if (this === this.root) {
                this.turnOnAllBindings();
            }

            self.initialized = true;

            return this;
        };

        this.init();
    }

    window.SimpleDataBinding = SimpleDataBinding;
})();
(function () {
    function LiveArrayFactory(MemberClass, createMethodName, moveMethodName, removeMethodName) {
        //creates an object that adds callbacks to array methods
        //for synchronization of the array members with an expected class
        //insures that all members are class instances after array methods are executed
        //ARGUMENTS
        //MemberClass: function (constructor)
        //createMethodName: string (must correspond to name method of MemberClass PROTOTYPE, not just a method within the constructor)
        //moveMethodName: string (MemberClass method name)
        //removeMethodName: string (MemberClass method name)

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
            var array = this,
                args = Array.prototype.slice.call(arguments),
                member, callBackArgs, i, stop;

            if (removeMethodName && array.priorState) {
                for (i = 0, stop = array.priorState.length; i < stop; i++) {
                    member = array.priorState[i];
                    if (member instanceof MemberClass && array.indexOf(member) === -1) {
                        callBackArgs = args.slice();
                        callBackArgs.unshift(i);
                        callBackArgs.unshift(array);
                        member[removeMethodName].apply(member, callBackArgs);
                    }
                }
            }
            for (i = 0, stop = array.length; i < stop; i++) {
                callBackArgs = args.slice();

                member = array[i];
                //take action only if the array member has changed
                if (!array.priorState || member !== array.priorState[i] || !member || !array.priorState[i]) {
                    if (member instanceof MemberClass) {
                        if (moveMethodName && array.priorState) {
                            callBackArgs.unshift(i);
                            callBackArgs.unshift(array);
                            member[moveMethodName].apply(member, callBackArgs);
                        }
                    } else if (member !== undefined) {
                        if (createMethodName) {
                            callBackArgs.unshift.apply(callBackArgs, [member, array, i]);
                            array[i] = MemberClass.prototype[createMethodName].apply(array, callBackArgs);
                        } else {
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
        Bind.prototype.createLiveArrayMember = function (data, array, i) {
            //transforms the array member from data to object instance
            //context of the array
            //since no member instance exists yet
            var placeholder = (array[i + 1] && array[i + 1].container) || array.placeholder;

            return array.ownerInstance.createChildArrayMember(array, data, placeholder);
        };
        Bind.prototype.moveLiveArrayMember = function (array, i) {
            //move the member instance within the array
            //context of the member instance
            var placeholder = (array[i + 1] && array[i + 1].container) || array.placeholder;

            this.container.parentElement.insertBefore(this.container, placeholder);
            return this;
        };
        Bind.prototype.removeLiveArrayMember = function () {
            //remove the member instance from the array
            //context of the member instance
            this.container.parentElement.removeChild(this.container);
            return this;
        };
        liveArrayFactory = new LiveArrayFactory(Bind, "createLiveArrayMember", "moveLiveArrayMember", "removeLiveArrayMember");
        Bind.prototype.arrayEnhancer = liveArrayFactory;
    }
})();