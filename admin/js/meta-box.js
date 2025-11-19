(function($) {
	'use strict';

	$(document).ready(function() {
		$('#reactor-clear-layout').on('click', function(e) {
			e.preventDefault();
			
			if (!confirm('Are you sure you want to clear the layout? This action cannot be undone.')) {
				return;
			}
			
			var postId = $(this).data('post-id');
			var button = $(this);
			
			button.prop('disabled', true).text('Clearing...');
			
			$.ajax({
				url: reactorBuilderMeta.apiUrl + 'layouts/' + postId,
				method: 'DELETE',
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WP-Nonce', reactorBuilderMeta.nonce);
				},
				success: function() {
					location.reload();
				},
				error: function() {
					alert('Error clearing layout. Please try again.');
					button.prop('disabled', false).text('Clear Layout');
				}
			});
		});
	});
})(jQuery);

