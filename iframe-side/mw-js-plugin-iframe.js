var dependenciesArr = [
    "location"
]
var initObj = {
    dependencies: dependenciesArr
}
window.addEventListener("message", function(e){
    console.log("iframe side", e.data, e);
}, false);
window.addEventListener("DOMContentLoaded", function(e){
        window.parent.postMessage("init", "*");
        window.parent.postMessage(
        {
            title: 'ExamplePlugin',
            url: location.href
        }, "*");
}, false);