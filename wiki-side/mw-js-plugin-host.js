// Work in progress scaffolding for plugin host within MediaWiki

(function($, mediaWiki) {

  /**
   * @param url {string} target iframe URL
   * @param width {int} CSS pixels width
   * @param height {int} CSS pixels height
   */
  mediaWiki.JSPluginHost = function() {
    // type coercions
    url = '' + url;
    width = +width;
    height = +height;

    // @todo how/when do we remove this handler?
    window.addEventListener( 'message', this._onmessage.bind( this ) );

    this._loaded = $.Deferred();

    this.iframe = document.createElement( 'iframe' );
    this.iframe.src = url;
    this.iframe.width = width;
    this.iframe.height = height;
  };
  $.extend(mediaWiki.JSPluginHost.prototype, {
    /**
     * @return {jQuery.Promise} fulfilled when loading is complete
     */
    load: function() {
      return this._loaded.promise();
    },

    /**
     * Event handler for the iframe's 'message' event
     */
    _onmessage: function( event ) {
      console.log( event );
      if( event.source === this.iframe.contentWindow ) {
        // @fixme handle the events!
      } else {
        throw 'Unexpected event source: message not from frame';
      }
    }
  });

})(jQuery, mediaWiki);
