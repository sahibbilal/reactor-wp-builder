import React from 'react';

function Text({ 
  content, 
  fontSize, 
  fontWeight,
  color, 
  textAlign,
  lineHeight,
  letterSpacing,
  padding,
  margin,
  backgroundColor,
  borderWidth,
  borderRadius,
  borderColor,
  borderStyle,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  width,
  height,
  minWidth,
  maxWidth,
  opacity,
  boxShadow,
  transform,
  transition,
  className,
  customCSS,
  id,
  selected 
}) {
  const style = {
    fontSize: fontSize || '16px',
    fontWeight: fontWeight || 'normal',
    color: color || '#000000',
    textAlign: textAlign || 'left',
    ...(lineHeight ? { lineHeight } : {}),
    ...(letterSpacing ? { letterSpacing } : {}),
    margin: margin || '0',
    padding: padding || '0',
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(borderWidth ? { borderWidth, borderStyle: borderStyle || 'solid' } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(borderColor ? { borderColor } : {}),
    ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
    ...(backgroundSize ? { backgroundSize } : {}),
    ...(backgroundPosition ? { backgroundPosition } : {}),
    ...(backgroundRepeat ? { backgroundRepeat } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(minWidth ? { minWidth } : {}),
    ...(maxWidth ? { maxWidth } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(boxShadow ? { boxShadow } : {}),
    ...(transform ? { transform } : {}),
    ...(transition ? { transition } : {}),
  };

  return (
    <p
      id={id || undefined}
      className={`reactor-text ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {content || 'Text block'}
    </p>
  );
}

export default Text;

