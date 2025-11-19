// Initialize WordPress stubs immediately to prevent errors
(function() {
	'use strict';
	
	// Create wp object if it doesn't exist
	if (typeof window.wp === 'undefined') {
		window.wp = {};
	}
	
	// Initialize media stubs
	window.wp.media = window.wp.media || {};
	window.wp.media.view = window.wp.media.view || {};
	window.wp.media.controller = window.wp.media.controller || {};
	window.wp.media.editor = window.wp.media.editor || {
		initializeEditor: function() {},
		remove: function() {}
	};
	
	// Initialize SVG painter stub - CRITICAL: must have interval property
	window.wp.svgPainter = window.wp.svgPainter || {
		init: function() {},
		interval: null,
		view: {}
	};
	// Ensure interval is always set
	if (window.wp.svgPainter.interval === undefined) {
		window.wp.svgPainter.interval = null;
	}
	
	// Prevent editor initialization
	window.wp.editor = window.wp.editor || {
		initialize: function() {},
		remove: function() {}
	};
})();

