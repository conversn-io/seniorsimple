import { redirect } from 'next/navigation';

export default function ExpectCallPage() {
  redirect('/quiz-submitted');
}
