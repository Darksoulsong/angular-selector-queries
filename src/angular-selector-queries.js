( function( angular ) {

	'use strict';

	/**
        MIT Licensed.
        Copyright (c) 2011 Andy Hume (http://andyhume.net, andyhume@gmail.com).
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the 'Software''), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE.
	*/

	var win = window;
    var doc = win.document;

    var compareFunction = {
        'min-width': function( a, b ) {
            return a > b;
        },
        'max-width': function( a, b ) {
            return a < b;
        }
    };

	function memoize ( f ) {
        return function() {
            var args = Array.prototype.slice.call( arguments );
            f.memoize = f.memoize || {};
            return ( args in f.memoize ) ?
                f.memoize[ args ] :
                f.memoize[ args ] = f.apply( this, args );
        };
    }

	var emsToPixels = memoize( function( em, scope ) {
        var test = doc.createElement( 'div' );
        test.style.fontSize = '1em';
        test.style.margin = '0';
        test.style.padding = '0';
        test.style.border = 'none';
        test.style.width = '1em';
        scope.appendChild( test );
        var val = test.offsetWidth;
        scope.removeChild( test );
        return Math.round( val * em );
    } );

	function getDefaultWidth ( el, className ) {
        var test = el.cloneNode( true );
        test.className = ( ' ' + test.className + ' ' ).replace( ' ' + className + ' ', ' ' );
        test.style.height = 0;
        test.style.visibility = 'hidden';
        test.style.overflow = 'hidden';
        test.style.clear = 'both';
        var parent = el.parentNode;
        parent.insertBefore( test, el );
        var val = test.offsetWidth;
        parent.removeChild( test );
        return val;
    }

    function ngSelectorQueries () {

        function extractRules ( value ) {
            var rule = /(.*):([0-9]*)(px|em)=(.*)/.exec( value );
            return rule;
        }

        function getUnit ( value ) {
            var split = /px|em/.exec( value );
            return split[ 0 ];
        }

        function applyRules ( el, minWidth, maxWidth, className, unit ) {

            var dimension = minWidth || maxWidth;
            var ruleName = minWidth ? 'min-width' : 'max-width';

            dimension = dimension.split( unit )[ 0 ];

            // Get a target width value in pixels.
            var width = parseInt( dimension );
            if ( unit === 'em' ) {
                width = emsToPixels( parseFloat( dimension ), el );
            }

            // Calculate the width of the target without the class added.
            var defaultWidth = getDefaultWidth( el, className );

            // Test current width against target width and add/remove class values.
            if ( compareFunction[ ruleName ]( defaultWidth, width ) ) {
                if ( el.className.indexOf( className ) < 0 ) {
                    el.className += ' ' + className;
                }
            } else {
                var clsName = el.className
                    .replace( new RegExp( '(^| )' + className + '( |$)' ), '$1' );
                clsName = clsName.replace( / $/, '' );
                el.className = clsName;
            }
        }

        function selectorQueriesInit ( /*element, minWidth, maxWidth, className, unit*/ ) {
            var args = arguments;
            applyRules.apply( null, args );
            if ( win.addEventListener ) {
                win.addEventListener( 'resize', function onResize() {
                    return applyRules.apply( null, args );
                }, false );
            }

            // Allow for resizing text after the page has loaded.
            var currentEm = emsToPixels( 1, doc.body );
            win.setInterval( function() {
                var newEm = emsToPixels( 1, doc.body );
                if ( newEm !== currentEm ) {
                    applyRules.apply( null, args );
                    currentEm = newEm;
                }
            }, 100 );
        }

        function link ( scope, element, attrs ) {
            var minWidth = attrs.ngSqMinWidth;
            var maxWidth = attrs.ngSqMaxWidth;
            var className = attrs.ngSqClass;
            var unit;
            var argsRegistry = [];
            var querySplit;

            function rulesIterator( key, callback ) {
                var query = querySplit[ key ];
                var rules = extractRules( query );
                var ruleArgs = {};
                ruleArgs.minWidth = rules[ 1 ] === 'min-width' ? rules[ 2 ] : undefined;
                ruleArgs.maxWidth = rules[ 1 ] === 'max-width' ? rules[ 2 ] : undefined;
                ruleArgs.className = rules[ 4 ];
                ruleArgs.unit = rules[ 3 ];
                
                if ( typeof callback === 'function' ) {
                    callback( element[ 0 ],
                    ruleArgs.minWidth,
                    ruleArgs.maxWidth,
                    ruleArgs.className,
                    ruleArgs.unit );
                }

                argsRegistry.push( ruleArgs );
            }

            // Classical style or multiple args
            if ( !!attrs.ngSq ) {
                querySplit = attrs.ngSq.split( ' ' );

                querySplit.forEach( function iterator( value, key ) {
                    rulesIterator( key, selectorQueriesInit );
                } );
            } else {
                unit = getUnit( minWidth || maxWidth );
                selectorQueriesInit( element[ 0 ], minWidth, maxWidth, className, unit );
            }

            scope.$on( '$destroy', function onDestroy() {
                if ( argsRegistry.length ) {
                    argsRegistry.forEach( function( value ) {
                        win.removeEventListener( 'resize', function onResize() {
                            return applyRules( element[ 0 ],
                                value.minWidth,
                                value.maxWidth,
                                value.className,
                                value.unit );
                        } );
                    } );
                } else {
                    win.removeEventListener( 'resize', function onResize() {
                        return applyRules( element[ 0 ], minWidth, maxWidth, className, unit );
                    } );
                }
            } );
		}

		return {
			restrict: 'A',
			link: link
		};
	}

	angular.module( 'ngSelectorQueries', [] )
	.directive( 'ngSq', ngSelectorQueries );

} )( window.angular );
