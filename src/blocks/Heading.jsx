import React from 'react';

function Heading({ 
  content, 
  level = 2, 
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
  const Tag = `h${level}`;
  const style = {
    fontSize: fontSize || '24px',
    fontWeight: fontWeight || 'bold',
    color: color || '#000000',
    textAlign: textAlign || 'left',
    ...(lineHeight ? { lineHeight } : {}),
    ...(letterSpacing ? { letterSpacing } : {}),
    margin: margin || '0 0 10px 0',
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
    <Tag
      id={id || undefined}
      className={`reactor-heading ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {content || 'Heading'}
    </Tag>
  );
}

export default Heading;

