describe("scaling - job form with selects", function () {

    //some intital values
    var scalingStartData = {
        jobQuestions: [questionData.firstName, questionData.lastName]
    };
  
    var scale = 9;

    for (var i = 0; i < scale; i++) {
        scalingStartData.jobQuestions = scalingStartData.jobQuestions.concat(scalingStartData.jobQuestions.slice());
    }

    console.log('Number of Fields:', scalingStartData.jobQuestions.length);
    setForm("scalingForm");

    var t1 = new Date().getTime();
    var binding = new SimpleDataBinding("#scalingForm", scalingStartData);
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
        expect(binding.initialized).toEqual(true);
    });
});