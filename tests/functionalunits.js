// First argument to 'describe' (which is defined by Jasmine) is the testing module that will
// appear in test reports. The second argument is a callback containing the individual tests.

describe("data methods - question branching setup", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 


  document.write('<form name="myForm" id="myForm">' + 

  '<label databind="jobQuestions" childtemplate="questionType">{{label}}</label>' + 

  '</form>' + 



  '<div class="templates">' + 
  
  '<input id="text" name="{{name}}" />' + 

  '<textarea id="textarea" name="{{name}}" >{{value}}</textarea>' + 

  '<select id="select" name="{{name}}" >' + 
      '<option databind="options" value="{{value}}">{{text}}</option>' + 
  '</select>' + 
  
  '</div>');


  //a repository of questions
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
    }

    //some intital values
  var startData = {
          jobQuestions: [questionData.firstName, questionData.middleName, questionData.lastName, questionData.criminalRecord],
          firstName: "John"
      },
      binding = new SimpleDataBinding("#myForm", startData),
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
        expect(binding.update({middleName: "Harrison"}).middleName).toEqual("Harrison");
    });

    it("generateChildArrayMemberId", function () {
        expect(binding.generateChildArrayMemberId(childArray, questionData.offense)).toEqual("offense");
    });

    it("createChildArrayMember", function () {
        childArray = binding.updateChildArray("jobQuestions", questionTemplate, { jobQuestions: [questionData.offense] }, true);
        expect(binding.createChildArrayMember(childArray, questionData.offense).data.questionType).toEqual("text");
    });

    it("updateChildArray", function () {
        expect(childArray[childArray.length-1].data.questionType).toEqual("text");
    });

    it("generateChildArrayMemberId - duplicate", function () {
        expect(binding.generateChildArrayMemberId(childArray, questionData.offense)).toEqual("offense1");
    });

    it("assign", function () {
        expect(binding.assign({a: 1, b: 2}, {c: 3, d: 4}).c).toEqual(3);
    });

    it("createChild - no container", function () {
        expect(binding.createChild("newProp", null, { a: 1, b: 2 }).data.b).toEqual("2");
    });

    it("assign", function () {
        expect(binding.export().firstName).toEqual("John");
    });
});