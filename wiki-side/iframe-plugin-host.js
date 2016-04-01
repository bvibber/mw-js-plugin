/**
 * Set up an iframe plugin host within the current element.
 *
 * Events:
 * - 'iframePluginLoaded': loaded & ready to go
 * - 'iframePluginEvent': one-way event notification; details in event.data
 * - 'iframePluginRequest': plugin-initiated request; details in event.data,
 *                          respond via Deferred object on event.response
 *
 * @param url {string} target iframe URL
 * @param width {int} CSS pixels width
 * @param height {int} CSS pixels height
 */
$.fn.iframePluginHost = function(url, width, height) {
  var iframe;

  // @todo how/when do we remove this handler?
  $( window ).on( 'message', function( event ) {
    if( event.originalEvent.source === iframe.contentWindow ) {
      // @fixme handle the events!
      var data = event.originalEvent.data;
      console.log( data );
    } else {
      console.log( event );
      throw 'Unexpected event source: message not from frame';
    }
  } );

  // Counter for events that need unique callbacks
  this._requestId = 0;

  // Create and insert the iframe
  iframe = this._iframePluginFrame = document.createElement( 'iframe' );
  iframe.src = url;
  iframe.width = width;
  iframe.height = height;
  this.append( iframe );

  return this;
};

/**
 * Send a one-shot data payload to the plugin.
 *
 * @param data {object}
 */
$.fn.iframePluginSendData = function( data ) {
  var iframe = this._iframePluginFrame;
  if( iframe ) {
    var payload = {
      format: 'iframePluginHost',
      action: 'sendData',
      data: data
    };

    // We don't force the target origin for now.
    // Safety first! ;)
    iframe.postMessage( payload, '*' );
  } else {
    // ignore
    console.log('ignoring send data to non-plugin');
  }
};

/**
 * Send a data payload to the plugin that expects a response.
 * Returned data, or failure condition, will be returned through
 * a promise.
 *
 * @param data {object}
 * @return {jQuery.Promise}
 */
$.fn.iframePluginSendRequest = function( data ) {
  var iframe = this._iframePluginFrame,
    requestId = ++this._requestId;
  this.one( 'iframePluginReply' + requestId)
  if( iframe ) {

    var payload = {
      format: 'iframePluginHost',
      action: 'sendRequest',
      requestId: requestId,
      data: data
    };

    // We don't force the target origin for now.
    // Safety first! ;)
    iframe.postMessage( payload, '*' );
  } else {
    // ignore
    console.log('ignoring send data to non-plugin');
  }
};
