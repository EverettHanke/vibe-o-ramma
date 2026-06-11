interface InteractPromptProps {
  text: string | null
}

export function InteractPrompt({ text }: InteractPromptProps) {
  if (!text) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.65)',
        color: '#fff',
        borderRadius: 6,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {text}
    </div>
  )
}
