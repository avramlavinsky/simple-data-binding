(function () {
    function SimpleDataBinding(container, startData, configs, id, parent) {
        //binds data to and from form controls, text nodes, and attributes
        //automatically repeats markup bound to arrays
        //includes basic templating and easily extended for more complex DOM interaction
        //
        //arguments
        //  add some new data for github test
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
                        checkWatches(prop);
                    }
                }
            }

            self.parseNode(self.container);

            checkWatches("*", false);

            if (self.root.initialized) {
                turnOnBindings();
            }

            return self.data;
        };

        var createChildArray = function (prop, data, el) {
            var ASSEMBLEASFRAGMENT = false,//possible performance enhancement currently not proven
                ar, templateElement, parent, parentPlaceholder, grandparent;

            if (self.childArrays[prop]) {
                ar = self.childArrays[prop];
                self.removeCommentedElements(ar.placeholderNode, "databind", prop);
                ar.length = 0;
            } else {
                templateElement = el || getContainer(prop);
                if (!templateElement) {
                    return null;
                }
                ar = self.configs.modifyInputArrays === true ? data : [],
                self.childArrays[prop] = ar;
                ar.idIndex = 0;
                ar.ownerInstance = self;
                ar.id = prop;
                self.surroundByComments(ar, "child array " + prop, templateElement);
            }

            if (ASSEMBLEASFRAGMENT) {
                parent = self.childArrays[prop].placeholderNode.parentNode;
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
                    el = cloneInPlace(childArray.elementTemplate, placeholder || childArray.placeholderNode),
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
                id = (id || childArray.id) + childArray.idIndex;
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

        /* test-code */
        this.createChildArray = createChildArray;
        this.assign = assign;
        this.generateChildArrayMemberId = generateChildArrayMemberId;
        /* end-test-code */


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

        /* test-code */
        this.toCamelCase = toCamelCase;
        this.toHyphenated = toHyphenated;
        this.toPrefixedCamel = toPrefixedCamel;
        this.toPrefixedHyphenated = toPrefixedHyphenated;
        this.toUnprefixedCamel = toUnprefixedCamel;
        this.prefixData = prefixData;
        this.unprefixData = unprefixData;
        /* end-test-code */


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
            if (container) {
                self.container = container.tagName ? container : document.querySelector(container);
            }
            if ( ! self.container){
                self.container = (id && document.querySelector('[' + toPrefixedHyphenated('databind') + '="' + id + '"]')) || document.querySelector('[' + toPrefixedHyphenated('databind') + ']') || document.forms[0] || document.body;
            }
            return self.container;
        };

        var getContainer = function (prop) {
            //finds the appropriate container for a child instance or element template for an array
            var container = self.container.querySelector('[' + toPrefixedHyphenated('databind') + '="' + prop + '"]');

            return container;
        };

        var setId = function () {
            var instanceId = id || self.container.id || self.container.name || "binding-" + self.container.tagName + "-" + new Date().getTime();

            self.container.setAttribute("databind", instanceId);
            return instanceId;
        };

        var setHiddenInput = function () {
            var input;

            if (self.configs.useHiddenInput) {
                input = document.createElement("input");
                input.type = "hidden";
                self.container.appendChild(input);
            }
            return input;
        };

        this.surroundByComments = function (obj, message, elementTemplate, retain) {
            //surround an element by comments
            //add properties to an associated object:
            //   elementTemplate:  the element
            //   placeholder:  the new trailing comment

            if (!obj.placeholderNode) {
                obj.elementTemplate = elementTemplate;
                obj.placeholderNode = document.createComment("end " + message);
                elementTemplate.placeholderNode = obj.placeholderNode;
                elementTemplate.parentNode.insertBefore(document.createComment("start " + message), elementTemplate);
                if (elementTemplate.nextElementSibling) {
                    elementTemplate.parentNode.insertBefore(obj.placeholderNode, elementTemplate.nextElementSibling);
                } else {
                    elementTemplate.parentNode.appendChild(obj.placeholderNode);
                }
                if (!retain) {
                    elementTemplate.parentNode.removeChild(elementTemplate);
                }
            }
            return obj.placeholderNode;
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
            var attrName, el, newNode;

            if (node.nodeName.substr(-2, 2) === "__") {
                node.rawName = node.nodeName.slice(2, -2);
            }

            if (node.rawName) {
                el = node.ownerElement;
                attrName = parseExpression(node.rawName, node);
                if (attrName && attrName !== node.nodeName) {
                    setTimeout(function () {
                        //wait for our current dynamcally named node to resolve it's value
                        el.setAttribute(attrName, node.nodeValue);
                        newNode = el.attributes[attrName];
                        newNode.rawName = node.rawName;
                        el.removeAttribute(node.nodeName);
                    });
                }
            }

            return node;
        };

        var resolveAttrNodeValue = function (node) {
            //resolve curly braces and call attribute based methods

            var attrMethodName = node.nodeName,
                attrMethod = self.attrMethods[attrMethodName],
                value;

            resolveDoubleCurlyBraces(node, node.nodeValue);
            value = node.value || node.ownerElement[node.name];//be ware of element properties like node.href which may differ dramatically from the attribute node value
            if (attrMethodName === "value" && (node.ownerElement.type === "radio" || node.ownerElement.type === "checkbox" || node.ownerElement.tagName === "OPTION")) {
                setNodeValue(node.ownerElement, node.ownerElement.getAttribute("name"), "name");
            }
            if (attrMethod) {
                attrMethod.apply(self, [node.ownerElement, node.nodeValue, node.nodeName, parseExpression(node.nodeValue, node)]);
            }
            return node;
        };

        var resolveDoubleCurlyBraces = function (node) {
            //replace value (attribute value or text node value) in curly braces with corresponding data value
            if (!node) {
                return "";
            }

            var isInitialPass = node.nodeTemplate === undefined,
                testTemplate = node.nodeValue;

            if (isInitialPass) {
                if (typeof (testTemplate) === "string" && testTemplate.indexOf("{{") !== -1) {
                    node.nodeTemplate = testTemplate;
                } else {
                    node.nodeTemplate = null;
                }
            }

            if (node.nodeTemplate) {
                node.nodeValue = node.nodeTemplate.replace(/{{(.*?)}}/g, function ($0) {
                    return parseExpression($0.slice(2, -2), node);
                });
            }

            return node.nodeValue;
        };

        var parseFunctionOrObject = function (str, node, watchCallBack) {

            if (str.substr(0, 5) === "this.") {

                var parenIndex = str.indexOf("("),
                    argsArray = parenIndex > 0 && str.slice(parenIndex + 1, -1).split(","),
                    path = str.substr(0, parenIndex === -1 ? str.length : parenIndex),
                    pointer = self,
                    pathArray, fn, watchFn, i, stop;

                pathArray = path.split(".");
                for (i = 1, stop = pathArray.length; i < stop; i++) {
                    if (pointer) {
                        pointer = pointer[pathArray[i]];
                    }
                }

                if (typeof (pointer) === "function") {
                    fn = function () {
                        var args = [];
                        for (i = 0, stop = argsArray.length; i < stop; i++) {
                            args[i] = parseExpression(argsArray[i].trim(), node);
                        }
                        return pointer.apply(self, args);
                    };
                    watchFn = function () {
                        var result = fn();
                        if (watchCallBack) {
                            watchCallBack(result);
                        } else {
                            node.nodeValue = result;
                        }
                        return result;
                    };
                    self.watch(argsArray, watchFn);
                    return fn;
                } else {
                    return pointer;
                }
            } else {
                return null;
            } 
        };

        var parseExpression = function (str, node, watchCallBack) {
            if (!str) {
                return str;
            }

            var stringPrimitive = str.substr(0, 1) === "'" && str.slice(1, -1),
                numberPrimitive = Number(str),
                fn, value;

            if (stringPrimitive) {
                return stringPrimitive;
            }
            if (!isNaN(numberPrimitive)) {
                return numberPrimitive;
            }

            fn = parseFunctionOrObject(str, node, watchCallBack);//parseFunctionOrObject adds its own watches so no need to add here
            if (fn) {
                value = typeof (fn) === "function" ? fn() : fn;
            } else {
                value = self.get(str, true) || "";
                self.watch(str, node);
            }
            if (node.nodeName === "name" && value) {
                self.watch(value, node);
            }
            return value;
        };


        /* test-code */
        this.is = is;
        this.closest = closest;
        this.cloneInPlace = cloneInPlace;
        this.getNodeValue = getNodeValue;
        this.getInitialNodeValues = getInitialNodeValues;
        this.setContainer = setContainer;
        this.getContainer = getContainer;
        this.setHiddenInput = setHiddenInput;
        this.setId = setId;
        this.resolveAttrNode = resolveAttrNode;
        this.resolveAttrNodeName = resolveAttrNodeName;
        this.resolveAttrNodeValue = resolveAttrNodeValue;
        this.resolveDoubleCurlyBraces = resolveDoubleCurlyBraces;
        this.parseFunctionOrObject = parseFunctionOrObject;
        this.parseExpression = parseExpression;
        /* end-test-code */


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
                el.placeholderNode.parentNode.insertBefore(el, el.placeholderNode);
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

        /* test-code */
        this.childTemplate = childTemplate;
        this.renderIf = renderIf;
        this.setNodeValue = setNodeValue;
        /* end-test-code */


        //<<<<<< Listeners, Handlers, and Watches >>>>>>

        var observer;

        var setListeners = function (handleKeyUp) {
            //listen for changes in the container element's dataset
            observer = new MutationObserver(mutationHandler);
            /* test-code */
            this.observer = observer;
            /* end-test-code */

            //listen for form control changes within our container
            self.container.addEventListener("change", changeHandler);

            if (handleKeyUp !== false) {
                //update data on keyup if desired
                self.container.addEventListener("keyup", keyUpHandler);
            }

            return self;
        };

        var turnOnBindings = function () {
            if (observer) {
                observer.observe(self.container, {
                    attributes: true,
                    attributeOldValue: true
                });
            }
            return observer;
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
            if (observer) {
                observer.disconnect();
            }
            return observer;
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
                        checkWatches(prop);
                        checkWatches("*");
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

        this.watch = function (props, fnOrNode, globalScope) {
            //adds a watch function to a data property or array of data properties
            var globalWatch = ["*"],
                instance, watchType;

            if (typeof (props) === "string") {
                props = [props];
            }
            if ( ! (props instanceof Array)) {
                globalScope = fnOrNode;
                fnOrNode = props;
                props = globalWatch;
            }
            props = props || globalWatch;
            instance = globalScope ? self.root : self;
            watchType = globalScope ? "globalScopeWatches" : "watches";
            for (var i = 0, stop = props.length; i < stop; i++) {
                instance[watchType][props[i]] = instance[watchType][props[i]] || [];
                if (instance[watchType][props[i]].indexOf(fnOrNode) === -1) {
                    instance[watchType][props[i]].push(fnOrNode);
                }
            }

            return instance[globalScope ? "globalScopeWatches" : "watches"];
        };

        var checkWatches = function (prop, recursive) {
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
                        if (typeof(watches[i]) === "function") {
                            //for watches of global scope we pull the function from the root instance
                            //but execute it in the context of local instance
                            executeWatchFn(watches[i]);
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

        var executeWatchFn = function (fn) {
            //execute a watch function in the context of the instance with designated arguments

            var lastMut = self.root.lastMutation,
                args = [lastMut.value, lastMut.oldValue, lastMut.prop];

            if (self.get(lastMut.prop) !== undefined) {
                return fn.apply(self, args);
            }
        };


        /* test-code */
        this.setListeners = setListeners;
        this.turnOnBindings = turnOnBindings;
        this.turnOffBindings = turnOffBindings;
        this.mutationHandler = mutationHandler;
        this.keyUpHandler = keyUpHandler;
        this.changeHandler = changeHandler;
        this.checkWatches = checkWatches;
        this.executeWatchFn = executeWatchFn;
        /* end-test-code */


        //<<<<<<<<< Initialization >>>>>>>>>>

        var initProps = function () {
            //initialize properties

            self.configs = configs || {};
            self.nameSpace = typeof (self.configs.nameSpace) === "string" ? self.configs.nameSpace : "";
            self.attrPrefix = typeof (self.configs.attrPrefix) === "string" ? self.configs.attrPrefix : "";
            self.container = setContainer();
            self.id = setId();
            self.boundHiddenInput = setHiddenInput();
            self.watches = self.configs.watches || {};
            self.globalScopeWatches = self.configs.globalScopeWatches || {};
            self.checkboxDataDelimiter = self.configs.checkboxDataDelimiter || ",";
            self.attrMethods = assign({}, self.configs.attrMethods || {});
            self.attrMethods.name = setNodeValue;
            self.attrMethods[toPrefixedHyphenated("renderif")] = renderIf;
            self.attrMethods[toPrefixedHyphenated("childtemplate")] = childTemplate;
            self.templates = assign({}, self.configs.templates || {});
            self.logic = assign({}, self.configs.logic || {});

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


        /* test-code */
        this.initProps = initProps;
        this.initFamilyTree = initFamilyTree;
        this.initData = initData;
        /* end-test-code */


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
