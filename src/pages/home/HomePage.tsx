import { useNavigate } from 'react-router-dom';
import { routes } from '@/shared/config/routes';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        background: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 420,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 12,
              }}
            >
              Yose Trainer
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 40,
                lineHeight: 1.1,
                fontWeight: 650,
                color: '#111111',
                maxWidth: 620,
              }}
            >
              Calm practice for yose reading and evaluation
            </h1>

            <p
              style={{
                marginTop: 18,
                marginBottom: 0,
                maxWidth: 640,
                fontSize: 16,
                lineHeight: 1.65,
                color: '#6b7280',
              }}
            >
              Solve local endgame positions, estimate points, identify sente type, and review the
              best continuation in a quiet, distraction-free layout.
            </p>
          </div>

          <div
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => navigate(routes.quiz)}
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                border: 'none',
                background: '#4b5563',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4b5563';
              }}
            >
              Start quiz
            </button>

            <button
              onClick={() => navigate(routes.cards)}
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#374151',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              Card library
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 10,
              }}
            >
              What you do
            </div>

            <div
              style={{
                display: 'grid',
                gap: 10,
                color: '#6b7280',
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              <div>• Evaluate the local value of a yose position</div>
              <div>• Distinguish sente, gote, reverse sente, and double sente</div>
              <div>• Review continuations in guided, step, or self-play mode</div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 10,
              }}
            >
              Training modes
            </div>

            <div
              style={{
                display: 'grid',
                gap: 10,
                color: '#6b7280',
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              <div>• Full task — find the move and count the points</div>
              <div>• Count only — the best move is marked with a triangle</div>
              <div>• Review after answering to explore the line calmly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
