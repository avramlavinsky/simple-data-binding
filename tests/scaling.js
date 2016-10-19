// First argument to 'describe' (which is defined by Jasmine) is the testing module that will
// appear in test reports. The second argument is a callback containing the individual tests.

describe("init - no args", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 


  document.write('<form name="scalingForm" id="scalingForm">' + 

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
        jobQuestions: [questionData.firstName, questionData.criminalRecord]
    };
  
    var scale = 7;

    for (var i = 0; i < scale; i++) {
        startData.jobQuestions = startData.jobQuestions.concat(startData.jobQuestions.slice());
    }

    console.log('Number of Fields:', startData.jobQuestions.length);

    var t1 = new Date().getTime();
    var binding = new SimpleDataBinding("#scalingForm", startData);
    var t2 = new Date().getTime();

    console.log("Render Time: ", t2 - t1);
  
  
    

    
    it("family tree initalized", function () {
        expect(binding.parent).toEqual(undefined);
        expect(binding.ancestors.length).toEqual(0);
        expect(binding.root).toEqual(binding);
        expect(typeof(binding.children)).toEqual("object");
        expect(typeof(binding.childArrays)).toEqual("object");
    });

    it("propterties initalized", function () {
        expect(typeof (binding.configs)).toEqual("object");
        expect(binding.nameSpace).toEqual("");
        expect(binding.container).toEqual(document.forms.scalingForm);
        expect(typeof (binding.watches)).toEqual("object");
        expect(typeof (binding.globalScopeWatches)).toEqual("object");
        expect(binding.checkboxDataDelimiter).toEqual(",");
        expect(binding.attrMethods.name).toEqual(binding.setNodeValue);
        expect(typeof (binding.attrMethods.renderif)).toEqual("function");
        expect(typeof (binding.attrMethods.childtemplate)).toEqual("function");
        expect(typeof (binding.templates)).toEqual("object");
    });

    it("data initalized", function () {
        expect(typeof (binding.data)).toEqual("object");
    });

    it("initalized", function () {
        expect(binding.observer instanceof MutationObserver).toEqual(true);
        expect(binding.initialized).toEqual(true);
    });

    
});