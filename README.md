# mw-js-plugin
Experimental repo for MediaWiki JavaScript iframe-based plugin system

Session notes from hackathon: https://etherpad.wikimedia.org/p/WikiHack16-JavaScript

Session task in WMF phab: https://phabricator.wikimedia.org/T131436

Demos
=====

Sample graph plugin is available for Wikidata, will be cleaned up later and others added!

Standalone version: https://rawgit.com/brion/mw-js-plugin/master/wiki-side/index.html

Login to Wikidata and go to [your user common.js page](https://www.wikidata.org/wiki/Special:MyPage/common.js). Click 'edit' tab and paste in:

```
importScriptURI('https://www.wikidata.org/w/index.php?title=User:Brion_VIBBER/plugin-test.js&action=raw&ctype=text/javascript');
```



Moving parts
============

Basic parts and terms:
* host: web application opened directly in the browser
* plugin: specialized web application that the host opens in an iframe
* bridge: the communications protocol between host and plugin
 * message: any datagram sent from one side to the other
  * payload: the entire JSON object sent via postMessage
  * data: a JSON object in a payload's 'data' property
 * event: one-way datagram sent from one side to the other
 * request: datagram sent across the bridge to initiate a two-way communication
 * response: datagram sent across the bridge to complete a two-way communication

Low-level bridge protocol
==============================

The communications bridge between host and plugin uses the [HTML window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) interface.

There are two low-level types of messages: one-off "event" messages and two-way "request"/"response" messages.

The same message types are used in both directions; different events and data payloads will be specified on top of this to create an application-specific embedding protocol.

One-way "event" messages have this layout:

```
  {
    format: "iframePluginHost",
    event: <string>,
    data: { ... }
  }
```

These are sent on a "fire and forget" basis; no response is expected.

Two-way "request" messages are composed of a request followed by a response in the other direction. Request messages look like this:

```
  {
    format: "iframePluginHost",
    request: <string>,
    requestId: <integer>,
    data: { ... }
  }
```

The requestId is selected by the initator of the request, and must be unique within the data stream. This can be easily accomplished by incrementing a counter.


A response message in the other direction looks like:

```
  {
    format: "iframePluginHost",
    responseId: <integer>,
    data: { ... }
  }
```

The responseId value is the requestId provided in the request; this allows the other side to associate the reply with the correct handler.

App-level protocol for MediaWiki embedding
==========================================

For this initial demo, things are very simple. :)

Order of operations:

* host opens iframe with the plugin's target URL
* plugin loads
* plugin sends 'loaded' event to host when ready
* plugin sends 'info' request to host
 * host responds with wiki's base URL and article title

loaded event
------------

Sent from plugin to host when ready. Allows host to know when the plugin is ready to accept events/requests.

Data payload: empty/unused

info request
------------

Request sent from plugin to host to ask for environmental state.

Request data payload: empty/unused (or specify which info we need?)

Response data payload:
```
  {
    url: <string>,
    title: <string>
  }
```

@todo spec this out to be more generally useful


Open questions and todos
========================

* timeouts for request/response?
* higher-level protocol features
 * trust/permission requests?
 * safety & sending of code from host to client?
  * eg providing standard libraries without having to bundle them into the extensions
