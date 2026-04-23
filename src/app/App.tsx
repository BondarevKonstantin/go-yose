import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from '@/shared/config/routes';
import { HomePage } from '@/pages/home/HomePage';
import { QuizPage } from '@/pages/quiz/QuizPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.quiz} element={<QuizPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to={routes.home} />} />
      </Routes>
    </BrowserRouter>
  );
};
