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

var startData = {
    jobQuestions: [questionData.firstName, questionData.middleName, questionData.lastName, questionData.criminalRecord],
    firstName: "John"
};

var createEl = function (tagName, attr, value) {
    var el = document.createElement(tagName);
    el.setAttribute(attr || "testAttribute", value || "{{firstName}}");
    document.forms[document.forms.length - 1].appendChild(el);
    return el;
};

var createInput = function (attr, value) {
    return createEl("input", attr, value);
}

var setForm = function (id) {
    document.forms[document.forms.length - 1].id = id;
    document.forms[document.forms.length - 1].name = id;
}



describe("data methods - question branching setup", function () {

    document.write(markup);
    setForm("dataMethodTestForm");

    var binding = new SimpleDataBinding("#dataMethodTestForm", startData),
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
        expect(binding.generateChildArrayMemberId(childArray, questionData.offense)).toEqual("offense");
    });

    it("createChildArrayMember", function () {
        childArray = binding.updateChildArray("jobQuestions", questionTemplate, { jobQuestions: [questionData.offense] }, true);
        expect(binding.createChildArrayMember(childArray, questionData.offense).data.questionType).toEqual("text");
    });

    it("updateChildArray", function () {
        expect(childArray[childArray.length - 1].data.questionType).toEqual("text");
    });

    it("generateChildArrayMemberId - duplicate", function () {
        expect(binding.generateChildArrayMemberId(childArray, questionData.offense)).toEqual("offense1");
    });

    it("assign", function () {
        expect(binding.assign({ a: 1, b: 2 }, { c: 3, d: 4 }).c).toEqual(3);
    });

    it("createChild - no container", function () {
        expect(binding.createChild("newProp", null, { a: 1, b: 2 }).data.b).toEqual("2");
    });

    it("export", function () {
        expect(binding.export().firstName).toEqual("John");
    });
});



describe("string methods - question branching setup - no namespace", function () {

    document.write(markup);
    setForm("stringMethodTestForm");

    var binding = new SimpleDataBinding("#stringMethodTestForm", startData),
        questionTemplate = binding.childArrays.jobQuestions.elementTemplate,
        childArray;

    binding.data.lastName = "Smith";

    it("toCamelCase", function () {
        expect(binding.toCamelCase("we-the-people")).toEqual("weThePeople");
    });

    it("toHyphenated", function () {
        expect(binding.toHyphenated("weThePeople")).toEqual("we-the-people");
    });
});



describe("string methods - question branching setup - WITH NAMESPACE", function () {
    //nameSpace functionality is under construction

    document.write(markup);

    //var binding = new SimpleDataBinding("#nameSpacedStringMethodTestForm", startData, { nameSpace: "sdb" });


    /*
    it("toPrefixedCamel", function () {
        expect(binding.toPrefixedCamel("weThePeople")).toEqual("sdbWeThePeople");
    });
    */
});



describe("DOM methods - question branching setup", function () {

    document.write(markup);
    setForm("domMethodsTestForm");

    var binding = new SimpleDataBinding("#domMethodsTestForm", startData);
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
        expect(binding.resolveAttrNodeName(createInput("__firstname__").attributes[0]).boundAttrNameProp).toEqual("firstname");
    });

    it("resolveAttrNodeValue", function () {
        expect(binding.resolveAttrNodeValue(createInput().attributes[0]).nodeValue).toEqual("John");
    });

    it("resolveDoubleCurlyBraces", function () {
        expect(binding.resolveDoubleCurlyBraces(createInput().attributes[0])).toEqual("John");
    });
});




describe("attr methods - question branching setup", function () {

    document.write(markup);
    setForm("attrMethodsTestForm");

    var binding = new SimpleDataBinding("#attrMethodsTestForm", startData);

    it("childTemplate", function () {
        expect(binding.childTemplate(createEl("p"), null, null, "text").firstElementChild.tagName).toEqual("INPUT");
    });

    it("renderIf", function () {
        expect(binding.renderIf(createEl("p"), "rawValue", null, "firstName").parentNode.tagName).toEqual("FORM");
        expect(binding.renderIf(createEl("p"), "rawValue", null, undefined).parentNode).toEqual(null);
    });

    it("childTemplate", function () {
        expect(binding.setNodeValue(createInput(), "firstName", null).value).toEqual("John");
    });

    it("attrMethods", function () {
        expect(Object.keys(binding.attrMethods).every(function(val){
            return typeof(binding.attrMethods[val]) == "function";
        })).toEqual(true);
    });
});
