import Quiz from '../../components/pages/Quiz';

// Force dynamic rendering to ensure middleware runs
export const dynamic = 'force-dynamic';

export default function QuizPage() {
  return <Quiz />;
}
