import { useNavigate } from 'react-router-dom';
import { routes } from '@/shared/config/routes';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>Yose Trainer</h1>

      <button
        onClick={() => navigate(routes.quiz)}
        style={{
          marginTop: 20,
          padding: '12px 20px',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Начать квиз
      </button>
    </div>
  );
};
