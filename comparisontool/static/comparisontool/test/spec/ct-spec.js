describe("money_to_num(), the text to number converter...", function() {
    it("should convert mixed alphanumeric to number by removing non-numeric characters", function() {
        var money = "test5";
        number = money_to_num(money);
        expect(number).toEqual(5);
        var money = "$55";
        number = money_to_num(money);
        expect(number).toEqual(55);
    });
    it("should convert 'negative' numbers to whole numbers**", function() {
        var money = "-55";
        number = money_to_num(money);
        expect(number).toEqual(55);
    });
    it("should convert strings with no numbers to 0", function() {
        var money = "this is a test";
        number = money_to_num(money);
        expect(number).toEqual(0);
    });
    it("should, when given an non-string parameter (or null), simply return 0", function() {
        var money = 9999;
        number = money_to_num(money);
        expect(number).toEqual(0);
        var money = {"test":1, "foo": "faa"};
        number = money_to_num(money);
        expect(number).toEqual(0);
        var money = null;
        number = money_to_num(money);
        expect(number).toEqual(0);
    });
});

describe("num_to_money(), the number to text converter...", function() {
    it("should convert numbers to strings with a preceding dollar sign", function() {
        var num = 5;
        money = num_to_money(num);
        expect(money).toEqual("$5");
    });
    it("should preserve negative numbers**", function() {
        var num = -5;
        money = num_to_money(num);
        expect(money).toEqual("$-5");
    });
});

describe("jQuery.fn.setbyname, which sets an element to a value using the 'name' attribute...", function() {
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
});
