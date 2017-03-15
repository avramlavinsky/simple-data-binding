(function () {

    var attrMethods = {}, proto;


    function SimpleDataBinding(container, startData, configs, id, parentInstance) {
        //binds data to and from form controls, text nodes, and attributes
        //automatically repeats markup bound to arrays
        //includes basic templating and easily extended for more complex DOM interaction
        //see https://avramlavinsky.github.io/simple-data-binding/docs/guide.html for usage

        var self = this,
            setNodeValue = this.rawAttrMethods.name,
            doc = document,
            observer;


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




        //<<<< Core Data Methods >>>>

        this.set = function (prop, val, inherit, repository, setWhereDefined) {
            //set value in the closest instance where that value exists
            //or set it as a new property for this instance
            var parentInstance = self, existingValue;

            prop = toPrefixedCamel(prop);
            repository = repository || "data";
            existingValue = self.data[prop];

            val = self.normalize(val);

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
                self[repository][prop] = repository === "data" ? (val || "") : val;
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

        this.dataBindFromAttr = function (el) {
            var prop = el.getAttribute(toPrefixedHyphenated("databind")),
                newData = self.get(prop, true, "startData");

            if (newData instanceof Array) {
                if (!el.parsed) {
                    el.parsed = true;
                    self.updateChildArray(prop, newData, el);
                }
            } else {
                self.createChild(prop, el, newData);
            }
        };

        this.update = function (newData, bindDuringUpdate, parse, bindObjects) {
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
                        if (bindObjects !== false) {
                            if (datum instanceof Array) {
                                self.updateChildArray(prop, datum);
                            } else {
                                self.createChild(prop, getContainer(prop), datum);
                            }
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

            if (parse !== false) {
                self.parseNode(self.container);
            }

            self.checkWatches("*", false);

            if (self.root.initialized) {
                turnOnBindings();
            }

            return self.data;
        };

        this.removeChild = function (child) {
            //remove a child instance from a childArray and it's container from the DOM
            removeChildContainer(child);
            delete self.children[child.id];
            child.removed = true;
            return child;
        };

        var wireData = function (data) {
            //add a few non enumerable properties to data object:
            //$bindings = all bindings associated with the object
            //$binding = this simple data binding instance
            //$set = set the property in the object and the binding and the DOM
            //$update = update all assocated bindings
            if (data) {
                if (data.$bindings) {
                    data.$bindings.push(self);
                } else {
                    wire("$bindings", [self]);
                    wire("$set", $set);
                }
                wire("$binding", self);
                wire("$update", $update);
            }

            function $update(newData) {
                for (var i = 0, stop = data.$bindings.length; i < stop; i++) {
                    data.$bindings[i].update(newData || data);
                }
            }

            function $set(prop, val) {
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
            //creates new child array of simple data binding instances
            var elementTemplate,
                ar = self.configs.modifyInputArrays === true ? data : [];

            ar.idIndex = 0;
            ar.ownerInstance = self;
            ar.id = prop;
            self.childArrayNameIndices[prop] = self.childArrayNameIndices[prop] || 0;
            if (self.childArrays[prop]) {
                self.childArrayNameIndices[prop]++;
                ar.id += self.childArrayNameIndices[prop] || "";
            }
            elementTemplate = el || getContainer(prop);
            if (elementTemplate) {
                self.surroundByComments(ar, "child array " + prop, elementTemplate);
                self.childArrays[ar.id] = ar;
                return ar;
            }
        };

        var resetChildArray = function (prop, data, el, ar) {
            //clean up removed members of child array and reset its placeholder comments if necessary
            var i, stop, elementTemplate;

            for (i = 0, stop = ar.priorState.length; i < stop; i++) {
                if (data.indexOf(ar.priorState[i]) === -1) {
                    self.removeChild(ar.priorState[i]);
                }
            }
            if (!document.body.contains(ar.placeholderNode)) {
                elementTemplate = el || getContainer(prop);
                if (!elementTemplate) {
                    return null;
                }
                self.surroundByComments(ar, "child array " + prop, elementTemplate);
            }
            ar.ownerInstance = self;
        };

        this.updateChildArray = function (prop, data, el) {
            //updates a child array of simple data binding instances with given data
            var ar = self.childArrays[prop],
                frag = document.createDocumentFragment();


            if (ar && ar.placeHolderNode === el) {
                resetChildArray(prop, data, el, ar);
            } else {
                ar = createChildArray(prop, data, el);
            }
            if (ar) {
                for (var i = 0, stop = data.length; i < stop; i++) {
                    ar[i] = self.createChildArrayMember(ar, data[i], frag);
                }
                ar.priorState = ar.slice();

                renderChildArray(ar, frag);

                if (self.arrayEnhancer && !ar.update) {
                    self.arrayEnhancer.enhance(ar);
                }

                return ar;
            }
        };

        this.createChildArrayMember = function (childArray, data, frag) {
            if (typeof (data) !== "object") {
                data = { value: data };//handle arrays of primitives
            }

            //creates a member of child array
            //accessed externally by live array methods
            var child = self.cache.get(data),
                childContainer;

            if (data instanceof SimpleDataBinding) {
                child = data;
                placeChildArrayEl(child.container, frag);
            } else if (child && child.removed) {
                self.createChild(child.id, child.container, data);
                placeChildArrayEl(child.container, frag);
            } else {
                //timing is very sensitive: must place the element in the document fragment before creating our child instance
                childContainer = placeChildArrayEl(createChildArrayEl(childArray), frag);
                child = self.createChild(generateChildArrayMemberId(childArray, data), childContainer, data);
                child.containingArray = childArray;
            }
            return child;
        };

        var generateChildArrayMemberId = function (childArray, data) {
            //generate a meaningful id for child instance within a child array
            var id = data.name;

            if (id) {
                self.childNameIndices[id] = self.childNameIndices[id] || 0;
                if (self.children[id]) {
                    self.childNameIndices[id]++;
                }
                id += self.childNameIndices[id] || "";
            } else {
                id = childArray.id + "_" + childArray.idIndex;
            }
            childArray.idIndex++;
            return id;
        };

        var setId = function () {
            //constructs a meaningful id for a SimpleDataBinding instance
            var instanceId = id,
                timeStamp = new Date().getTime().toString();

            if (self.container) {
                if (!instanceId) {
                    instanceId = self.container.getAttribute(toPrefixedHyphenated("databind")) || self.container.id || self.container.name || "binding-" + self.container.tagName + "-" + timeStamp;
                }
                if (!self.container.getAttribute(toPrefixedHyphenated("databind"))) {
                    self.container.setAttribute(toPrefixedHyphenated("databind"), instanceId);
                }
            }
            return instanceId || timeStamp;
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
                cachedChild.update(data, false, true, false);
                cachedChild.removed = false;
                child = cachedChild;
            } else {
                if (self.children[id] && !self.children[id].containingArray) {
                    self.childNameIndices[id] = self.childNameIndices[id] || 0;
                    self.childNameIndices[id]++;
                    id += self.childNameIndices[id] || "";
                }
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
                topInstance.found.push(children[id]);
            }
            if (childArrays[id]) {
                topInstance.found.push(childArrays[id]);
            }
            if (all || !topInstance.found.length) {
                for (childId in children) {
                    if (children.hasOwnProperty(childId)) {
                        children[childId].find(id, all, topInstance);
                    }
                }
            }
            return all ? topInstance.found : topInstance.found[0];
        };

        this.find = function (id) {
            return find(id);
        };

        this.findAll = function (id) {
            return find(id, true);
        };

        this.getBindingFor = function (el) {
            var closestContainer = closest(el, "[databind]"),
                id = closestContainer && closestContainer.getAttribute(toPrefixedHyphenated("databind")),
                bindings = self.root.findAll(id);

            return bindings.filter(function (binding) {
                return binding.container === closestContainer;
            })[0];
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
                    dataClone[childId] = self.children[childId].export(unprefix);
                }
            }
            return dataClone;
        };






        //<<< DOM Methods >>>

        var is = function (el, selector) {
            //polyfill for matches method
            var matchesTest = el ? (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector) : false;
            return matchesTest && matchesTest.call(el, selector);
        };

        var closest = function (el, selector) {
            //returns closest selector match in el or ancestors
            while (!is(el, selector) && el !== doc.body) {
                el = el.parentElement;
            }
            return el;
        };

        var placeChildArrayEl = function (el, frag) {
            //appends a child to a document fragment
            return frag && frag.appendChild(el);
        };

        var createChildArrayEl = function (childArray) {
            //create a container element for a child array member instance
            return childArray.elementTemplate.cloneNode(true);
        };

        var renderChildArray = function (childArray, frag) {
            var placeholder = childArray.placeholderNode;

            placeholder.parentNode.insertBefore(frag, placeholder);
            return placeholder;
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

        var getControlValue = function (el) {
            if (el.name !== "undefined" && el.type !== "radio" && el.type !== "checkbox" && el.tagName !== "OPTION") {
                var val = el.getAttribute("value");//NOT el.value since Chrome populates this with "on" by default in some contexts
                if (val && val.substr(0, 2) !== "{{") {
                    return self.set(el.name, getNodeValue(el));
                }
            }
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
                self.container = doc.querySelector('[' + toPrefixedHyphenated('databind') + ']') || doc.forms[0] || doc.body;
            }
            return self.container;
        };

        var getContainer = function (prop) {
            //finds the appropriate container for a child instance or element template for an array
            var container = self.container.querySelector('[' + toPrefixedHyphenated('databind') + '="' + prop + '"]');

            return container;
        };

        var setHiddenInput = function () {
            //creates a hidden input and associates data with its dataset
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

            if (!(obj.placeholderNode && document.body.contains(obj.placeholderNode)) && elementTemplate && elementTemplate.parentNode) {
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
            //removes elements between a set of comments
            while (placeholder.previousSibling && placeholder.previousSibling.nodeType !== 8) {
                if (placeholder.previousSibling.nodeType === 1 && (!attr || placeholder.previousSibling.getAttribute(attr) !== null)) {
                    placeholder.parentNode.removeChild(placeholder.previousSibling);
                } else {
                    placeholder = placeholder.previousSibling;
                }
            }

            return placeholder;
        };

        var removeChildContainer = function (child) {
            //remove container element of a child instance from the DOM
            var container = child.container;

            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        };

        this.parseNode = function (node) {
            //recursively update node and its children's properties with dynamic values
            var i;

            if (node.parsed || node.tagName === "TEMPLATE") {
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
                        if (node.childNodes[i].hasAttribute && node.childNodes[i].hasAttribute("databind")) {
                            self.dataBindFromAttr(node.childNodes[i]);
                        } else {
                            self.parseNode(node.childNodes[i]);
                        }
                    }

                    if (node.classList /* SVG nodes do not have classLists in some browsers */ && node.getAttribute(toPrefixedHyphenated("databind"))) {
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

        var resolveAttrNode = function (node, fromWatch) {
            //resolve dynamic references in an attribute
            if (node.nodeName.substr(0, 5) === "data-") {
                resolveDoubleCurlyBraces(node, node.nodeValue);
            } else {
                resolveAttrNodeName(node);
                resolveAttrNodeValue(node, fromWatch);
                return node;
            }
        };

        var resolveAttrNodeName = function (node) {
            //resolve dynamically populated attribute names
            var attrName;

            if (node.rawName === undefined) {
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

        var resolveAttrNodeValue = function (node, fromWatch) {
            //resolve curly braces and call attribute based methods

            var attrMethodName = node.nodeName === "name" ? node.nodeName : toPrefixedCamel(toCamelCase(node.nodeName)),
                attrMethod = self.attrMethods[attrMethodName],
                el = node.ownerElement,
                parentEl, value, name;

            resolveDoubleCurlyBraces(node, node.nodeValue);
            value = node.value || el && el[node.name];//element properties like node.href may differ dramatically from the attribute node value
            if (node.nodeName === "value" && (el.type === "radio" || el.type === "checkbox" || el.tagName === "OPTION")) {
                name = el && el.name;
                if (!name && el.tagName === "OPTION" && el.parentNode) {
                    if (el.parentNode instanceof DocumentFragment) {
                        parentEl = self.parent.container.tagName === "SELECT" ? self.parent.container : self.parent.container.querySelector("select");
                    } else {
                        parentEl = el.parentNode;
                    }
                    name = parentEl.name;
                }
                self.setNodeValue(el, parseExpression(name, node, false), name, "name");
            }
            if (attrMethod) {
                attrMethod.apply(self, [el, parseExpression(node.nodeValue, node), node.nodeValue, attrMethodName, node, ! fromWatch]);
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
                    return parseExpression($0.slice(2, -2), node) || "";
                });
            }

            return node.nodeValue;
        };

        var parseFunctionOrObject = function (str, node, addWatches) {
            //parses a string as a path to a funtion with arguments or an object
            //if a function, the arguments are each parsed recursively as expressions
            if (str.indexOf(".") > 0) {

                var parenIndex = str.indexOf("("),
                    argsArray = parenIndex > 0 && str.slice(parenIndex + 1, -1).split(","),
                    path = str.substr(0, parenIndex === -1 ? str.length : parenIndex),
                    pointer, pathArray, fn, i, stop;

                pathArray = path.split(".");
                pointer = pathArray[0] === "this" ? self : window[pathArray[0]];
                if (!pointer) {
                    return null;
                }

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
                        args.push.apply(args, arguments);//any arguments passed will be added after arguments specified in the attribute value - essential for binding handlers
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
            //parses a string as an expression: string primitive, number primitive, path to a function and arguments, path to an object, or data property
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
                value = typeof (fn) === "function" && str.indexOf("(") > 0 ? fn() : fn;
            } else {
                value = self.get(str, true) || "";
                if (addWatches !== false) {
                    self.watch(str, node);
                }
            }
            if (node && node.nodeName === "name" && value && addWatches !== false) {
                self.watch(value, node);
            }
            return value;
        };






        //<<<<<< Listeners, Handlers, and Watches >>>>>>

        var setListeners = function (handleKeyUp) {
            //sets mutation observer and either keyup or change listener
            if (self.container) {
                //listen for changes in the container element's dataset
                observer = new MutationObserver(mutationHandler);


                //listen for form control changes within our container
                self.container.addEventListener("change", changeHandler);
                self.container.addEventListener("search", changeHandler);//chrome does not register change event when clearing input via x
                if (handleKeyUp !== false) {
                    //update data on keyup if desired
                    self.container.addEventListener("keyup", changeHandler);
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
            //turns on mutation observer within instance
            if (observer) {
                observer.observe(self.container, {
                    attributes: true,
                    attributeOldValue: true
                });
            }
            return observer;
        };

        this.turnOnAllBindings = function () {
            //recursively turns on mutation observer within instance and it's descendants
            turnOnBindings();
            for (var childId in self.children) {
                if (self.children.hasOwnProperty(childId) && self.children[childId]) {
                    self.children[childId].turnOnAllBindings();
                }
            }
            return self;
        };

        var turnOffBindings = function () {
            //turns off mutation observer so batch update can proceed without unnecessary calls to watch methods
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
                        if (self.configs.modifyInputObjects) {
                            startData[prop] = value;
                        }
                    }
                }
            });
            return mutations;
        };

        var changeHandler = function (e) {
            //handles changes to form control values within the container
            var val = getNodeValue(e.target),
              prop = e.target.name;

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
            if (!(props instanceof Array)) {
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

        var iterateWatchArray = function (prop, globalScope) {
            //iterate watches related to property and exectute
            var instance = globalScope ? self.root : self,
                watchType = globalScope ? "globalScopeWatches" : "watches",
                watches = instance[watchType][prop], node;

            if (watches) {
                for (var i = watches.length - 1; i >= 0; i--) {
                    if (typeof (watches[i]) === "function") {
                        //for watches of global scope we pull the function from the root instance
                        //but execute it in the context of local instance
                        executeWatchFn(watches[i]);
                    } else {
                        node = watches[i];
                        if (node.nodeType === 2) {
                            resolveAttrNode(node, true);
                        } else {
                            resolveDoubleCurlyBraces(node);
                        }
                    }
                }
            }
            return instance;
        };

        this.checkWatches = function (prop, recursive) {
            //check watches on the specific property as well as general watches which apply and execute

            if (self.removed) {
                return false;
            }

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
            self.attrMethods = self.nameSpaceAttrMethods(toPrefixedHyphenated);
            self.attrMethods = assign(self.attrMethods, self.configs.attrMethods || {});
            self.templates = assign({}, self.configs.templates || {});
            self.logic = assign({}, self.configs.logic || {});
            self.cache = new WeakMap();
            self.childNameIndices = {};
            self.childArrayNameIndices = {};

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
                if (typeof (startData) !== "object") {
                    startData = { value: startData };
                }
                self.startData = startData;
                if (startData && self.parent) {
                    self.parent.cache.set(startData, self);
                }
                self.data = prefixData(el.dataset || {}/* FF SVG elements have no dataset*/);
                self.update(self.data, false, false, false);
                getInitialNodeValues();
                self.update(startData || {}, false, true, false);
                wireData(startData);
            }
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

            self.initialized = true;

            return this;
        };

        this.init();
    }



    //<<<<<<<<<<<<<< Prototype >>>>>>>>>>>>>

    proto = SimpleDataBinding.prototype;


    //<<<<<<<<<<<<<< attrMethod (directive) helper/factory functions >>>>>>>>>>>>>

    proto.templateMaster = function (placeClone) {
        //generates attribute methods to place template in any relative manner to the element as specified in the placeClone method
        return function (el, parsedAttrValue, rawAttrValue, attrName, attrNode) {
            var storedTemplate, clone, template;

            if (parsedAttrValue) {
                storedTemplate = this.root.templates[parsedAttrValue];
                template = storedTemplate || document.getElementById(parsedAttrValue);

                if (template) {
                    if (template.tagName === "TEMPLATE") {
                        template = template.content || template.firstElementChild;
                        if (template instanceof DocumentFragment) {
                            template = template.firstElementChild;
                        }
                    } else if (!storedTemplate) {
                        template.removeAttribute("id");
                    }
                    this.root.templates[parsedAttrValue] = template;
                    clone = template.cloneNode(true);
                    if (attrNode.placeholderNode) {
                        this.removeCommentedElements(attrNode.placeholderNode);
                        attrNode.placeholderNode.parentNode.removeChild(attrNode.placeholderNode);
                    }
                    placeClone.apply(this, [el, clone]);
                    this.surroundByComments(attrNode, "template " + parsedAttrValue, clone, true);
                    this.parseNode(clone);
                }
            }
            return el;
        };
    };

    proto.nameSpaceAttrMethods = function (toPrefixedHyphenated) {
        var attrMethods = {};
        for (var method in this.rawAttrMethods) {
            if (this.rawAttrMethods.hasOwnProperty(method) && method !== "name") {
                attrMethods[toPrefixedHyphenated(method)] = this.rawAttrMethods[method];
            }
        }
        attrMethods.name = this.rawAttrMethods.name;
        


        return attrMethods;
    };

    proto.normalize = function (val, bool) {
        if (val === 0) {
            val = "0";
        }
        if (bool && (val === "false" || val === "undefined")) {
            val = "";
        }
        return val;
    };


    //<<<<<<<<<< attribute based methods and their subfunctions >>>>>>>>>>

    attrMethods.replacementtemplate = proto.templateMaster(function (el, clone) {
        //custom attribute method
        //replaces a given element with the specified template
        el.parentNode.insertBefore(clone, el);
        if (el === this.container) {
            for (var prop in el.dataset) {
                if (el.dataset.hasOwnProperty[prop]) {
                    clone.dataset[prop] = el.dataset[prop];
                }
            }
            this.container = clone;
        }
        setTimeout(function () {
            //wait for possible child array to render before removing parent
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        return clone;
    });

    attrMethods.childtemplate = proto.templateMaster(function (el, clone) {
        //native attribute method
        //appends a template clone as a child of the element
        return el.appendChild(clone);
    });

    attrMethods.renderif = function (el, parsedAttrValue, rawAttrValue, attrName, attrNode) {
        //native attribute method
        //removes the node from the dom whenever the attribute value evalutes to falsey
        //replaces it when truey
        parsedAttrValue = this.normalize(parsedAttrValue, true);
        this.surroundByComments(el, attrName + " " + rawAttrValue, el, true);
        if (parsedAttrValue && !el.parentElement) {
            el.placeholderNode.parentNode.insertBefore(el, el.placeholderNode);
        } else if (!parsedAttrValue && el.parentElement) {
            el.parentElement.removeChild(el);
        }
        return el;
    };

    attrMethods.renderifnot = function (el, parsedAttrValue, rawAttrValue, attrName, attrNode) { attrMethods.renderif.apply(this, [el, !this.normalize(parsedAttrValue, true), rawAttrValue, attrName, attrNode]); };

    attrMethods.click = function (el, fn) {
        var binding = this;

        el.addEventListener("click", function (e) {
            if (!el.hasAttribute("disabled") && !(el.getAttribute("aria-disabled") === "true")) {
                fn.apply(binding, [e, el]);
            }
        });
    };

    attrMethods.clickon = function (el, val, prop) {
        var binding = this;

        attrMethods.click(el, function () {
            binding.set(prop, "true", true, null, true);
        });
    };

    attrMethods.clickoff = function (el, val, prop) {
        var binding = this;

        attrMethods.click(el, function () {
            binding.set(prop, "", true, null, true);
        });
    };

    attrMethods.name = function (el, parsedAttrValue, rawAttrValue, attrName) {
        //executed as a native attribute method wherever a name attribute is encountered
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

    proto.rawAttrMethods = attrMethods;
    proto.setNodeValue = attrMethods.name;
    


    window.SimpleDataBinding = SimpleDataBinding;
})();
