//unit testing for core simple data binding logic using markup from question branching example

var markup = '<form>' +

  '<label databind="jobQuestions" childtemplate="questionType">{{label}}</label>' +

  '</form>' +

  '<div class="templates">' +

  '<input id="text" name="{{name}}" />' +

  '<textarea id="textarea" name="{{name}}" >{{value}}</textarea>' +

  '<select id="select" name="{{name}}" >' +
      '<option databind="options" value="{{value}}">{{text}}</option>' +
  '</select>' +

  '</div>';

var questionData = {
    firstName: {
        name: "firstName",
        label: "First Name",
        questionType: "text",
    },
    middleName: {
        name: "middleName",
        label: "Middle Name",
        questionType: "text",
    },
    lastName: {
        name: "lastName",
        label: "Last Name",
        questionType: "text",
    },
    criminalRecord: {
        name: "criminalRecord",
        label: "Have you ever been convicted of a felony?",
        criminalRecord: "",
        questionType: "select",
        options: [{
            text: "Never",
            value: "never"
        }, {
            text: "Over five years ago",
            value: "over5",
            childQuestions: "offense"
        }, {
            text: "Within the last five years",
            value: "recent",
            childQuestions: "offense,yearOfOffense,offenseDetails"
        }]
    },
    offense: {
        name: "offense",
        label: "Offense",
        questionType: "text",
    },
    yearOfOffense: {
        name: "yearOfOffense",
        label: "Year",
        questionType: "text",
    },
    offenseDetails: {
        name: "offenseDetails",
        label: "Details",
        questionType: "textarea",
    }
};

var jobQuestions = [questionData.firstName, questionData.middleName, questionData.lastName, questionData.criminalRecord];

var startData = function () {
    //clone all data arrays
    var data = {
        jobQuestions: jobQuestions.slice(),
        firstName: "John"
    };
    data.jobQuestions[3].options = data.jobQuestions[3].options.slice();
    return data;
};

var createEl = function (tagName, attr, value) {
    var el = document.createElement(tagName);
    el.setAttribute(attr || "testattribute", value || "{{firstName}}");
    document.forms[document.forms.length - 1].appendChild(el);
    return el;
};

var createInput = function (attr, value) {
    return createEl("input", attr, value);
}

var setForm = function (id) {
    document.write(markup);
    document.forms[document.forms.length - 1].id = id;
    document.forms[document.forms.length - 1].name = id;
}


var testDataMethods = function (config, configDescription, formId) {

    describe("data methods - question branching setup " + configDescription, function () {

        setForm(formId);

        var binding = new SimpleDataBinding("#" + formId, startData(), config),
            questionTemplate = binding.childArrays.jobQuestions.elementTemplate,
            childArray;

        binding.data.lastName = "Smith";

        it("get initial data value", function () {
            expect(binding.get("firstName")).toEqual("John");
        });

        it("get value declared after init", function () {
            expect(binding.get("lastName")).toEqual("Smith");
        });

        it("set new value", function () {
            expect(binding.set("newProperty", "newValue")).toEqual("newValue");
        });

        it("set existing value prior null", function () {
            expect(binding.set("middleName", "Jay")).toEqual("Jay");
        });

        it("set / get inheritted value", function () {
            expect(binding.set("lastName", "Inheritted")).toEqual(binding.children.firstName.get("lastName"));
        });

        it("update", function () {
            expect(binding.update({ middleName: "Harrison" }).middleName).toEqual("Harrison");
        });

        it("generateChildArrayMemberId", function () {
            expect(binding.generateChildArrayMemberId([], questionData.offense)).toEqual("offense");
        });

        it("createChildArrayMember", function () {
            expect(binding.createChildArrayMember(binding.childArrays.jobQuestions, questionData.offense).data.questionType).toEqual("text");
        });

        it("generateChildArrayMemberId - duplicate", function () {
            expect(binding.generateChildArrayMemberId(binding.childArrays.jobQuestions, questionData.offense)).toEqual("offense1");
        });

        it("assign", function () {
            expect(binding.assign({ a: 1, b: 2 }, { c: 3, d: 4 }).c).toEqual(3);
        });

        it("createChild - new container", function () {
            var input = createInput();
            expect(binding.createChild("newProp", input, { a: 1, b: 2 }).data.b).toEqual("2");
        });

        it("createChild - no container", function () {
            expect(binding.createChild("newProp", null)).toEqual(null);
        });

        it("export", function () {
            expect(binding.export().firstName.name).toEqual("firstName");
        });
    });
};

testDataMethods({}, "default config", "dataMethodTestForm");
testDataMethods({ modifyInputArrays: true }, "modifyInputArrays", "dataMethodTestFormModInputArrays");

describe("string methods - question branching setup - no namespace", function () {

    setForm("stringMethodTestForm");
    
    var binding = new SimpleDataBinding("#stringMethodTestForm", startData());
    
    binding.data.lastName = "Smith";

    it("toCamelCase", function () {
        expect(binding.toCamelCase("we-the-people")).toEqual("weThePeople");
    });

    it("toHyphenated", function () {
        expect(binding.toHyphenated("weThePeople")).toEqual("we-the-people");
    });
});


