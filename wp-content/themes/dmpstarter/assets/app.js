/**
 * DMP Starter — a minimal headless front end for DMPress.
 *
 * Everything on the page comes from the built-in REST API. There is no build
 * step and no dependencies; this file is meant to be read as a reference.
 *
 * Routing uses real URLs via the History API. DMPress serves this document for
 * every front-end path (see index.php), so the app is free to own the URL space
 * — including rendering its own "not found" view.
 */
( function () {
	'use strict';

	var PER_PAGE = 5;

	/*
	 * Base path of the install. This file is served statically, so it is never
	 * token-substituted — the value is published by index.html, which DMPress
	 * does process when serving the theme.
	 */
	var BASE = ( window.DMPRESS && window.DMPRESS.base ) || '/';

	if ( BASE.indexOf( '{{' ) === 0 ) {
		BASE = '/'; // Opened directly, outside DMPress.
	}

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
			return BASE + 'wp-json' + path + ( query.length ? '?' + query.join( '&' ) : '' );
		}

		return BASE + '?rest_route=' + encodeURIComponent( path ) + ( query.length ? '&' + query.join( '&' ) : '' );
	}

	function detectRestRoot() {
		if ( restRoot ) {
			return Promise.resolve( restRoot );
		}

		return fetch( BASE + 'wp-json/wp/v2/types', { headers: { Accept: 'application/json' } } )
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

		api( '/wp/v2/posts', { page: page, per_page: PER_PAGE, _fields: 'id,date,link,title,excerpt' } )
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

					// Use the canonical URL the CMS reports, so the permalink
					// structure stays the single source of truth.
					link.href = post.link;
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

				document.title = page > 1 ? 'Page ' + page + ' — DMPress' : 'DMPress';
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
				if ( restRoot === 'plain' ) {
					node.href = targetPage > 1 ? BASE + '?page=' + targetPage : BASE;
				} else {
					node.href = targetPage > 1 ? BASE + 'page/' + targetPage + '/' : BASE;
				}
			}

			return node;
		}

		nav.appendChild( pageLink( page - 1, '← Newer', page <= 1 ) );
		nav.appendChild( el( 'span', 'pagination__status', 'Page ' + page + ' of ' + totalPages + ' · ' + total + ' posts' ) );
		nav.appendChild( pageLink( page + 1, 'Older →', page >= totalPages ) );

		return nav;
	}

	/* -------------------------------------------------------------- single */

	function renderPost( identifier ) {
		showState( 'Loading…' );

		/*
		 * Posts are looked up by slug when the URL carries one, and by ID when
		 * the site is on plain permalinks (where the canonical URL is ?p=<id>).
		 */
		var byId = /^\d+$/.test( String( identifier ) );
		var request = byId
			? api( '/wp/v2/posts/' + encodeURIComponent( identifier ), { _fields: 'id,date,title,content' } )
			: api( '/wp/v2/posts', { slug: identifier, _fields: 'id,date,title,content' } );

		request
			.then( function ( result ) {
				var found = byId ? result.body : ( result.body.length ? result.body[ 0 ] : null );

				if ( ! found ) {
					renderNotFound();
					return;
				}

				var post = found;
				var article = el( 'article', 'post' );
				var back = el( 'a', 'back-link', '← All posts' );

				back.href = BASE;

				article.appendChild( back );
				article.appendChild( el( 'h1', 'post__title', post.title.rendered || '(no title)' ) );
				article.appendChild( el( 'p', 'post__meta', formatDate( post.date ) ) );
				article.appendChild( el( 'div', 'post__content', post.content.rendered ) );

				app.replaceChildren( article );
				document.title = ( post.title.rendered || 'Post' ) + ' — DMPress';
				window.scrollTo( 0, 0 );
			} )
			.catch( function ( error ) {
				// Looking a post up by ID 404s when it does not exist; that is a
				// missing page, not a failure worth showing an error for.
				if ( /\(404\)/.test( error.message ) ) {
					renderNotFound();
					return;
				}

				showState( error.message, true );
			} );
	}

	function renderNotFound() {
		var wrap = el( 'div', 'not-found' );
		var back = el( 'a', 'back-link', '← All posts' );

		back.href = BASE;

		wrap.appendChild( el( 'h1', 'post__title', 'Not found' ) );
		wrap.appendChild( el( 'p', 'state', 'Nothing exists at this address.' ) );
		wrap.appendChild( back );

		app.replaceChildren( wrap );
		document.title = 'Not found — DMPress';
	}

	/* ------------------------------------------------------------- routing */

	/*
	 * DMPress serves this document for any path, so routing is read straight
	 * from location.pathname.
	 *
	 * The last path segment is treated as the post slug, which keeps the app
	 * working whatever permalink structure is configured: both /hello-world/
	 * and /post/hello-world/ resolve the same way, because the slug is what the
	 * REST query actually needs.
	 */
	function routeByPath() {
		var path = window.location.pathname;

		if ( BASE !== '/' && path.indexOf( BASE ) === 0 ) {
			path = '/' + path.slice( BASE.length );
		}

		var segments = path.split( '/' ).filter( function ( part ) {
			return part.length > 0;
		} );

		if ( ! segments.length ) {
			renderList( 1 );
			return;
		}

		// .../page/N — pagination, wherever it appears in the structure.
		if ( segments.length >= 2 && segments[ segments.length - 2 ] === 'page' ) {
			var page = parseInt( segments[ segments.length - 1 ], 10 );
			renderList( page > 0 ? page : 1 );
			return;
		}

		renderPost( segments[ segments.length - 1 ] );
	}

	/*
	 * With the "Plain" permalink structure there are no rewrite rules, so every
	 * URL is the site root plus a query string — including the canonical post
	 * URLs the CMS reports, which look like ?post_type=post&p=12. Routing then
	 * has to read the query string instead of the path.
	 */
	function routeByQuery() {
		var params = new URLSearchParams( window.location.search );
		var id = params.get( 'p' );

		if ( id ) {
			renderPost( id );
			return;
		}

		var slug = params.get( 'name' );

		if ( slug ) {
			renderPost( slug );
			return;
		}

		var page = parseInt( params.get( 'page' ), 10 );
		renderList( page > 0 ? page : 1 );
	}

	function route() {
		// The mode is known only once the REST root has been probed.
		detectRestRoot().then( function ( root ) {
			if ( root === 'plain' ) {
				routeByQuery();
			} else {
				routeByPath();
			}
		} );
	}

	/* Intercept same-origin links so navigation stays client-side. */
	document.addEventListener( 'click', function ( event ) {
		var link = event.target.closest ? event.target.closest( 'a' ) : null;

		if ( ! link || event.defaultPrevented || event.button !== 0 ) {
			return;
		}

		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		if ( link.target || link.hasAttribute( 'download' ) || link.origin !== window.location.origin ) {
			return;
		}

		// Leave the admin and the REST API to the server.
		if ( /\/wp-(admin|login|json)/.test( link.pathname ) ) {
			return;
		}

		event.preventDefault();

		if ( link.href !== window.location.href ) {
			window.history.pushState( {}, '', link.href );
			route();
		}
	} );

	window.addEventListener( 'popstate', route );
	route();
}() );
