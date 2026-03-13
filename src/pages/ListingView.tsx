import { useParams } from 'react-router-dom';

export default function ListingView() {
  const { slug } = useParams();
  return <div className="p-8 text-center text-slate-500">Listing View for {slug} Coming Soon</div>;
}
