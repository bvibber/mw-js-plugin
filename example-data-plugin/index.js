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
        var entityTypeObj = {
            item: 'Q'
        }
        var claims = response.entities[requestId].claims;
        var initialEntityObj = response.entities;
        var finalEntityObj = {};
        var counter = 0;
        var arrays = [];
        var size = 50;
        var ids = Object.keys(claims).filter(function(claimId) {
          return true;
          //return claims[claimId][0].rank === "preferred";
        })
        var subIds = [];
        Object.keys(claims).forEach(function(v, i, s){
            if (claims[v][0].mainsnak.datavalue && claims[v][0].mainsnak.datatype == "wikibase-item"){
                var value = claims[v][0].mainsnak.datavalue.value;
                subIds.push(entityTypeObj[value['entity-type']] + value['numeric-id']);
            }
        })
        ids = subIds;
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

function wordwrap (str, int_width, str_break, cut) {
  //  discuss at: http://phpjs.org/functions/wordwrap/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Nick Callen
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Sakimori
  //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // bugfixed by: Michael Grier
  // bugfixed by: Feras ALHAEK
  //   example 1: wordwrap('Kevin van Zonneveld', 6, '|', true);
  //   returns 1: 'Kevin |van |Zonnev|eld'
  //   example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n');
  //   returns 2: 'The quick brown fox <br />\njumped over the lazy<br />\n dog.'
  //   example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
  //   returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod \ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \ncommodo consequat.'

  var m = ((arguments.length >= 2) ? arguments[1] : 75)
  var b = ((arguments.length >= 3) ? arguments[2] : '\n')
  var c = ((arguments.length >= 4) ? arguments[3] : false)

  var i, j, l, s, r

  str += ''

  if (m < 1) {
    return str
  }

  for (i = -1, l = (r = str.split(/\r\n|\n|\r/))
    .length; ++i < l; r[i] += s) {
    for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j))
        .length ? b : '')) {
      j = c == 2 || (j = s.slice(0, m + 1)
        .match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(
          m)
        .match(/^\S*/))[0].length
    }
  }

  return r.join('\n')
}

var utils = {
  getFirstProp: function(obj) {
    return obj[Object.keys(obj)[0]];
  },
  getKeyOnIndex: function(obj, index) {
    return Object.keys(obj)[index];
  },
  claimToVertex: function(claim, index) {
    return {id: index + 1, label: claim.value, title: claim.title, _id: claim._id}
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

function graphCreator(mainEntity, claims, lang) {
  var mainEntityProp = utils.getFirstProp(mainEntity);
  var mainVertex = {id: 0, label: wordwrap(mainEntityProp.labels[lang].value, 10, '\n', false), title: wordwrap(mainEntityProp.descriptions[lang].value, 20, '<br/>', false), shape: 'database'};
  var vertices = [];

  function noLangSupport(claim) {
    return claims[claim].labels.hasOwnProperty(lang) && claims[claim].descriptions.hasOwnProperty(lang);
  }

  Object.keys(claims).filter(noLangSupport).forEach(function(claim) {
    vertices.push(
        {
            value: wordwrap(claims[claim].labels[lang].value, 10, '\n', false),
            title: wordwrap(claims[claim].descriptions[lang].value, 20, '<br/>', false),
            _id: claim
    });
  });

  var rawNodes = vertices.map(utils.claimToVertex);
  var rawEdges = vertices.map(utils.claimToEdge);

  return { rawVertices: [].concat(mainVertex, rawNodes), rawEdges: rawEdges };
}


function visGraphBuilder(mainEntity, claims, lang) {
  var graph = graphCreator(mainEntity, claims, lang);
  var nodes = new vis.DataSet(graph.rawVertices);
  var edges = new vis.DataSet(graph.rawEdges);
  var data = {
     nodes: nodes,
     edges: edges
  };
  var options = {
    nodes: {
      shape: 'circle'
    }
  };
  utils.createElementOnBody('mynetwork');
  var container = document.getElementById('mynetwork');
  var network = new vis.Network(container, data, options);
  network.on('click', function(e) {
    if(e.nodes.length && e.nodes[0] !== 0) {
      var wikiId = data.nodes._data[e.nodes[0]]._id;

      window.parent.postMessage({
        format: "iframePluginHost",
        event: "navigateTo",
        data: {
          title: wikiId
        }
    }, "*")
    }
  })
}

//var entityId = "Q2766";
window.parent.postMessage({
    format: "iframePluginHost",
    request: "info",
    requestId: 1
}, "*")

window.addEventListener("message", function(e){
    if (e.data.responseId == 1){
        var entityId = e.data.data.title;
        var lang = e.data.data.lang;
        wikidataGet(entityId, function(mainVertex, claims) {
            visGraphBuilder(mainVertex, claims, lang);
        })
    }
})
