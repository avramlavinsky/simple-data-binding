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
    //create a new options array so live array tests don't interfere with eachother
    questionData.criminalRecord.options = questionData.criminalRecord.options.slice();

    //clone all data arrays
    var data = {
        jobQuestions: jobQuestions.slice(),
        firstName: "John"
    };
    data.jobQuestions[3].options = data.jobQuestions[3].options.slice();
    return data;
};

var createEl = function (tagName, attr, value, container) {
    var el = document.createElement(tagName);
    el.setAttribute(attr || "testattribute", value || "{{firstName}}");
    container || document.forms[document.forms.length - 1].appendChild(el);
    return el;
};

var createInput = function (attr, value) {
    return createEl("input", attr, value);
}

var setForm = function (id) {
    var form;

    document.write(markup);
    form = document.forms[document.forms.length - 1];
    form.id = id;
    form.name = id;
}