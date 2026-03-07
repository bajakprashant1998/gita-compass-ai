import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function VerseShortRedirect() {
  const { ref } = useParams<{ ref: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ref) return;
    const parts = ref.split('-');
    if (parts.length === 2) {
      const [chapter, verse] = parts;
      navigate(`/chapters/${chapter}/verse/${verse}`, { replace: true });
    } else {
      navigate('/chapters', { replace: true });
    }
  }, [ref, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
