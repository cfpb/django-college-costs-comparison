describe("CFPBComparisonTool.moneyToNum(), the text to number converter...", function() {
    it("should convert mixed alphanumeric to number by removing non-numeric characters", function() {
        var money = "test5";
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(5);
        var money = "$55";
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(55);
    });
    it("should convert 'negative' numbers to whole numbers**", function() {
        var money = "-55";
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(55);
    });
    it("should convert strings with no numbers to 0", function() {
        var money = "this is a test";
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(0);
    });
    it("should, when given an non-string parameter (or null), simply return 0", function() {
        var money = 9999;
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(0);
        var money = {"test":1, "foo": "faa"};
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(0);
        var money = null;
        number = CFPBComparisonTool.moneyToNum(money);
        expect(number).toEqual(0);
    });
});

describe("CFPBComparisonTool.numToMoney(), the number to text converter...", function() {
    it("should convert numbers to strings with a preceding dollar sign", function() {
        var num = 5;
        money = CFPBComparisonTool.numToMoney(num);
        expect(money).toEqual("$5");
    });
    it("should preserve negative numbers**", function() {
        var num = -5;
        money = CFPBComparisonTool.numToMoney(num);
        expect(money).toEqual("$-5");
    });
});

describe("CFPBComparisonTool.Column.setByNickname, which sets an element to a value using the 'data-nickname' attribute...", function() {
    beforeEach(function() {
        var fixture = '<table><tr><td data-column="1"><input type="text" data-nickname="foofaa" /></td>';
        fixture += '<td data-column="1"><h2 data-nickname="faafaa">Faafaa</h2></td>';
        fixture += '<td data-column="1"><input data-nickname="foofoo" class="interest-rate"></td></tr></table>'
        setFixtures(fixture);
    });
    it("should set an input element to a monetary string value using the 'data-nickname' attribute", function() {
        var column = new CFPBComparisonTool.Column(1);
        column.setByNickname('foofaa', 4000);
        expect($('input[data-nickname="foofaa"]').val()).toEqual("$4,000");
    });
    it("should set a non-input element to a monetary string value using the 'data-nickname' attribute", function() {
        var column = new CFPBComparisonTool.Column(1);
        column.setByNickname('faafaa', 3000);
        expect($('h2[data-nickname="faafaa"]').html()).toEqual("$3,000");
    });
    it("should set a input element with the .interest-rate class to a percentage if the 'p' parameter is present", function() {
        var column = new CFPBComparisonTool.Column(1);
        column.setByNickname('foofoo', .5, "p");
        expect($('input[data-nickname="foofoo"]').val()).toEqual("50%");
    });
});
