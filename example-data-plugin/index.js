//Q801
function wikidataGet(requestId, datagetCallback){
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
        var ids = Object.keys(response.entities[requestId].claims);
        var initialEntityObj = response.entities;
        var finalEntityObj = {};
        var counter = 0;
        var arrays = [];
        var size = 50;
        while (ids.length > 0)
            arrays.push(ids.splice(0, size));
        for (i = 0; i < arrays.length; i++){
            makeRequest("https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=" + arrays[i].join('|'), function(response){
                finalEntityObj = mergeObjects(finalEntityObj, response.entities);
                if (++counter == arrays.length){
                    datagetCallback(initialEntityObj, finalEntityObj);
                }
            })
        }
    });
};

var utils = {
  getFirstProp: function(obj) {
    return obj[Object.keys(obj)[0]];
  },
  getKeyOnIndex: function(obj, index) {
    return Object.keys(obj)[index];
  },
  claimToVertex: function(name, index) {
    return {id: index + 1, label: name}
  },
  claimToEdge: function(name, index) {
    return {from: 0, to: index + 1}
  },
  createElementOnBody: function(elemId) {
    var mainDiv = document.createElement("div");
    mainDiv.setAttribute("id", elemId);
    var body = document.getElementsByTagName("BODY")[0];
    body.appendChild(mainDiv);
  }
}

function graphify(main, subVertices) {
  var mainEntity = utils.getFirstProp(main);
  var mainVertex = {id: 0, label: mainEntity.labels.en.value};
  var claims = [];
  Object.keys(subVertices).forEach(function(key) {
    claims.push(key);
  });
  var rawNodes = claims.map(utils.claimToVertex);
  var rawEdges = claims.map(utils.claimToEdge);

  return { rawVertices: [].concat(mainVertex, rawNodes), rawEdges: rawEdges };
}

function createGraph(mainVertex, claims) {
  var graph = graphify(mainVertex, claims);
  var nodes = new vis.DataSet(graph.rawVertices);
  var edges = new vis.DataSet(graph.rawEdges);
  var data = {
     nodes: nodes,
     edges: edges
  };
  var options = {};

  utils.createElementOnBody('mynetwork');
  var container = document.getElementById('mynetwork');

  var network = new vis.Network(container, data, options);
}

wikidataGet("Q41",function(mainVertex, claims) {
  console.log(mainVertex, claims);
  createGraph(mainVertex, claims)
})
