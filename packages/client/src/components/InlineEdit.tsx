import React, { useState, KeyboardEvent, useEffect } from 'react';

type InlineEditProps = {
  initialText: string;
  onSave: (newText: string) => void;
  className?: string; 
  textArea?: boolean;
};

export function InlineEdit({ initialText, onSave, className, textArea }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSave = () => {
    if (text.trim() && text.trim() !== initialText) {
      onSave(text.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !textArea) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setText(initialText);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
      value: text,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setText(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      autoFocus: true,
      className: className,
      style: { 
        width: '100%', 
        padding: '0.5rem', 
        margin: 0, 
        boxSizing: 'border-box' 
      } as React.CSSProperties
    };

    return textArea ? (
      <textarea {...commonProps} rows={3} />
    ) : (
      <input type="text" {...commonProps} />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={className}
      style={{ cursor: 'pointer', padding: '0.5rem' }}
    >
      {text}
    </div>
  );
}