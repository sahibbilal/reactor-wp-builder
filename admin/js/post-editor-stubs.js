// Initialize WordPress stubs immediately to prevent errors
// This MUST run before any WordPress inline scripts
(function() {
	'use strict';
	
	// Create wp object if it doesn't exist
	if (typeof window.wp === 'undefined') {
		window.wp = {};
	}
	
	// Initialize SVG painter stub FIRST - CRITICAL: must have interval property
	// This must be set before WordPress scripts try to access it
	if (typeof window.wp.svgPainter === 'undefined') {
		window.wp.svgPainter = {
			init: function() {},
			interval: null,
			view: {}
		};
	}
	// Ensure interval is always set (even if svgPainter was partially initialized)
	if (!window.wp.svgPainter.hasOwnProperty('interval') || window.wp.svgPainter.interval === undefined) {
		window.wp.svgPainter.interval = null;
	}
	if (typeof window.wp.svgPainter.view === 'undefined') {
		window.wp.svgPainter.view = {};
	}
	
	// Initialize editor stub
	if (typeof window.wp.editor === 'undefined') {
		window.wp.editor = {
			initialize: function() {},
			remove: function() {}
		};
	}
	
	// Initialize media stubs - but DON'T override wp.media if it's already a function
	// wp.media should be a function (from wp_enqueue_media), not an object
	// We only set up the structure if media library hasn't loaded yet
	if (typeof window.wp.media === 'undefined') {
		// Create a temporary object structure, but wp_enqueue_media will replace this with a function
		window.wp.media = {};
	}
	
	// Only add view/controller stubs if they don't exist
	// These are safe to set as they won't interfere with the real media library
	if (typeof window.wp.media.view === 'undefined') {
		window.wp.media.view = {};
	}
	if (typeof window.wp.media.controller === 'undefined') {
		window.wp.media.controller = {};
	}
	if (typeof window.wp.media.editor === 'undefined') {
		window.wp.media.editor = {
			initializeEditor: function() {},
			remove: function() {}
		};
	}
})();

