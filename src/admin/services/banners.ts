import { supabase } from '../../lib/supabase';
import type { Banner } from '../../lib/types';

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((banner) => ({
    ...banner,
    link_url: banner.link_url ?? null,
    description: banner.description ?? null,
    created_by: banner.created_by ?? null,
  }));
}

interface SaveBannerPayload {
  banner?: Banner | null;
  form: {
    title: string;
    image_url: string;
    link_url: string;
    description: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
  };
  authorId?: string;
}

export async function saveBanner({ banner, form, authorId }: SaveBannerPayload) {
  if (banner) {
    const { error } = await supabase
      .from('banners')
      .update({
        ...form,
        link_url: form.link_url || null,
        description: form.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', banner.id);

    if (error) {
      throw error;
    }

    return;
  }

  const maxOrderResponse = await supabase
    .from('banners')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxOrder = maxOrderResponse.data?.display_order ?? 0;

  const { error } = await supabase.from('banners').insert({
    ...form,
    link_url: form.link_url || null,
    description: form.description || null,
    display_order: maxOrder + 1,
    created_by: authorId,
  });

  if (error) {
    throw error;
  }
}

export async function toggleBannerActive(bannerId: string, active: boolean) {
  const { error } = await supabase
    .from('banners')
    .update({ is_active: active })
    .eq('id', bannerId);

  if (error) {
    throw error;
  }
}

export async function deleteBanner(bannerId: string) {
  const { error } = await supabase.from('banners').delete().eq('id', bannerId);
  if (error) {
    throw error;
  }
}
