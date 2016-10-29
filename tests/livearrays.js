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

    var binding = new SimpleDataBinding("#liveArraysTestForm", startData());
    var questions = binding.childArrays.jobQuestions;

    it("push", function () {
        questions.push(questionData.offenseDetails);
        expect(binding.container.querySelector("textarea") && binding.container.querySelector("textarea").name).toEqual("offenseDetails");
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