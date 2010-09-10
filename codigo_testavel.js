//Tight Functions
//Antes
function redirectTo(url) { 
    if (url.charAt(0) === "#") { 
        window.location.hash = url; 
    } else if (url.charAt(0) === "/") { 
        window.location.pathname = url; 
    } else { 
        window.location.href = url; 
    } 
}

//Depois
function _getRedirectPart(url) { 
    if (url.charAt(0) === "#") { 
        return "hash"; 
    } else if (url.charAt(0) === "/") { 
        return "pathname"; 
    } else { 
        return "href"; 
    } 
} 
 
function redirectTo(url) { 
    window.location[_getRedirectPart(url)] = url; 
}

//Closure-based Privacy
//Antes
function TemplaterNoTest() { 
    function supplant(str, params) { 
        for (var prop in params) { 
            str.split("{" + prop +"}").join(params[prop]); 
        } 
        return str; 
    } 
 
    var templates = {}; 
 
    this.defineTemplate = function(name, template) { 
        templates[name] = template; 
    }; 
 
    this.render = function(name, params) { 
        if (typeof templates[name] !== "string") { 
            throw "Template " + name + " not found!"; 
        } 
 
        return supplant(templates[name], params); 
    }; 
}

//Depois
function Templater() { 
    this._templates = {}; 
} 
 
Templater.prototype = { 
    _supplant: function(str, params) { 
        for (var prop in params) { 
            str.split("{" + prop +"}").join(params[prop]); 
        } 
        return str; 
    }, 
    render(name, params) { 
        if (typeof this._templates[name] !== "string") { 
            throw "Template " + name + " not found!"; 
        } 
 
        return this._supplant(this._templates[name], params); 
    }, 
    defineTemplate: function(name, template) { 
        this._templates[name] = template; 
    } 
};

//Singletons
//Antes
var dataStore = (function() { 
    var data = []; 
    return { 
        push: function (item) { 
            data.push(item); 
        }, 
        pop: function() { 
            return data.pop(); 
        }, 
        length: function() { 
            return data.length; 
        } 
    }; 
}()); 

//Depois
function newDataStore() { 
    var data = []; 
    return { 
        push: function (item) { 
            data.push(item); 
        }, 
        pop: function() { 
            return data.pop(); 
        }, 
        length: function() { 
            return data.length; 
        } 
    }; 
} 

