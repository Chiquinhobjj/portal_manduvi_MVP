import { supabase } from '../../lib/supabase';
import type { AdminApiError, UserProfile } from '../../lib/types';

interface UpdateUserStatusPayload {
  userId: string;
  status: UserProfile['status'];
  actorId?: string;
}

export async function fetchAdminUsers(): Promise<UserProfile[]> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    throw new Error('Sessão inválida: faça login novamente.');
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as AdminApiError | null;
    const message = payload?.message || 'Não foi possível carregar os usuários.';
    throw new Error(message);
  }

  const data = (await response.json()) as UserProfile[];
  return data.map((user) => ({
    ...user,
    metadata: (user.metadata as Record<string, unknown> | undefined) ?? {},
  }));
}

export async function updateAdminUserStatus(payload: UpdateUserStatusPayload) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    throw new Error('Sessão inválida: faça login novamente.');
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: payload.userId, status: payload.status }),
  });

  if (!response.ok) {
    const { message } = (await response.json().catch(() => ({}))) as AdminApiError;
    throw new Error(message || 'Não foi possível atualizar o status do usuário.');
  }

  if (payload.actorId) {
    await supabase.from('admin_activity_log').insert({
      user_id: payload.actorId,
      action: 'update',
      entity_type: 'user_status',
      entity_id: payload.userId,
      changes: { status: payload.status },
    });
  }
}