describe("string methods - question branching setup - WITH NAMESPACE", function () {
    //nameSpace functionality adds a prefix to all data

    setForm("nameSpacedStringMethodTestForm");

    var binding = new SimpleDataBinding("#nameSpacedStringMethodTestForm", startData(), { nameSpace: "sdb" });

    it("toPrefixedCamel", function () {
        expect(binding.toPrefixedCamel("weThePeople")).toEqual("sdbWeThePeople");
    });

    it("toUnprefixedCamel", function () {
        expect(binding.toUnprefixedCamel("sdbA")).toEqual("a");
    });

    it("prefixData delete", function () {
        expect(binding.prefixData({a: "success"}).a).toEqual(undefined);
    });

    it("prefixData prefix", function () {
        expect(binding.data.sdbA).toEqual("success");
    });

    it("unprefixData", function () {
        expect(binding.unprefixData({sdbA: "success"}).a).toEqual("success");
    });
    
});


describe("string methods - question branching setup - WITH ATTR PREFIX", function () {
    //config property attrPrefix adds a prefix to attributes corresponding to simple data binding methods
    //EXCEPT the name attribute

    var binding = new SimpleDataBinding(null, null, { attrPrefix: "sdb" });


    it("toPrefixedHyphenated", function () {
        expect(binding.toPrefixedHyphenated("a")).toEqual("sdb-a");
    });
});


describe("DOM methods - question branching setup", function () {

    setForm("domMethodsTestForm");

    var binding = new SimpleDataBinding("#domMethodsTestForm", startData());
    var span;
    
    it("is", function () {
        expect(binding.is(binding.container, "form#domMethodsTestForm")).toEqual(true);
    });

    it("closest", function () {
        expect(binding.closest(binding.container, "body")).toEqual(document.body);
    });

    it("cloneInPlace", function () {
        expect(binding.cloneInPlace(document.createElement("span"), binding.container).nextElementSibling).toEqual(binding.container);
    });

    it("getNodeValue", function () {
        expect(binding.getNodeValue(binding.container.firstName)).toEqual("John");
    });

    it("getInitialNodeValues", function () {
        expect(binding.getInitialNodeValues().firstName).toEqual("John");
    });

    it("setContainer", function () {
        expect(binding.setContainer().tagName).toEqual("FORM");
    });

    it("getContainer", function () {
        expect(binding.getContainer("firstName")).toEqual(binding.children.firstName.container);
    });

    it("setId", function () {
        expect(binding.setId()).toEqual("domMethodsTestForm");
    });

    it("setHiddenInput", function () {
        binding.configs.useHiddenInput = true;
        expect(binding.setHiddenInput().tagName).toEqual("INPUT");
    });

    it("surroundByComments", function () {
        span = binding.container.previousElementSibling;
        expect(binding.surroundByComments({}, "surroundByCommentsTest", span, true).nodeValue).toEqual("end surroundByCommentsTest");
    });

    it("removeCommentedElements", function () {
        span.setAttribute("removeMe", "true");
        expect(binding.removeCommentedElements(binding.container.previousElementSibling.nextSibling, "removeMe", "true").nodeValue).toEqual("end surroundByCommentsTest");
        expect(document.body.contains(span)).toEqual(false);
    });

    it("parseNode", function () {
        expect(binding.parseNode(binding.container)).toEqual(false);
        expect(binding.parseNode(createInput()).attributes[0].nodeValue).toEqual("John");
    });

    it("resolveAttrNode", function () {
        expect(binding.resolveAttrNode(binding.container.querySelector("label").attributes[1]).nodeValue).toEqual("questionType");
    });

    it("resolveAttrNodeName", function () {
        var input = createInput("__first-name__");
        expect(binding.resolveAttrNodeName(input.attributes[0])).toEqual("John");
    });

    it("resolveAttrNodeValue", function () {
        expect(binding.resolveAttrNodeValue(createInput().attributes[0]).nodeValue).toEqual("John");
    });

    it("resolveAttrNodeValue string literal", function () {
        var literalInput = createInput();

        binding.attrMethods.addprop = function (el, val, rawVal, attr) { binding.prop = val };
        literalInput.setAttribute("addprop", "'test'");
        binding.resolveAttrNodeValue(literalInput.attributes[1]);
        expect(binding.prop).toEqual("test");
    });

    it("resolveDoubleCurlyBraces", function () {
        expect(binding.resolveDoubleCurlyBraces(createInput().attributes[0])).toEqual("John");
    });

    it("parseFunctionOrObject", function () {
        binding.fn = function (prop) { return prop; };
        expect(binding.parseFunctionOrObject("this.fn(firstName)", {})()).toEqual("John");
    });

    it("parseExpression number", function () {
        expect(binding.parseExpression("123", {})).toEqual(123);
    });

    it("parseExpression string", function () {
       expect(binding.parseExpression("'hello world'", {})).toEqual("hello world");
    });

    it("parseExpression object", function () {
        binding.testObject = { prop1: "val1" };
        expect(binding.parseExpression("this.testObject", {}).prop1).toEqual("val1");
    });

    it("parseExpression function", function () {
        expect(binding.parseExpression("this.fn(firstName)", {})).toEqual("John");
    });

    it("parseExpression nested function", function () {
        binding.nestFunction = function (n) { return n + 1; };
        expect(binding.parseExpression("this.nestFunction(this.nestFunction(3))", {})).toEqual(5);
    });
});



