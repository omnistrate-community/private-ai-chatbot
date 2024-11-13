import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isValidToken } from '@/utils/auth';

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isValidToken(token)) {
      router.push('/');
    }
  }, [router]);
};