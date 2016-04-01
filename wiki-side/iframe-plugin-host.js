/**
 * Set up an iframe plugin host within the current element.
 *
 * Events:
 * - 'iframePluginLoaded'
 * - 'iframePluginRequestData'
 * - 'iframePluginRequestAction'
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

  // Create and insert the iframe
  iframe = this._iframePluginFrame = document.createElement( 'iframe' );
  iframe.src = url;
  iframe.width = width;
  iframe.height = height;
  this.append( iframe );

  return this;
};

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
    iframe.postMessage( payload, '*');
  } else {
    // ignore
    console.log('ignoring send data to non-plugin');
  }
};

$.fn.iframePluginRequestAction = function( action ) {

};
