function SimpleDataBinding(el, startData, configs, parent) {
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
        var container = self.container.type == "hidden" ? document.body : self.container,
            branchContainer, branch, clone;

        self.updating = true;
        for (var prop in newData) {
            if (typeof (newData[prop]) == "object") {
                branchContainer = (self.childArrays[prop] && self.childArrays[prop].branchContainerTemplate) || container.querySelector('[' + self.toPrefixedHyphenated('databind') + '="' + prop + '"]');
                if (newData[prop] instanceof Array && branchContainer) {
                    self.updateChildArray(prop, branchContainer, newData, additive);
                } else {
                    self.createBranch(prop, branchContainer, newData[prop]);
                }
            } else {
                self.set(prop, newData[prop]);
            }
        }

        //call potentially unbound user parser methods
        if (configs && configs.parserMethods) {
            self.setDomProp(configs.parserMethods);
        }

        setTimeout(function () {
            self.updating = false;
            self.previousData = self.assign({}, self.data);
        }, 0);

        return self.data;
    };

    this.updateChildArray = function (prop, branchContainerTemplate, newData, additive) {
        if (self.childArrays[prop]) {
            if (additive !== true) {
                self.clearChildArrayHtml(prop);
                self.childArrays[prop].length = 0;
            }
        } else {
            self.childArrays[prop] = [];
            self.prepChildArrayHtml(prop, branchContainerTemplate);
        }
        for (var repeaterBranchIndex = 0, stop = newData[prop].length; repeaterBranchIndex < stop; repeaterBranchIndex++) {
            branch = self.createBranch(prop + repeaterBranchIndex, self.cloneInPlace(branchContainerTemplate, self.childArrays[prop].placeholder), newData[prop][repeaterBranchIndex]);
            branch.index = repeaterBranchIndex;
            self.childArrays[prop].push(branch);
        };
    };

    this.assign = Object.assign || function (obj1, obj2) {
        //polyfill for Object.assign
        for (var prop in obj2) {
            obj1[prop] = obj2[prop];
        }
        return obj1;
    };

    this.createBranch = function (prop, el, data) {
        self.children[prop] = new SimpleDataBinding(el, data, self.configs, self);
        return self.children[prop];
    };

    this.export = function () {
        //creates an (unbound) clone of data
        //recreates nesting via recursion
        //removes namespace from property names
        var dataClone = self.unprefixData(self.assign({}, self.data));

        for (branch in self.children) {
            dataClone[branch] = self.children[branch].export();
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

    //<<< Parse Methods >>>

    this.updateNodeProps = function (node) {
        //recursively update node and its children's properties with double curly braces
        
        if (node.nodeType == 3) {
            node.textTemplate = node.textTemplate || node.nodeValue;
            self.updateDoubleCurlies(node, "nodeValue", node.textTemplate);
        } else if (node.nodeType == 1) {
            for (var i = 0; i < node.attributes.length; i++) {
                node.attributes[i].attrTemplate = node.attributes[i].attrTemplate || node.attributes[i].value || node[node.attributes[i].name];/* be ware of properties like node.href which may vary dramatically from the attribute value */
                self.updateDoubleCurlies(node.attributes[i], "value", node.attributes[i].attrTemplate);
            }
            if (!(node.hasAttribute("databind") && node != self.container)) {
                //do not recurse if we have hit the container of a child SimpleDataBinding instance
                //let the instance handle it
                for (var i = 0; i < node.childNodes.length; i++) {
                    self.updateNodeProps(node.childNodes[i]);
                }
            }
        }
    }

    this.updateDoubleCurlies = function (obj, prop, str) {
        //replace value (attribute value or text node value) in curly braces with corresponding data value
        var dataProp;
        if (str && str.replace) {
            obj[prop] = str.replace(/{{(.*?)}}/g, function ($0) {
                dataProp = $0.slice(2, -2);
                if (self.updating) {
                    self.watches[dataProp] = self.watches[dataProp] || [];
                    self.watches[dataProp].push(obj);
                }
                return self.get(dataProp, true);
            });
        }
        return obj[prop];
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

    this.setDomProp = function (prop, methods) {
        //looks for element attribute values matching data property name if provided and updates via parser method or all parser methods if none is provided
        var parserMethodName, attr;

        if (typeof (methods) == "string") {
            parserMethodName = methods;
            methods = {};
            methods[parserMethodName] = self.parserMethods[parserMethodName];
        } else if (!(methods instanceof Array)) {
            methods = self.parserMethods;
        }

        for (var key in methods) {
            attr = methods[key].explicit ? key : self.toPrefixedHyphenated(key);
            self.eachDomNode(attr, prop, methods[key].fn || methods[key], methods[key].isJson);
        };
    };

    this.eachDomNode = function (attr, value, fn, isJson) {
        //iterates DOM collection matching attr value and invokes method fn 
        var comparitor = isJson ? "*=" : "=",
            container = self.container.type == "hidden" ? document.body : self.container,         
            selector, nodes, attrValue, args;

        if (value) {
            selector = '[' + attr + comparitor + '"' + value + '"]';
        } else {
            selector = '[' + attr + ']';
        }

        nodes = Array.prototype.slice.call(container.querySelectorAll(selector));

        if (self.is(self.container, selector)) {
            nodes.push(self.container);
        }

        for (var i = 0, stop = nodes.length; i < stop; i++) {
            attrValue = value || nodes[i].getAttribute(attr);
            args = [nodes[i], attrValue, self.get(attrValue), attr, nodes, i];
            fn.apply(self, args);
        }
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
        } else {
            val = el.value;
        }
        return val;
    };

    this.getInitialNodeValues = function () {
        //assigns initial form values in elements with a name or a [namespace-]val attribute to data
        self.eachDomNode("name", null, function (el) {
            if (el.getAttribute("value")) {//NOT el.value since Chrome populates this with "on" by default in some contexts
                self.set(el.name, self.getNodeValue(el));
            }
        }, [], true);
        self.eachDomNode(self.toPrefixedHyphenated("val"), null, function (el) {
            if (el.getAttribute("value")) {
                self.set(el.getAttribute(self.toPrefixedHyphenated("val")), el.value);
            }
        });
        return self.data;
    };

    this.updateDom = function () {
        //set properties in the DOM to express data
        //used during initalization prior to setting modulation listener

        for (var prop in self.data) {
            self.setDomProp(prop);
        };
        self.updateNodeProps(self.container);
    };

    this.prepChildArrayHtml = function (prop, branchContainerTemplate) {
        self.childArrays[prop].branchContainerTemplate = branchContainerTemplate;
        self.childArrays[prop].placeholder = document.createComment("end " + prop);
        branchContainerTemplate.parentNode.insertBefore(document.createComment("start " + prop), branchContainerTemplate);
        branchContainerTemplate.parentNode.insertBefore(self.childArrays[prop].placeholder, branchContainerTemplate);
        branchContainerTemplate.parentElement.removeChild(branchContainerTemplate);
    };

    this.clearChildArrayHtml = function (prop) {
        self.eachDomNode("databind", prop, function (el) {
            el.parentElement.removeChild(el);
        });
    };

    this.setNodeValue = function (el, prop, value, attr) {
        //sets node value to data property value
        //core parser method 

        if (el.type == "radio" && attr == "name") {
            el.checked = (value == el.value);
        } else if (el.type == "checkbox" && attr == "name") {
            el.checked = (value.indexOf(el.value) != -1);
        } else {
            el.value = value;
        }
    };

    this.setNodeText = function (el, prop, value) {
        //sets node text to data property value
        //core parser method
        //if multple text nodes are present, clears to null string and sets last text node to value
        var textNodes = [],
          targetTextNode;

        if (el) {
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeName === "#text") {
                    textNodes.push(el.childNodes[i]);
                    if (el.childNodes[i].nodeValue.replace(/^\s*$/g, "").length) {
                        el.childNodes[i].nodeValue = "";
                        targetTextNode = el.childNodes[i];
                    }
                }
            }
            targetTextNode = targetTextNode || textNodes[0];
            if (targetTextNode) {
                targetTextNode.nodeValue = value;
            } else {
                targetTextNode = document.createTextNode(value);
                el.appendChild(targetTextNode);
            }
        }
    };

    this.setNodeAttr = function (el, prop, value) {
        var attrValue = el.getAttribute("attr"), attr, attrMap;

        if (attrValue.substring(0, 1) == "{") {
            attrMap = JSON.parse(attrValue);
            for (attr in attrMap) {
                if (attrMap[attr] === prop) {
                    el.setAttribute(attr, value);
                }
            }
        } else if (attrValue) {
            el.setAttribute(attrValue.split(",")[0], value);
        }
    };


    //<<<<<< Listeners & Handlers >>>>>>

    this.setListeners = function () {
        //listen for changes in the container element's dataset
        this.observer = new MutationObserver(this.mutationHandler);
        this.observer.observe(self.container, {
            attributes: true
        });

        //listen for form control changes within our container
        this.container.addEventListener("change", this.changeHandler);
    };

    this.mutationHandler = function (mutations) {
        //on mutation of the dataset updates dom and fire callbacks as needed 

        mutations.forEach(function (mutation) {
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

    this.dataChangeHandler = function (prop) {
        //verify changes to data and execute callbacks appropriately
        var val = self.get(prop);

        if (self.initialized && self.previousData && self.previousData[prop] != val) {
            if (self.configs.globalDKataChangeCallBack) {
                self.callBack("globalDataChangeCallBack", [prop, val, self.data]);
            }
            if (self.configs[prop + "ChangeCallBack"]) {
                self.callBack(prop + "ChangeCallBack", [val, self.data]);
            }
        }

        if (!self.updating) {
            self.previousData = JSON.parse(JSON.stringify(this.data));
        }

        for (var i = 0; i < self.watches[prop].length; i++) {
            self.watches[prop][i] = self.get(prop);
        }

        return val;
    };

    this.callBack = function (functionName, args) {
        //executes a callback function in the context of the data binder
        var fn = self.configs[functionName];

        return fn.apply(this, args);
    };

    //<<<<<<<<< Initialization >>>>>>>>>>

    this.initProps = function () {
        //initialize properties

        this.configs = configs || {};
        this.nameSpace = typeof (this.configs.nameSpace) === "string" ? this.configs.nameSpace : "";
        this.container = el && el.tagName ? el : document.querySelector(el || '[' + this.toPrefixedHyphenated('databind') + ']') || document.forms[0];
        if (!this.container || this.configs.containInHiddenInput) {
            this.container = document.createElement("input");
            this.container.type = "hidden";
            document.body.appendChild(this.container);
        }
        this.watches = {};
        this.checkboxDataDelimiter = this.configs.checkboxDataDelimiter || ",";

        this.parserMethods = this.assign({
            name: {
                fn: this.setNodeValue,
                explicit: true
            },
            val: {
                fn: this.setNodeValue
            },
            text: {
                fn: this.setNodeText
            },
            attr: {
                fn: this.setNodeAttr,
                isJson: true
            }
        }, this.configs.parserMethods || {});

        //data binding instance family tree 
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

        return this
    };

    this.initData = function () {
        //cascade initial data:
        //first capture values in container data attributes if presentvalues 
        //overwrite with values in form controls if present
        //overwrite again with data argument if present

        this.data = this.prefixData(this.container.dataset);
        this.update(this.data);
        this.getInitialNodeValues();
        this.update(startData || {});
        this.updateDom();

        return this;
    }

    this.init = function () {
        //sets core properties
        //inits listeners
        //processes initial data

        this.initProps();
        this.initData();
        this.setListeners();

        setTimeout(function () {
            self.initialized = true;
        });

        return this;
    };

    this.init();
}
