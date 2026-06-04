import { redirect } from 'next/navigation';

export default function OldHistoryRedirect() {
    redirect('/history');
}