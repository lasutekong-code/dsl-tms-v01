export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
}

export function getSupabaseConfigMessage() {
  return "Supabase 연동 설정이 없습니다. Vercel 프로젝트 Settings → Environment Variables에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 Preview·Production에 추가한 뒤 재배포해 주세요.";
}
