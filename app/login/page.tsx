import { redirect } from 'next/navigation';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const rawRedirect = searchParams?.redirect;
  const redirectPath = Array.isArray(rawRedirect) ? rawRedirect[0] : rawRedirect;
  const safeRedirect = redirectPath && redirectPath.startsWith('/') ? redirectPath : '/';

  redirect(`/?auth=login&redirect=${encodeURIComponent(safeRedirect)}`);
}
