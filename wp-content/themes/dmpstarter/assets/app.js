/**
 * DMP Starter — a minimal headless front end for DMPress.
 *
 * Everything on the page comes from the built-in REST API. There is no build
 * step and no dependencies; this file is meant to be read as a reference.
 */
( function () {
	'use strict';

	var PER_PAGE = 5;

	var app = document.getElementById( 'app' );
	var restBaseLabel = document.getElementById( 'rest-base' );

	/**
	 * The REST root differs depending on the site's permalink settings:
	 * pretty permalinks expose /wp-json/, plain permalinks only ?rest_route=.
	 * Probe once, then reuse whichever answers.
	 */
	var restRoot = null;

	function buildUrl( root, path, params ) {
		var query = Object.keys( params ).map( function ( key ) {
			return encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ] );
		} );

		if ( root === 'pretty' ) {
			return '/wp-json' + path + ( query.length ? '?' + query.join( '&' ) : '' );
		}

		return '/?rest_route=' + encodeURIComponent( path ) + ( query.length ? '&' + query.join( '&' ) : '' );
	}

	function detectRestRoot() {
		if ( restRoot ) {
			return Promise.resolve( restRoot );
		}

		return fetch( '/wp-json/wp/v2/types', { headers: { Accept: 'application/json' } } )
			.then( function ( response ) {
				restRoot = response.ok ? 'pretty' : 'plain';
				return restRoot;
			} )
			.catch( function () {
				restRoot = 'plain';
				return restRoot;
			} );
	}

	function api( path, params ) {
		return detectRestRoot().then( function ( root ) {
			var url = buildUrl( root, path, params || {} );

			if ( restBaseLabel ) {
				restBaseLabel.textContent = root === 'pretty' ? '/wp-json/' : '?rest_route=';
			}

			return fetch( url, { headers: { Accept: 'application/json' } } ).then( function ( response ) {
				if ( ! response.ok ) {
					throw new Error( 'REST request failed (' + response.status + ')' );
				}

				return response.json().then( function ( body ) {
					return {
						body: body,
						// WordPress reports paging in response headers.
						total: parseInt( response.headers.get( 'X-WP-Total' ), 10 ) || 0,
						totalPages: parseInt( response.headers.get( 'X-WP-TotalPages' ), 10 ) || 0
					};
				} );
			} );
		} );
	}

	function formatDate( iso ) {
		var date = new Date( iso );

		if ( isNaN( date.getTime() ) ) {
			return '';
		}

		return date.toLocaleDateString( undefined, { year: 'numeric', month: 'long', day: 'numeric' } );
	}

	function el( tag, className, html ) {
		var node = document.createElement( tag );

		if ( className ) {
			node.className = className;
		}

		if ( html !== undefined ) {
			node.innerHTML = html;
		}

		return node;
	}

	function showState( message, isError ) {
		app.replaceChildren( el( 'p', isError ? 'state state--error' : 'state', message ) );
	}

	/* ---------------------------------------------------------------- list */

	function renderList( page ) {
		showState( 'Loading…' );

		api( '/wp/v2/posts', { page: page, per_page: PER_PAGE, _fields: 'id,date,title,excerpt' } )
			.then( function ( result ) {
				var posts = result.body;

				if ( ! posts.length ) {
					showState( 'No posts yet. Create one in the admin and it will appear here.' );
					return;
				}

				var list = el( 'div', 'posts' );

				posts.forEach( function ( post ) {
					var article = el( 'article', 'post-card' );
					var heading = el( 'h2', 'post-card__title' );
					var link = el( 'a', null, post.title.rendered || '(no title)' );

					link.href = '#/post/' + post.id;
					heading.appendChild( link );

					article.appendChild( heading );
					article.appendChild( el( 'p', 'post-card__meta', formatDate( post.date ) ) );
					article.appendChild( el( 'div', 'post-card__excerpt', post.excerpt.rendered ) );
					list.appendChild( article );
				} );

				app.replaceChildren( list );

				if ( result.totalPages > 1 ) {
					app.appendChild( renderPagination( page, result.totalPages, result.total ) );
				}
			} )
			.catch( function ( error ) {
				showState( error.message, true );
			} );
	}

	function renderPagination( page, totalPages, total ) {
		var nav = el( 'nav', 'pagination' );
		nav.setAttribute( 'aria-label', 'Posts' );

		function pageLink( targetPage, label, disabled ) {
			var node = el( disabled ? 'span' : 'a', 'pagination__link' + ( disabled ? ' is-disabled' : '' ), label );

			if ( ! disabled ) {
				node.href = '#/page/' + targetPage;
			}

			return node;
		}

		nav.appendChild( pageLink( page - 1, '← Newer', page <= 1 ) );
		nav.appendChild( el( 'span', 'pagination__status', 'Page ' + page + ' of ' + totalPages + ' · ' + total + ' posts' ) );
		nav.appendChild( pageLink( page + 1, 'Older →', page >= totalPages ) );

		return nav;
	}

	/* -------------------------------------------------------------- single */

	function renderPost( id ) {
		showState( 'Loading…' );

		api( '/wp/v2/posts/' + encodeURIComponent( id ), { _fields: 'id,date,title,content' } )
			.then( function ( result ) {
				var post = result.body;
				var article = el( 'article', 'post' );
				var back = el( 'a', 'back-link', '← All posts' );

				back.href = '#/';

				article.appendChild( back );
				article.appendChild( el( 'h1', 'post__title', post.title.rendered || '(no title)' ) );
				article.appendChild( el( 'p', 'post__meta', formatDate( post.date ) ) );
				article.appendChild( el( 'div', 'post__content', post.content.rendered ) );

				app.replaceChildren( article );
				window.scrollTo( 0, 0 );
			} )
			.catch( function ( error ) {
				showState( error.message, true );
			} );
	}

	/* ------------------------------------------------------------- routing */

	/*
	 * Hash routing keeps every view on the single entry file. The server only
	 * serves this document at "/", so real paths would not resolve.
	 */
	function route() {
		var hash = window.location.hash.replace( /^#\/?/, '' );
		var single = hash.match( /^post\/(\d+)$/ );

		if ( single ) {
			renderPost( single[ 1 ] );
			return;
		}

		var paged = hash.match( /^page\/(\d+)$/ );
		renderList( paged ? parseInt( paged[ 1 ], 10 ) : 1 );
	}

	window.addEventListener( 'hashchange', route );
	route();
}() );
