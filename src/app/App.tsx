import { useQuery } from 'react-query';
import { fetchBook } from '@utils/fetchBook';
import Spinner from '@components/Spinner';
import '@styles/main.css';

export default function App() {
  const { isLoading, data } = useQuery('books', () => fetchBook());

  if (isLoading) {
    return <Spinner />;
  }

  return <div>{data!.length} books loaded.</div>;
}
