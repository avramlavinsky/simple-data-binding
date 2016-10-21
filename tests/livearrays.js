//unit testing live arrays
//functional testing for live arrays with simple data binding using markup from question branching example

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
    document.write(markup);
    document.forms[document.forms.length - 1].id = id;
    document.forms[document.forms.length - 1].name = id;
}



describe("live arrays stand-alone", function () {

    var arrayFactory = new LiveArrayFactory(String);

    it("addCallBack return value", function () {
        var obj = {fn: function(){return null;}},
            callBack = function(){return 1};

        expect(arrayFactory.addCallBack(obj, "fn", callBack)).toEqual(obj.fn);
    });

    it("addCallBack functionality", function () {
        var obj = { flag: false, fn: function () { } },
            callBack = function () { this.flag = true; };

        arrayFactory.addCallBack(obj, "fn", callBack);
        obj.fn();
        expect(obj.flag).toEqual(true);
    });

    it("addArrayCallBacks return value", function () {
        var arr = [];

        expect(arrayFactory.addArrayCallBacks(arr)).toEqual(arr);
    });

    it("addArrayCallBacks functionality", function () {
        var arr = [];

        arr.update = function () { this[1] = true; };
        arrayFactory.addArrayCallBacks(arr);
        arr.push(1);

        expect(arr[1]).toEqual(true);
    });

    it("update return value", function () {
        var arr = [];

        arr.update = arrayFactory.update;

        expect((arr).update()).toEqual(arr);
    });

    it("update functionality", function () {
        var arr = [];

        arr.update = arrayFactory.update;
        arr.update();
        arr.push(1);

        expect(arr.update()[0]).toEqual("1");
    });

    it("enhance functionality", function () {
        var arr = [];

        arrayFactory.enhance(arr);
        arr.push(1);

        expect(arr.update()[0]).toEqual("1");
    });
});


describe("live arrays with simple data binding", function () {

    setForm("liveArraysTestForm");

    var binding = new SimpleDataBinding("#liveArraysTestForm", startData);
    var questions = binding.childArrays.jobQuestions;

    it("push", function () {
        questions.push(questionData.offenseDetails);
        expect(binding.container.querySelector("textarea").name).toEqual("offenseDetails");
    });

    it("splice", function () {
        questions.splice(questions.length - 1, 1);
        expect(binding.container.querySelector("textarea")).toEqual(null);
    });

    it("set", function () {
        questions.set(questions.length, questionData.offenseDetails);
        expect(binding.container.querySelector("textarea").name).toEqual("offenseDetails");
    });
});

