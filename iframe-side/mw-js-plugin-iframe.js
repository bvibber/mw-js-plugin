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
            title: 'Example Data Plugin',
            url: location.href
        }, "*");
}, false);