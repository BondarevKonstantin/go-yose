import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/home/HomePage';
import { QuizPage } from '@/pages/quiz/QuizPage';
import { CardsPage } from '@/pages/cards/CardsPage';
import { routes } from '@/shared/config/routes';
import { Navbar } from '@/shared/ui/Navbar';

export const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.cards} element={<CardsPage />} />
        <Route path={routes.quiz} element={<QuizPage />} />
        <Route path={routes.quizCard} element={<QuizPage />} />
        <Route path="*" element={<Navigate to={routes.home} />} />
      </Routes>
    </BrowserRouter>
  );
};
