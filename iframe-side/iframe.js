var dependenciesArr = [
    "location"
]
var initObj = {
    dependencies: dependenciesArr
}
window.addEventListener("message", function(e){
    if (e.source = window){
        console.log("iframe side", "source is own window");
    }
}, false);
window.addEventListener("DOMContentLoaded", function(e){
        window.parent.postMessage("init", "*");
}, false);