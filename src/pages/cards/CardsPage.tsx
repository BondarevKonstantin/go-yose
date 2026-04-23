import { useNavigate } from 'react-router-dom';
import { GoBoard } from '@/entities/go-board/ui/GoBoard';
import { getScenarioById } from '@/entities/yose-card/model/helpers';
import { mockCards } from '@/entities/yose-card/model/mockCards';
import { getQuizCardPath } from '@/shared/lib/getQuizCardPath';

export const CardsPage = () => {
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
          maxWidth: 1200,
        }}
      >
        <div
          style={{
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: '#6b7280',
              marginBottom: 8,
            }}
          >
            Yose Trainer
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.15,
              fontWeight: 650,
              color: '#111111',
            }}
          >
            Card library
          </h1>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: 15,
              lineHeight: 1.6,
              color: '#6b7280',
              maxWidth: 720,
            }}
          >
            Open any position directly and review it in quiz mode. The layout stays focused on
            reading and evaluation without extra visual noise.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 16,
          }}
        >
          {mockCards.map((card, index) => {
            const scenario = getScenarioById(card, card.initialScenarioId);

            return (
              <button
                key={card.id}
                onClick={() => navigate(getQuizCardPath(card.id))}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  gap: 16,
                  alignItems: 'start',
                  width: '100%',
                  textAlign: 'left',
                  padding: 16,
                  borderRadius: 20,
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 160,
                  }}
                >
                  <GoBoard
                    size={card.size}
                    viewport={card.viewport}
                    stones={scenario.initialStones}
                    boardSizePx={160}
                    isInteractive={false}
                  />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#6b7280',
                      marginBottom: 6,
                    }}
                  >
                    Card {index + 1}
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#111111',
                      lineHeight: 1.2,
                    }}
                  >
                    {card.title ?? card.id}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      color: '#6b7280',
                      lineHeight: 1.55,
                    }}
                  >
                    {card.size}×{card.size} board
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      color: '#6b7280',
                      lineHeight: 1.55,
                    }}
                  >
                    Answer: {card.value} points, {card.resultType}
                  </div>

                  {card.explanation && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 14,
                        color: '#6b7280',
                        lineHeight: 1.6,
                      }}
                    >
                      {card.explanation}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
