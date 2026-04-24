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

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password }) => adminApi.login(username, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ME_KEY }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.logout(),
    onSuccess: () => qc.setQueryData(ME_KEY, null),
  });
}
