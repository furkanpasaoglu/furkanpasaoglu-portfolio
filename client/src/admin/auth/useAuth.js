import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';

const ME_KEY = ['admin', 'me'];

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => adminApi.me(),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.logout(),
    onSuccess: () => qc.setQueryData(ME_KEY, null),
  });
}
