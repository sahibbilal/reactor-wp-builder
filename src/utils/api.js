export async function saveLayout(postId, layout) {
  if (!window.reactorBuilder) {
    throw new Error('Reactor Builder API not available');
  }

  const response = await fetch(
    `${window.reactorBuilder.apiUrl}layouts/${postId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.reactorBuilder.nonce,
      },
      body: JSON.stringify(layout),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save layout');
  }

  return await response.json();
}

export async function loadLayout(postId) {
  if (!window.reactorBuilder) {
    throw new Error('Reactor Builder API not available');
  }

  const response = await fetch(
    `${window.reactorBuilder.apiUrl}layouts/${postId}`,
    {
      headers: {
        'X-WP-Nonce': window.reactorBuilder.nonce,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No layout found
    }
    throw new Error('Failed to load layout');
  }

  const data = await response.json();
  return data.layout || null;
}

