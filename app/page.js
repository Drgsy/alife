import { redirect } from 'next/navigation';
import { TABS } from '../lib/tabs';

export default function Home() {
  redirect(`/${TABS[0].slug}`);
}
