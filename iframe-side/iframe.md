enough API scaffold to:
* receive input data from parent
* wiki identifier -- are we on wikidata? english wikipedia? something else? (URL might be enough fo rnow)
* title -- what page are we on?
* send events back to parent
 * definitely need 'loaded' event to confirm we're ready
 * MAYBE:  'request navigate to article' after clicking on something?
