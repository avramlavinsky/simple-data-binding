// First argument to 'describe' (which is defined by Jasmine) is the testing module that will
// appear in test reports. The second argument is a callback containing the individual tests.

describe("init - no args", function () {
    // The 'it' function of Jasmine defined an individual test. The first argument is
    // a description of the test that's appended to the module name. Because a module name
    // is typically a noun, like the name of the function being tested, the description for
    // an individual test is typically written in an action-data format. 


    var binding = new SimpleDataBinding();

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
        expect(binding.container).toEqual(document.body);
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

    it("initProps return value", function () {
        expect(binding.initProps()).toEqual(binding);
    });

    it("initData return value", function () {
        expect(binding.initData()).toEqual(binding);
    });

    it("initFamilyTree return value", function () {
        expect(binding.initFamilyTree()).toEqual(binding);
    });

    it("init return value", function () {
        expect(binding.init()).toEqual(binding);
    });
});