import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'

type LinkButtonProps = ComponentProps<typeof Link>

/**
 * Tailwind classes for the secondary (outline) button style.
 * Export this when you need full TanStack Router type-safety for search or
 * state params and must use <Link> directly instead of <LinkButton>.
 */
export const LINK_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

/**
 * A TanStack Router `<Link>` styled as a secondary (outline) button.
 * Accepts all the same props as `<Link>`.
 *
 * Note: TanStack Router's `search` param type is inferred from the `to` route.
 * If you need typed search params, use `<Link className={LINK_BUTTON_CLASS} />` directly.
 */
export default function LinkButton(props: LinkButtonProps) {
  return <Link {...props} className={LINK_BUTTON_CLASS} />
}
