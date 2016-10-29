//gross initialization tests in the simplest scenario, no arguments, no markup

describe("initFamilyTree - no args", function () {

    var binding = new SimpleDataBinding();

    it("parent", function () {
        expect(binding.parent).toEqual(undefined);
    });

    it("ancestors", function () {
        expect(binding.ancestors.length).toEqual(0);
    });

    it("root", function () {
        expect(binding.root).toEqual(binding);
    });

    it("children", function () {
        expect(typeof (binding.children)).toEqual("object");
    });

    it("childArrays", function () {
        expect(typeof (binding.childArrays)).toEqual("object");
    });

    it("initFamilyTree return value", function () {
        expect(binding.initFamilyTree()).toEqual(binding);
    });
});


describe("initProps - no args", function () {

    var binding = new SimpleDataBinding();

    it("configs", function () {
        expect(typeof (binding.configs)).toEqual("object");
    });

    it("nameSpace", function () {
        expect(binding.nameSpace).toEqual("");
    });

    it("container", function () {
        expect(binding.container).toEqual(document.body);
    });

    it("id", function () {
        expect(binding.id.indexOf("binding")).toEqual(0);
    });

    it("watches", function () {
        expect(typeof (binding.watches)).toEqual("object");
    });

    it("globalScopeWatches", function () {
        expect(typeof (binding.globalScopeWatches)).toEqual("object");
    });

    it("checkboxDataDelimiter", function () {
        expect(binding.checkboxDataDelimiter).toEqual(",");
    });

    it("name", function () {
        expect(binding.attrMethods.name).toEqual(binding.setNodeValue);
    });

    it("renderif", function () {
        expect(typeof (binding.attrMethods.renderif)).toEqual("function");
    });

    it("childtemplate", function () {
        expect(typeof (binding.attrMethods.childtemplate)).toEqual("function");
    });

    it("templates", function () {
        expect(typeof (binding.templates)).toEqual("object");
    });

    it("initProps return value", function () {
        expect(binding.initProps()).toEqual(binding);
    });

});


describe("initData - no args", function () {

    var binding = new SimpleDataBinding();

    it("data initalized", function () {
        expect(typeof (binding.data)).toEqual("object");
    });

    it("initData return value", function () {
        expect(binding.initData()).toEqual(binding);
    });

});


describe("init - no args", function () {

    var binding = new SimpleDataBinding();

    it("initalized", function () {
        expect(binding.initialized).toEqual(true);
    });

    it("init return value", function () {
        expect(binding.init()).toEqual(binding);
    });
});