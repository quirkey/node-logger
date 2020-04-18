interface WritableObject {
	write(text: string): any;
}

function test(obj: WritableObject): void {
	obj.write("success\n");
	console.log("write" in obj);
}

// test(process.stdout);

class TestClass {
		construct: any;
		proto: any;
		constructor(arg1?: any) {
			if (arg1) {
				console.log(arg1);
				this.construct = arg1;
			}
			console.dir(this);
			
	}
	
		outside(arg1?: any) {
			if (arg1) console.log(arg1);
			console.dir(this);
		
	}
}

TestClass.prototype.proto = function(arg1: any): string {
	console.dir(this);
	console.dir(arg1);
	return "this is a prototype";
}

const tscls = new TestClass("constructor");
tscls.outside("testing class method");
TestClass.prototype.proto("this is a proto");
