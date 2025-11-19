export function createDefaultLayout() {
  return {
    version: '1.0.0',
    sections: [],
  };
}

export function validateLayout(layout) {
  if (!layout || typeof layout !== 'object') {
    return false;
  }
  if (!Array.isArray(layout.sections)) {
    return false;
  }
  return true;
}

export function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout));
}

