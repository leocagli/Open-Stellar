export default function AgentDashboard() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '1.5rem',
          padding: '3rem 4rem',
          maxWidth: '640px',
          width: '100%',
        }}
      >
        {/* Star icon */}
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⭐</div>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {'{{PROJECT_NAME}}'}
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.65)',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          Your Open-Stellar agent is running. Edit{' '}
          <code
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '0.15em 0.4em',
              borderRadius: '0.3em',
              fontSize: '0.9em',
            }}
          >
            lib/agent.ts
          </code>{' '}
          to configure your agent, then refresh this page.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
          }}
        >
          {[
            { step: '1', text: 'Copy .env.example → .env.local and add your keys' },
            { step: '2', text: 'Edit lib/agent.ts to set your agent name and capabilities' },
            { step: '3', text: 'Build your agent logic in app/ and lib/' },
          ].map(({ step, text }) => (
            <div
              key={step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
              }}
            >
              <span
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {step}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{text}</span>
            </div>
          ))}
        </div>

        <a
          href="https://github.com/Killerjunior/Open-Stellar"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.6rem 1.5rem',
            background: 'rgba(167,139,250,0.2)',
            border: '1px solid rgba(167,139,250,0.4)',
            borderRadius: '0.75rem',
            color: '#a78bfa',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          Open-Stellar Docs →
        </a>
      </div>
    </main>
  )
}
