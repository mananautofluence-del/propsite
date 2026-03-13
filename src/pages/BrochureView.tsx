import { useParams } from 'react-router-dom';

export default function BrochureView() {
  const { slug } = useParams();
  return <div className="p-8 text-center text-slate-500">Brochure View for {slug} Coming Soon</div>;
}