describe("attr methods - question branching setup", function () {

    setForm("attrMethodsTestForm");

    var binding = new SimpleDataBinding("#attrMethodsTestForm", startData());

    it("childTemplate", function () {
        expect(binding.childTemplate(createEl("p"), "text", null, null).firstElementChild.tagName).toEqual("INPUT");
    });

    it("renderIf", function () {
        expect(binding.renderIf(createEl("p"), "firstName", "rawValue", null).parentNode.tagName).toEqual("FORM");
        expect(binding.renderIf(createEl("p"), undefined, "rawValue", null).parentNode).toEqual(null);
    });

    it("childTemplate", function () {
        expect(binding.setNodeValue(createInput(), "John", "firstName", null).value).toEqual("John");
    });

    it("attrMethods", function () {
        expect(Object.keys(binding.attrMethods).every(function(val){
            return typeof(binding.attrMethods[val]) == "function";
        })).toEqual(true);
    });
});



describe("listeners/handlers/watches - question branching setup", function () {

    setForm("listeners");
    var pageLogicInput = createInput("test", "{{this.logic.forms.method(firstName)}}");
    var binding = new SimpleDataBinding("#listeners", startData(), { logic: { forms: { method: function (val) { return val + "test"; } } } });
    var mutations = [{ target: binding.container, value: 1, oldValue: 0, attributeName: "attr" }];
    var firstNameInput = binding.container.querySelector("input");
    var e = { target: firstNameInput, stopPropagation: function () { } };
    var testFn = function(){};
        

    beforeEach(function (done) {
        setTimeout(function () {
            done();
        }, 0);
    });

    it("setListeners", function () {
        expect(binding.setListeners().observer instanceof MutationObserver).toEqual(true);
    });

    it("turnOffBindings return value", function () {
        expect(binding.turnOffBindings()).toEqual(binding.observer);
    });

    it("turnOffBindings functionality", function () {
        binding.data.firstName = "Sam";
        expect(firstNameInput.value).toEqual("John");
    });

    it("turnOnBindings completes execution", function () {
        expect(binding.turnOnBindings()).toEqual(binding.observer);
    });

    it("mutationHandler", function () {
        expect(binding.mutationHandler(mutations)).toEqual(mutations);
    });

    it("changeHandler", function () {
        firstNameInput.value = "Joe";
        expect(binding.changeHandler(e)).toEqual("Joe");
        binding.data.firstName = "Sam";
    });

    it("keyUpHandler", function () {
        expect(binding.keyUpHandler(e).type).toEqual("change");
    });

    it("turnOnBindings binding functionality", function () {
        expect(firstNameInput.value).toEqual("Sam");
    });

    it("changeHandler binding functionality", function () {
        firstNameInput.value = "David";
        e = document.createEvent('HTMLEvents');
        e.initEvent('change', true, false);
        firstNameInput.dispatchEvent(e);
        expect(binding.data.firstName).toEqual("David");
    });

    it("general watch", function () {
        expect(binding.watch(testFn)["*"][0]).toEqual(testFn);
    });

    it("property watch", function () {
        expect(binding.watch("test", testFn).test[0]).toEqual(testFn);
    });
    
    it("global property watch", function () {
        expect(binding.children.firstName.watch("globalTest", testFn, true).globalTest[0]).toEqual(testFn);
        expect(binding.globalScopeWatches.globalTest[0]).toEqual(testFn);
    });

    it("global general watch", function () {
        expect(binding.children.firstName.watch(testFn, true)["*"][0]).toEqual(testFn);
        expect(binding.globalScopeWatches["*"][0]).toEqual(testFn);
    });

    it("watch duplicate", function () {
        var input = createInput();
        binding.watch("addedInputWatch", input);
        binding.watch("addedInputWatch", input);
        expect(binding.watches.addedInputWatch.length).toEqual(1);
    });

    it("checkWatches", function () {
        expect(binding.checkWatches("addedInputWatch")).toEqual("addedInputWatch");
    });

    it("executeWatchFn supplied method and context", function () {
        var insertedWatch = function () { return this; };
        expect(binding.executeWatchFn(insertedWatch)).toEqual(binding);
    });

    it("parseFunctionOrObject watch", function () {
        expect(pageLogicInput.getAttribute("test")).toEqual("Davidtest");
    });
});