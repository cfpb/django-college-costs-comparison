cut = new CFPBComparisonTool();
describe("moneyToNum(), the text to number converter...", function() { 
    it("should convert mixed alphanumeric to number by removing non-numeric characters", function() {
        var money = "test5";
        number = cut.moneyToNum(money);
        expect(number).toEqual(5);
        var money = "$55";
        number = cut.moneyToNum(money);
        expect(number).toEqual(55);
    });
    it("should convert 'negative' numbers to whole numbers**", function() {
        var money = "-55";
        number = cut.moneyToNum(money);
        expect(number).toEqual(55);
    });
    it("should convert strings with no numbers to 0", function() {
        var money = "this is a test";
        number = cut.moneyToNum(money);
        expect(number).toEqual(0);
    });
    it("should, when given an non-string parameter (or null), simply return 0", function() {
        var money = 9999;
        number = cut.moneyToNum(money);
        expect(number).toEqual(0);
        var money = {"test":1, "foo": "faa"};
        number = cut.moneyToNum(money);
        expect(number).toEqual(0);
        var money = null;
        number = cut.moneyToNum(money);
        expect(number).toEqual(0);
    });
});

describe("numToMoney(), the number to text converter...", function() {
    it("should convert numbers to strings with a preceding dollar sign", function() {
        var num = 5;
        money = cut.numToMoney(num);
        expect(money).toEqual("$5");
    });
    it("should preserve negative numbers**", function() {
        var num = -5;
        money = cut.numToMoney(num);
        expect(money).toEqual("$-5");
    });
});

describe("findEmptyColumn should return the first empty column, returns column number (1-3)", function() {
    beforeEach(function() {
        setFixtures('<table><thead><tr id="institution-row" class="institution-row"><th scope="col" data-column="1" data-schoolid=""></th><th scope="col" data-column="2" data-schoolid=""></th><th scope="col" data-column="3" data-schoolid=""></th></tr></thead></table>');
    });

    it("should return 1 if the none of the columns have data in them", function() {
        var expected_col = 1;
        var actual_col = cut.findEmptyColumn();
        expect(actual_col).toEqual(expected_col);
    });

    it("should return 2 if the first column has data in it", function() {
        // arrange
        $("#institution-row [data-column='1']").attr("data-schoolid", "123");

        // action
        var actual_col = cut.findEmptyColumn();

        // assert
        expect(actual_col).toEqual(2);
    });
    
    it("should return undefined if all of the columns are filled with school IDs", function() {
        // arrange 
        $("#institution-row [data-column='1']").attr("data-schoolid", "123");
        $("#institution-row [data-column='2']").attr("data-schoolid", "456");
        $("#institution-row [data-column='3']").attr("data-schoolid", "789");

        // action
        var actual_col = cut.findEmptyColumn();

        // assert
        expect(actual_col).toBeUndefined();
    });
});

/*describe("jQuery.fn.setbyname, which sets an element to a value using the 'name' attribute...", function() {
    beforeEach(function() {
        setFixtures('<section class="school" id="1"><input type="text" name="foofaa" /></section>');
    });
    it("should set an element to a monetary string value using the 'name' attribute", function() {
        var value = 3000;
        var school = $('#1.school');
        var schools = {"1": {"foofaa_edited": true}}
        school.setbyname('foofaa', 4000, true);
        expect($('input[name="foofaa"]').val()).toEqual("$4,000");
    });
});*/
