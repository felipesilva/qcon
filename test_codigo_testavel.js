module('TopBar Tests');

test("_getRedirectPart", function() { 
    equal(_getRedirectPart("#foo"), "hash"); 
    equal(_getRedirectPart("/foo"), "pathname"); 
    equal(_getRedirectPart("http://foo.com"), "href"); 
}); 

module("Templater"); 
test("_supplant", function() { 
    var templater = new Templater(); 
    equal(templater._supplant("{foo}", {foo: "bar"}), "bar")) 
    equal(templater._supplant("foo {bar}", {bar: "baz"}), "foo baz")); 
}); 
 
test("defineTemplate", function() { 
    var templater = new Templater(); 
    templater.defineTemplate("foo", "{foo}"); 
    equal(template._templates.foo, "{foo}"); 
}); 
 
test("render", function() { 
    var templater = new Templater(); 
    templater.defineTemplate("hello", "hello {world}!"); 
    equal(templater.render("hello", {world: "internet"}), "hello internet!"); 
}); 

module("dataStore"); 
test("pop", function() { 
    dataStore.push("foo"); 
    dataStore.push("bar") 
    equal(dataStore.pop(), "bar", "popping returns the most-recently pushed item"); 
}); 
 
test("length", function() { 
    dataStore.push("foo"); 
    equal(dataStore.length(), 1, "adding 1 item makes the length 1"); 
});

module("newDataStore"); 
test("pop", function() { 
    var dataStore = newDataStore(); 
    dataStore.push("foo"); 
    dataStore.push("bar") 
    equal(dataStore.pop(), "bar", "popping returns the most-recently pushed item"); 
}); 
 
test("length", function() { 
    var dataStore = newDataStore(); 
    dataStore.push("foo"); 
    equal(dataStore.length(), 1, "adding 1 item makes the length 1"); 
});