(function () {
    function SimpleDataBinding(container, startData, configs, id, parentInstance) {
        //binds data to and from form controls, text nodes, and attributes
        //automatically repeats markup bound to arrays
        //includes basic templating and easily extended for more complex DOM interaction
        //see https://avramlavinsky.github.io/simple-data-binding/docs/guide.html for usage

        var self = this,
            doc = document;


        //<<<< Core Data Methods >>>>

        this.set = function (prop, val, inherit, repository, setWhereDefined) {
            //set value in the closest instance where that value exists
            //or set it as a new property for this instance
            var parentInstance = self, existingValue;

            prop = toPrefixedCamel(prop);
            repository = repository || "data";
            existingValue = self.data[prop];

            if (setWhereDefined) {
                while (existingValue === undefined && inherit !== false && parentInstance.parent) {
                    //search for a reference to the property in ancestors
                    parentInstance = parentInstance.parent;
                    existingValue = parentInstance[repository][prop];
                }

                if (existingValue === undefined) {
                    //if there is no reference, set our existingValue in this instance
                    self[repository][prop] = val;
                } else {
                    //otherwise set the existingValue in the parent
                    parentInstance[repository][prop] = val;
                }
            } else {
                self[repository][prop] = val;
            }

            if (self.configs.modifyInputObjects && repository === "data") {
                startData[prop] = val;
            }

            return self[repository][prop];
        };

        this.get = function (prop, inherit, repository) {
            //get the closest inheritted value unless inherit is false
            var parentInstance = self, value;

            prop = toPrefixedCamel(prop);
            repository = repository || "data";
            value = self[repository][prop];

            while (value === undefined && inherit !== false && parentInstance.parent) {
                //values of a null string or even null will not inherit from the parent
                //only undefined
                parentInstance = parentInstance.parent;
                value = parentInstance[repository][prop];
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

        this.removeChild = function (child) {
            child.container.parentNode.removeChild(child.container);
            delete self.children[child.id];
            child.removed = true;
            return child;
        };

        var wireData = function (data) {
            if (data) {
                if (data.$bindings) {
                    data.$bindings.push(self);
                } else {
                    wire("$bindings", [self]);
                    wire("$set", $set);
                }
                wire("$binding",self);
            }

            function $set (prop, val) {
                for (var i = 0, stop = data.$bindings.length; i < stop; i++) {
                    if (data.$bindings[i] && data.$bindings[i].set) {
                        data.$bindings[i].set(prop, val);
                    }
                }
                return val;
            }

            function wire(prop, val) {
                Object.defineProperty(data, prop, {
                    enumerable: false,
                    configurable: true,
                    value: val
                });
            }

            return data;
        };

        var createChildArray = function (prop, data, el) {
            var ASSEMBLEASFRAGMENT = false,//possible performance enhancement currently not proven
                i, stop, ar, templateElement, parentNode, parentPlaceholder, grandparent;

            if (self.childArrays[prop]) {
                ar = self.childArrays[prop];
                for (i = 0, stop = ar.length; i < ar.length; i++) {
                    self.removeChild(ar[i]);
                }
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
                parentNode = self.childArrays[prop].placeholderNode.parentNode;
                parentPlaceholder = parentNode.nextElementSibling;
                grandparent = parentNode.parentElement;
                grandparent.removeChild(parentNode);
            }

            for (i = 0, stop = data.length; i < stop; i++) {
                ar[i] = (self.createChildArrayMember(ar, data[i]));
            }

            if (ASSEMBLEASFRAGMENT) {
                if (parentPlaceholder) {
                    parentPlaceholder.parentNode.insertBefore(parentNode, parentPlaceholder);
                } else {
                    grandparent.appendChild(parentNode);
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
            var id = data.name || data.id || data.heading || data.label;

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
            var child = null, cachedChild;

            cachedChild = self.cache.get(data);
            if (cachedChild && container && cachedChild.removed) {
                cachedChild.container = container;
                cachedChild.parseNode(container);
                child = cachedChild;
            } else {
                child = new SimpleDataBinding(container, data, self.configs, id, self);
            }

            self.children[id] = child;
            return child;
        };

        var find = function (id, all, topInstance) {
            var children = self.children,
                childArrays = self.childArrays,
                childId;

            topInstance = topInstance || (self.found = []) && self;
            if (children[id]) {
                self.root.found.push(children[id]);
            }
            if (childArrays[id]) {
                self.root.found.push(childArrays[id]);
            }
            if (all || !self.root.length) {
                for (childId in children) {
                    if (children.hasOwnProperty(childId)) {
                        children[childId].find(id, all, topInstance);
                    }
                }
            }
            return all ? self.root.found : self.root.found[0];
        };

        this.find = function (id) {
            return find(id);
        };

        this.findAll = function (id) {
            return find(id, true);
        };

        this.export = function (unprefix) {
            //creates an (unbound) clone of data
            //recreates nesting via recursion
            //removes namespace from property names
            var dataClone = assign({}, self.data);

            if (unprefix) {
                dataClone = unprefixData(dataClone);
            }

            for (var childId in self.children) {
                if (self.children.hasOwnProperty(childId) && self.children[childId]) {
                    dataClone[childId] = self.children[childId].export();
                }
            }
            return dataClone;
        };

        /* test-code */
        this.createChildArray = createChildArray;
        this.assign = assign;
        this.generateChildArrayMemberId = generateChildArrayMemberId;
        this.wireData = wireData;
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
            while (!is(el, selector) && el !== doc.body) {
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
            var parentContainer = (parentInstance && parentInstance.container) || doc;
            if (container) {
                self.container = container.tagName ? container : parentContainer.querySelector(container);
            }
            if (id && !self.container) {
                self.container = parentContainer.querySelector('[' + toPrefixedHyphenated('databind') + '="' + id + '"]');
            }
            if (!self.container && !parentInstance) {
                //only if we are instantiating a new root do we default to the first element with a databind attribute or the first form or the body
                self.container =  doc.querySelector('[' + toPrefixedHyphenated('databind') + ']') || doc.forms[0] || doc.body;
            }
            return self.container;
        };

        var getContainer = function (prop) {
            //finds the appropriate container for a child instance or element template for an array
            var container = self.container.querySelector('[' + toPrefixedHyphenated('databind') + '="' + prop + '"]');

            return container;
        };

        var setId = function () {
            var instanceId = id,
                timeStamp = new Date().getTime().toString();
            
            if (self.container) {
                if (!instanceId) {
                    instanceId = self.container.id || self.container.name || "binding-" + self.container.tagName + "-" + timeStamp;
                }
                self.container.setAttribute("databind", instanceId);
            }
            return instanceId || timeStamp;
        };

        var setHiddenInput = function () {
            var input;

            if (self.configs.useHiddenInput) {
                input = doc.createElement("input");
                input.type = "hidden";
                (self.container || doc).appendChild(input);
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
                obj.placeholderNode = doc.createComment("end " + message);
                elementTemplate.placeholderNode = obj.placeholderNode;
                elementTemplate.parentNode.insertBefore(doc.createComment("start " + message), elementTemplate);
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

        this.removeCommentedElements = function (placeholder, attr) {
            while (placeholder.previousSibling && placeholder.previousSibling.nodeType !== 8) {
                if (placeholder.previousSibling.nodeType === 1 && (! attr || placeholder.previousSibling.getAttribute(attr) !== null)) {
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

                    if (node.getAttribute("databind")) {
                        setTimeout(function () {
                            node.classList.remove("unparsed");
                            node.classList.add("parsed");
                        }, 0);
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
            var attrName;

            if ( node.rawName === undefined ) {
                if (node.nodeName.substr(-2, 2) === "__") {
                    node.rawName = node.nodeName.slice(2, -2);
                    node.originalEl = node.ownerElement;
                    node.prevAttrName = node.nodeName;
                } else {
                    node.rawName = null;
                }
            }

            if (node.rawName !== null) {
                attrName = parseExpression(toPrefixedCamel(toCamelCase(node.rawName)), node);
                if (attrName !== node.prevAttrName) {
                    if (attrName) {
                        node.originalEl.setAttribute(attrName, node.nodeValue);
                    }
                    if (node.prevAttrName) {
                        node.originalEl.removeAttribute(node.prevAttrName);
                    }
                    node.prevAttrName = attrName;
                }
            }
            return attrName;
        };

        var resolveAttrNodeValue = function (node) {
            //resolve curly braces and call attribute based methods

            var attrMethodName = node.nodeName,
                attrMethod = self.attrMethods[attrMethodName],
                el = node.ownerElement,
                value, name;

            resolveDoubleCurlyBraces(node, node.nodeValue);
            value = node.value || el && el[node.name];//be ware of element properties like node.href which may differ dramatically from the attribute node value
            if (attrMethodName === "value" && (el.type === "radio" || el.type === "checkbox" || el.tagName === "OPTION")) {
                name = el && el.name;
                if (!name && el.tagName === "OPTION") {
                    name = el.parentNode.name;
                }
                setNodeValue(el, parseExpression(name, node, false), name, "name");
            }
            if (attrMethod) {
                attrMethod.apply(self, [el, parseExpression(node.nodeValue, node), node.nodeValue, node.nodeName]);
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

        var parseFunctionOrObject = function (str, node, addWatches) {

            if (str.substr(0, 5) === "this.") {

                var parenIndex = str.indexOf("("),
                    argsArray = parenIndex > 0 && str.slice(parenIndex + 1, -1).split(","),
                    path = str.substr(0, parenIndex === -1 ? str.length : parenIndex),
                    pointer = self,
                    pathArray, fn, i, stop;

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
                    if (addWatches !== false) {
                        self.watch(argsArray, fn);
                    }
                    return fn;
                } else {
                    return pointer;
                }
            } else {
                return null;
            } 
        };

        var parseExpression = function (str, node, addWatches) {
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

            fn = parseFunctionOrObject(str, node, addWatches);//parseFunctionOrObject adds its own watches so no need to add here
            if (fn) {
                //important that return values for function as well as get should be undefined, not a null string, under failure conditions
                //otherwise setNodeValue will overwrite previously set values to no selection for selects
                value = typeof(fn) === "function" ? fn(): fn;
            } else {
                value = self.get(str, true);
                if (addWatches !== false) {
                    self.watch(str, node);
                } 
            }
            if (node && node.nodeName === "name" && value && addWatches !== false) {
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


        //<<<<<<<<<< attribute based methods and their subfunctions >>>>>>>>>>

        this.templateMaster = function (placeClone) {
            return function (el, parsedAttrValue) {
                var clone;

                if (parsedAttrValue) {
                    self.templates[parsedAttrValue] = self.templates[parsedAttrValue] || doc.getElementById(parsedAttrValue);

                    if (self.templates[parsedAttrValue]) {
                        clone = self.templates[parsedAttrValue].cloneNode(true);
                        clone.removeAttribute("id");
                        if (el.placeholderNode) {
                            self.removeCommentedElements(el.placeholderNode);
                            el.placeholderNode.parentNode.insertBefore(clone, el.placeholderNode);
                        } else {
                            placeClone(el, clone);
                            self.surroundByComments(el, "template " + parsedAttrValue, clone, true);
                        }
                        self.parseNode(clone);
                    }
                }
                return el;
            };
        };

        var childTemplate = self.templateMaster(function (el, clone) {
            el.appendChild(clone);
        });

        var renderIf = function (el, parsedAttrValue, rawAttrValue) {
            this.surroundByComments(el, "render if " + rawAttrValue, el, true);
            if (parsedAttrValue && !el.parentElement) {
                el.placeholderNode.parentNode.insertBefore(el, el.placeholderNode);
            } else if (!parsedAttrValue && el.parentElement) {
                el.parentElement.removeChild(el);
            }
            return el;
        };

        var setNodeValue = function (el, parsedAttrValue, rawAttrValue, attrName) {
            //sets node value to data property value
            if (parsedAttrValue !== undefined) {
                if (el.type === "radio" && attrName === "name") {
                    el.checked = (parsedAttrValue === el.value);
                } else if (el.type === "checkbox" && attrName === "name") {
                    el.checked = (parsedAttrValue.indexOf(el.value) !== -1);
                } else if (el.tagName === "SELECT" && !parsedAttrValue) {
                    setTimeout(function () {
                        el.selectedIndex = "-1";
                    }, 0);
                } else if (el.tagName === "OPTION" && (attrName === "value" || attrName === "name")) {
                    el.selected = el.value && (parsedAttrValue).indexOf(el.value) !== -1;
                } else {
                    el.value = parsedAttrValue;
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
            if (self.container) {
                //listen for changes in the container element's dataset
                observer = new MutationObserver(mutationHandler);
                /* test-code */
                self.observer = observer;
                /* end-test-code */

                //listen for form control changes within our container
                self.container.addEventListener("change", changeHandler);

                if (handleKeyUp !== false) {
                    //update data on keyup if desired
                    self.container.addEventListener("keyup", keyUpHandler);
                }

                if (self === self.root) {
                    self.turnOnAllBindings();//execute inline incase inline code makes changes to data immediately after init
                    setTimeout(function () {
                        self.turnOnAllBindings();//a necessary failsafe in case all children have not initialized
                    });
                }
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
            for (var childId in self.children) {
                if (self.children.hasOwnProperty(childId) && self.children[childId]) {
                    self.children[childId].turnOnAllBindings();
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
                        self.checkWatches(prop);
                        self.checkWatches("*");
                    }
                }
            });
            return mutations;
        };

        var keyUpHandler = function (e) {
            //triggers change if desired
            var changeEvent = doc.createEvent('HTMLEvents');

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
                return self.parent.set(prop, val, true, "data", true);
            } else {
                return self.set(prop, val, true, "data", true);
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
                for (var childId in self.children) {
                    if (self.children.hasOwnProperty(childId) && self.children[childId]) {
                        //recurse through child instances in case the property is inheritted
                        self.children[childId].checkWatches(prop);
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
        this.executeWatchFn = executeWatchFn;
        /* end-test-code */


        //<<<<<<<<< Initialization >>>>>>>>>>

        var initArgs = function () {
            if (container && typeof (container) === "object" && ! container.tagName) {
                parentInstance = id;
                id = configs;
                configs = startData;
                startData = container;
                container = null;
            }
            return startData;
        };

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
            self.cache = new WeakMap();

            return self;
        };

        var initFamilyTree = function () {
            //establish SimpleDataBinding instance relationships with other SimpleDataBinding instances 

            self.parent = parentInstance;
            if (self.parent) {
                self.ancestors = self.parent.ancestors.slice();
                self.ancestors.push(parentInstance);
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
            var el = self.boundHiddenInput || self.container;
            
            if (el) {
                if (startData && self.parent) {
                    self.parent.cache.set(startData, self);
                }          
                self.data = prefixData(el.dataset);
                self.update(self.data);
                getInitialNodeValues();
                self.update(startData || {});
                wireData(startData);
            }
            return self;
        };


        /* test-code */
        this.initArgs = initArgs;
        this.initProps = initProps;
        this.initFamilyTree = initFamilyTree;
        this.initData = initData;
        /* end-test-code */


        this.init = function () {
            //sets core properties
            //inits listeners
            //processes initial data

            initArgs();
            initFamilyTree();
            initProps();
            initData();
            setListeners(this.configs.keyUp);

            self.initialized = true;

            return this;
        };

        this.init();
    }

    window.SimpleDataBinding = SimpleDataBinding;

    window.$bind = function (container, startData, configs, id) {
        configs = configs || {};
        configs.updateInputArrays = true;
        configs.updateInputObjects = true;
        return new SimpleDataBinding(container, startData, configs, id);
    };
})();
