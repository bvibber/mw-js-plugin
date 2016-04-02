$.getScript('https://www.wikidata.org/w/index.php?title=User:Brion_VIBBER/iframe-plugin-host.js&action=raw&ctype=text/javascript')
.done(function() {
	// now wait until dom ready :D
	$(function() {
	var url = window.location + '',
		title = mediaWiki.config.get( 'wgPageName' ),
		lang = mediaWiki.config.get( 'wgUserLanguage' ),
		action = mediaWiki.config.get( 'wgAction' );

	if ( action == 'view' && title.match(/^Q\d+$/) ) {
	    var $plugin = $( '<div>' )
	    	.attr( 'id', 'plugin-example-placeholder' )
	      .iframePluginHost( 'https://rawgit.com/brion/mw-js-plugin/master/example-data-plugin/index.html', 920, 540 )
	      .on( 'iframePluginEvent:loaded', function( event ) {
	        // @todo implement this event & demo it
	        // One-shot event notification from the plugin.
	        console.log( 'plugin loaded', event.data );
	      } )
        .on( 'iframePluginEvent:navigateTo', function( event ) {
          console.log( 'navigate to ' + event.details.title );
          window.location = mediaWiki.config.get('wgArticlePath').replace(/\$1/, event.details.title);
        } )
	      .on( 'iframePluginRequest:info', function( event ) {
	        // @todo implement this event & demo it
	        // Initiation of a request for data or action from the plugin
	        console.log( 'plugin info request', event.data );

	        // Treat it like a $.Deferred
	        event.response.resolve( {
	        	url: url,
	        	title: title,
	        	lang: lang
	        } );
	      } );
	    $plugin.insertBefore( '.wikibase-entityview-main' );
		}
	});
});
