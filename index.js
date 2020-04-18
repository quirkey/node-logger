function test(obj) {
    obj.write("success\n");
    console.log("write" in obj);
}
// test(process.stdout);
var TestClass = /** @class */ (function () {
    function TestClass(arg1) {
        if (arg1) {
            console.log(arg1);
            this.construct = arg1;
        }
        console.dir(this);
    }
    TestClass.prototype.outside = function (arg1) {
        if (arg1)
            console.log(arg1);
        console.dir(this);
    };
    return TestClass;
}());
TestClass.prototype.proto = function (arg1) {
    console.dir(this);
    console.dir(arg1);
    return "this is a prototype";
};
var tscls = new TestClass("constructor");
tscls.outside("testing class method");
TestClass.prototype.proto("this is a proto");
