import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/home/HomePage';
import { QuizPage } from '@/pages/quiz/QuizPage';
import { routes } from '@/shared/config/routes';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.quiz} element={<QuizPage />} />
        <Route path={routes.quizCard} element={<QuizPage key="quiz-card" />} />
        <Route path="*" element={<Navigate to={routes.home} />} />
      </Routes>
    </BrowserRouter>
  );
};
