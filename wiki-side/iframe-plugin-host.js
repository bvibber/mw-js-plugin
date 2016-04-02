/**
 * Set up an iframe plugin host within the current element.
 * Implemented as jQuery plugin for convenient event handling.
 *
 * Events:
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
  $( window ).on( 'message', ( function( event ) {
    if( event.originalEvent.source === iframe.contentWindow ) {
      var payload = event.originalEvent.data;

      if (typeof payload === 'object' && payload.format === 'iframePluginHost' ) {
        if ( payload.event ) {
          this.trigger( 'iframePluginEvent' + payload.event, {
            data: payload.data
          } );
        }
        if ( payload.request ) {
          var r = $.Deferred();

          // If the plugin sent us a request, pass that on down to our listeners.
          // The event.response object will be a jQuery.Deferred that the listener
          // can resolve, triggering the low-level response message.
          this.trigger( 'iframePluginRequest' + payload.request, {
            requestId: payload.requestId,
            data: payload.data,
            response: r
          } );
          r.promise().done( ( function( responseData ) {
            this.iframePluginSendPayload( {
              responseId: payload.requestId
            } );
          } ).bind( this ) ).fail( ( function( responseError ) {
            console.log( 'error condition returned to response. not sure what to do', responseError );
          } ) );
        }
        if ( payload.responseId ) {
          this.trigger( 'iframePluginReply' + payload.responseId, {
            data: payload.data
          } );
        }
      } else {
        console.log( 'Ignoring message from plugin in unexpected format', payload );
      }
    } else {
      // ignore other messages, they are not for us
    }
  } ).bind( this ) );

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
 * Send a low-level message payload to the plugin.
 * Meant for internal use.
 *
 * @access private
 * @param payload {object}
 * @return {jQuery.Promise}
 */
$.fn.iframePluginSendPayload = function( payload ) {
  var iframe = this._iframePluginFrame,
    r = $.Deferred();
  if( iframe ) {
    // We don't force the target origin for now.
    // Safety first! ;)
    iframe.postMessage( payload, '*' );
    r.resolve();
  } else {
    // ignore
    r.reject( 'cannot send event to a non-plugin' );
  }
  return r.promise();
};

/**
 * Send a one-shot data payload to the plugin.
 *
 * @param eventName {string} app-specific string key such as "loaded", etc
 * @param data {object}
 */
$.fn.iframePluginSendEvent = function( eventName, data ) {
  return this.iframePluginSendPayload({
    format: 'iframePluginHost',
    event: eventName,
    data: data
  });
};

/**
 * Send a data payload to the plugin that expects a response.
 * Returned data, or failure condition, will be returned through
 * a promise.
 *
 * @param requestName {string} app-specific string key such as "info", "save", etc
 * @param data {object}
 * @return {jQuery.Promise}
 */
$.fn.iframePluginSendRequest = function( requestName, data ) {
  var iframe = this._iframePluginFrame,
    r = $.Deferred();

  if( iframe ) {
    var requestId = ++this._requestId;

    this.iframePluginSendPayload( {
      format: 'iframePluginHost',
      request: requestName,
      requestId: requestId,
      data: data
    } ).fail( r ).done( function() {
      // Use our custom event forwarding to detect the reply
      this.one( 'iframePluginReply' + requestId, function( event ) {
        // @todo confirm format, etc
        var message = event.data;
        r.resolve( message.data );
      } );
      // @todo handle timeouts/failures
    } );

  } else {
    // ignore
    r.reject( 'cannot send request to a non-plugin' );
  }
  return r.promise();
};
