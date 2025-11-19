// Initialize WordPress stubs immediately to prevent errors
// This MUST run before any WordPress inline scripts
// IMPORTANT: Do NOT stub wp.media - let WordPress load it properly
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
	
	// DO NOT stub wp.media - it must be loaded by WordPress media scripts
	// Stubbing it would prevent the real wp.media from being initialized
})();

