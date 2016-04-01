window.addEventListener("DOMContentLoaded", function(){
    var iframe = document.createElement("iframe");
    iframe.src = "iframe.html";
    document.body.appendChild(iframe);
    window.addEventListener("message", function(e){
        if (e.source == iframe.contentWindow){
            console.log("wiki side", e.data, e);
        }
    }, false);
}, false);
