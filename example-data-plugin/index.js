var requestId = 'Q801';
function wikidataGet(id, callback){
    function mergeObjects(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }
    function makeRequest(url, callback){
        requestCallback = function(parameter){
            callback(parameter);
        };
        var script = document.createElement('script');
        script.src = url + "&callback=requestCallback";
        (document.head||document.documentElement).appendChild(script);
        script.parentNode.removeChild(script); 
    }

    makeRequest("https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=" + requestId, function(response){
        console.log(response);
        var ids = Object.keys(response.entities[requestId].claims);

        var arrays = [], size = 50;
        while (ids.length > 0)
            arrays.push(ids.splice(0, size));
        console.log(arrays);
        finalEntityObj = {};
        for (i = 0; i < arrays.length; i++){
            makeRequest("https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=" + arrays[i].join('|'), function(response){
                console.log(response);
                finalEntityObj = mergeObjects(finalEntityObj, response);
            })
        }
    });
}
