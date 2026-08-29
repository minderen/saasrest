type RpcCapable = {
  rpc: (fn: "is_super_admin") => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

/** Kritik plan/kota işlemleri için sunucu tarafı süper admin doğrulaması. */
export async function assertSuperAdmin(supabase: RpcCapable) {
  const { data, error } = await supabase.rpc("is_super_admin");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: bu işlem yalnızca platform yöneticisine açık");
}
