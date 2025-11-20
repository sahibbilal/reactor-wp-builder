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
    ...(backgroundImage ? { 
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: backgroundSize || 'cover',
      backgroundPosition: backgroundPosition || 'center',
      backgroundRepeat: backgroundRepeat || 'no-repeat'
    } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(minWidth ? { minWidth } : {}),
    ...(maxWidth ? { maxWidth } : {}),
    ...(opacity !== undefined ? { opacity } : {}),
    ...(boxShadow ? { boxShadow } : {}),
    ...(transform ? { transform } : {}),
    ...(transition ? { transition } : {}),
  };

  // Render HTML content if it contains HTML tags, otherwise render as plain text
  const renderContent = () => {
    const contentValue = content || '';
    // If empty, show placeholder
    if (!contentValue || contentValue.trim() === '') {
      return <span style={{ color: '#a7aaad', fontStyle: 'italic' }}>Text block</span>;
    }
    // Check if content contains HTML tags
    if (/<[a-z][\s\S]*>/i.test(contentValue)) {
      return <div dangerouslySetInnerHTML={{ __html: contentValue }} />;
    }
    return contentValue;
  };

  return (
    <div
      id={id || undefined}
      className={`reactor-text ${className || ''} ${selected ? 'selected' : ''}`}
      style={style}
    >
      {renderContent()}
    </div>
  );
}

export default Text;

