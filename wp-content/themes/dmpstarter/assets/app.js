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

	/* ------------------------------------------------------------ categories */

	var categoriesPromise = null;

	/**
	 * Fetches the category list once and reuses it.
	 *
	 * Categories are a Content-Type Builder taxonomy and may be deactivated or
	 * deleted, in which case the route 404s — resolve to an empty list so the
	 * rest of the theme simply omits anything category-related.
	 */
	function loadCategories() {
		if ( ! categoriesPromise ) {
			categoriesPromise = api( '/wp/v2/categories', { per_page: 100, orderby: 'name', _fields: 'id,name,slug,link,count' } )
				.then( function ( result ) {
					return result.body;
				} )
				.catch( function () {
					return [];
				} );
		}

		return categoriesPromise;
	}

	/**
	 * Derives the archive URL prefix from a term's canonical link.
	 *
	 * Avoids hard-coding "/category/": the base is whatever the Content-Type
	 * Builder's rewrite slug produces, and this reads it back from the data.
	 */
	function categoryBasePath( categories ) {
		if ( ! categories.length ) {
			return null;
		}

		var path = new URL( categories[ 0 ].link, window.location.origin ).pathname;
		var parts = path.split( '/' ).filter( function ( part ) {
			return part.length > 0;
		} );

		parts.pop(); // Drop the term slug, leaving the base.

		return parts.length ? '/' + parts.join( '/' ) + '/' : null;
	}

	function renderCategoryNav( categories, activeId ) {
		var nav = document.getElementById( 'category-nav' );

		if ( ! nav ) {
			return;
		}

		if ( ! categories.length ) {
			nav.hidden = true;
			nav.replaceChildren();
			return;
		}

		var nodes = [ el( 'span', 'site-nav__label', 'Categories' ) ];

		categories.forEach( function ( term ) {
			var link = el( 'a', null, term.name + ' (' + term.count + ')' );

			link.href = term.link;

			if ( activeId && term.id === activeId ) {
				link.setAttribute( 'aria-current', 'page' );
			}

			nodes.push( link );
		} );

		nav.replaceChildren.apply( nav, nodes );
		nav.hidden = false;
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

	/**
	 * Renders the post list. Passing a term renders that category's archive.
	 */
	function renderList( page, term ) {
		showState( 'Loading…' );

		var params = { page: page, per_page: PER_PAGE, _fields: 'id,date,link,title,excerpt,categories' };

		if ( term ) {
			params.categories = term.id;
		}

		Promise.all( [ api( '/wp/v2/posts', params ), loadCategories() ] )
			.then( function ( results ) {
				var result = results[ 0 ];
				var categories = results[ 1 ];
				var posts = result.body;

				renderCategoryNav( categories, term ? term.id : null );

				if ( ! posts.length ) {
					showState( term
						? 'No posts in this category yet.'
						: 'No posts yet. Create one in the admin and it will appear here.' );
					return;
				}

				var list = el( 'div', 'posts' );

				if ( term ) {
					var header = el( 'header', 'archive-header' );
					header.appendChild( el( 'p', 'archive-header__kicker', 'Category' ) );
					header.appendChild( el( 'h1', 'archive-header__title', term.name ) );
					list.appendChild( header );
				}

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

					// Categories, resolved against the list already fetched.
					var terms = ( post.categories || [] ).map( function ( id ) {
						return categories.filter( function ( c ) {
							return c.id === id;
						} )[ 0 ];
					} ).filter( Boolean );

					if ( terms.length ) {
						var meta = el( 'p', 'post-card__terms' );
						meta.appendChild( document.createTextNode( 'In ' ) );

						terms.forEach( function ( t, index ) {
							if ( index ) {
								meta.appendChild( document.createTextNode( ', ' ) );
							}

							var termLink = el( 'a', null, t.name );
							termLink.href = t.link;
							meta.appendChild( termLink );
						} );

						article.appendChild( meta );
					}

					list.appendChild( article );
				} );

				app.replaceChildren( list );

				if ( result.totalPages > 1 ) {
					app.appendChild( renderPagination( page, result.totalPages, result.total, term ) );
				}

				var base = term ? term.name + ' — DMPress' : 'DMPress';
				document.title = page > 1 ? 'Page ' + page + ' — ' + base : base;
			} )
			.catch( function ( error ) {
				showState( error.message, true );
			} );
	}

	function renderPagination( page, totalPages, total, term ) {
		var nav = el( 'nav', 'pagination' );
		nav.setAttribute( 'aria-label', 'Posts' );

		function hrefFor( targetPage ) {
			if ( restRoot === 'plain' ) {
				var root = term ? BASE + '?cat=' + term.id : BASE;

				if ( targetPage <= 1 ) {
					return root;
				}

				return root + ( term ? '&' : '?' ) + 'page=' + targetPage;
			}

			var prefix = term ? new URL( term.link, window.location.origin ).pathname : BASE;

			return targetPage > 1 ? prefix + 'page/' + targetPage + '/' : prefix;
		}

		function pageLink( targetPage, label, disabled ) {
			var node = el( disabled ? 'span' : 'a', 'pagination__link' + ( disabled ? ' is-disabled' : '' ), label );

			if ( ! disabled ) {
				node.href = hrefFor( targetPage );
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
				loadCategories().then( function ( categories ) {
					renderCategoryNav( categories, null );
				} );
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
	function routeByPath( categories ) {
		var path = window.location.pathname;

		if ( BASE !== '/' && path.indexOf( BASE ) === 0 ) {
			path = '/' + path.slice( BASE.length );
		}

		var segments = path.split( '/' ).filter( function ( part ) {
			return part.length > 0;
		} );

		// Trailing /page/N applies to whichever listing precedes it.
		var page = 1;

		if ( segments.length >= 2 && segments[ segments.length - 2 ] === 'page' ) {
			page = parseInt( segments[ segments.length - 1 ], 10 ) || 1;
			segments = segments.slice( 0, -2 );
		}

		if ( ! segments.length ) {
			renderList( page );
			return;
		}

		// A category archive, matched against the base read from the term links.
		var base = categoryBasePath( categories );

		if ( base ) {
			var prefix = base.split( '/' ).filter( function ( part ) {
				return part.length > 0;
			} );

			if ( segments.length === prefix.length + 1
				&& segments.slice( 0, prefix.length ).join( '/' ) === prefix.join( '/' ) ) {
				var slug = segments[ segments.length - 1 ];
				var term = categories.filter( function ( c ) {
					return c.slug === slug;
				} )[ 0 ];

				if ( term ) {
					renderList( page, term );
					return;
				}

				renderNotFound();
				return;
			}
		}

		renderPost( segments[ segments.length - 1 ] );
	}

	/*
	 * With the "Plain" permalink structure there are no rewrite rules, so every
	 * URL is the site root plus a query string — including the canonical post
	 * URLs the CMS reports, which look like ?post_type=post&p=12. Routing then
	 * has to read the query string instead of the path.
	 */
	function routeByQuery( categories ) {
		var params = new URLSearchParams( window.location.search );
		var page = parseInt( params.get( 'page' ), 10 );
		page = page > 0 ? page : 1;

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

		// Category archives are ?cat=<id> without rewrite rules.
		var cat = parseInt( params.get( 'cat' ), 10 );

		if ( cat > 0 ) {
			var term = categories.filter( function ( c ) {
				return c.id === cat;
			} )[ 0 ];

			if ( term ) {
				renderList( page, term );
				return;
			}

			renderNotFound();
			return;
		}

		renderList( page );
	}

	function route() {
		/*
		 * Both the permalink mode and the category list are needed before a URL
		 * can be interpreted: the mode decides whether to read the path or the
		 * query string, and the categories supply the archive base and slugs.
		 */
		detectRestRoot()
			.then( loadCategories )
			.then( function ( categories ) {
				if ( restRoot === 'plain' ) {
					routeByQuery( categories );
				} else {
					routeByPath( categories );
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
