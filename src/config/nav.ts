/**
 * Workspace, admin, and marketing header chrome.
 *
 * Labels, order, and `hidden` live in the JSON files next to this module.
 * Workspace/admin: `hidden: true` drops the item from nav and refuses its URL
 * (including `childPrefixes`). Routes stay registered in App.tsx; guards
 * redirect. `/app/settings` is not a sidebar page and is never gated there.
 *
 * Marketing header: `hidden: true` drops the link and refuses the URL.
 * Routes not listed in `nav.site-header.json` (careers, FAQ, legal, …) are
 * unaffected.
 *
 * Marketing footer: `hidden: true` drops the link from footer columns only.
 * Route access is unchanged (header JSON still gates listed marketing pages).
 */
import adminNavJson from './nav.admin.json' with { type: 'json' }
import siteFooterNavJson from './nav.site-footer.json' with { type: 'json' }
import siteHeaderNavJson from './nav.site-header.json' with { type: 'json' }
import workspaceNavJson from './nav.workspace.json' with { type: 'json' }

export type NavItemBase = {
  id: string
  path: string
  name: string
  hidden: boolean
  /** Present when `hidden` is a deferred feature (`TODO: For Future`). */
  todo?: string
  end?: boolean
  childPrefixes?: string[]
}

export type WorkspaceNavItem = NavItemBase & {
  hint: string
  icon: string
  mobileTab?: boolean
  mobileName?: string
  accountMenu?: boolean
  accountMenuName?: string
}

export type AdminNavItem = NavItemBase

export type SiteHeaderNavItem = NavItemBase

export type SiteFooterNavLink = {
  id: string
  path: string
  name: string
  hidden: boolean
}

export type SiteFooterNavColumn = {
  id: string
  title: string
  links: SiteFooterNavLink[]
}

const workspaceNav = workspaceNavJson as WorkspaceNavItem[]
const adminNav = adminNavJson as AdminNavItem[]
const siteHeaderNav = siteHeaderNavJson as SiteHeaderNavItem[]
const siteFooterNav = siteFooterNavJson as SiteFooterNavColumn[]

const MOBILE_TAB_CAP = 4

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function itemCoversPath(item: NavItemBase, pathname: string): boolean {
  if (item.end) {
    if (pathname === item.path) return true
  } else if (pathMatchesPrefix(pathname, item.path)) {
    return true
  }
  return (item.childPrefixes ?? []).some((prefix) => pathMatchesPrefix(pathname, prefix))
}

function isVisible(item: NavItemBase): boolean {
  return item.hidden !== true
}

function isPathHidden(items: NavItemBase[], pathname: string): boolean {
  return items.some((item) => !isVisible(item) && itemCoversPath(item, pathname))
}

export function visibleWorkspaceNav(): WorkspaceNavItem[] {
  return workspaceNav.filter(isVisible)
}

export function visibleAdminNav(): AdminNavItem[] {
  return adminNav.filter(isVisible)
}

export function visibleSiteHeaderNav(): SiteHeaderNavItem[] {
  return siteHeaderNav.filter(isVisible)
}

export function visibleSiteFooterColumns(): SiteFooterNavColumn[] {
  return siteFooterNav
    .map((column) => ({
      ...column,
      links: column.links.filter(isVisible),
    }))
    .filter((column) => column.links.length > 0)
}

export function workspaceMobileTabs(): WorkspaceNavItem[] {
  return visibleWorkspaceNav()
    .filter((item) => item.mobileTab)
    .slice(0, MOBILE_TAB_CAP)
}

export function workspaceAccountMenuItems(): WorkspaceNavItem[] {
  return visibleWorkspaceNav().filter((item) => item.accountMenu)
}

export function isWorkspacePathHidden(pathname: string): boolean {
  return isPathHidden(workspaceNav, pathname)
}

export function isAdminPathHidden(pathname: string): boolean {
  return isPathHidden(adminNav, pathname)
}

export function isSiteHeaderPathHidden(pathname: string): boolean {
  return isPathHidden(siteHeaderNav, pathname)
}

export function fallbackWorkspacePath(): string {
  return visibleWorkspaceNav()[0]?.path ?? '/'
}

export function fallbackAdminPath(): string {
  return visibleAdminNav()[0]?.path ?? '/app/action'
}

export function fallbackSiteHeaderPath(): string {
  return visibleSiteHeaderNav()[0]?.path ?? '/'
}

function isAdminUser(user: { role?: string } | null | undefined): boolean {
  return user?.role === 'admin'
}

function isAdminAreaPath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/')
}

/** Default route after sign-in / email verification when no `from` return path is set. */
export function postAuthLandingPath(
  user: { role?: string } | null | undefined,
  from?: string | null,
): string {
  if (isAdminUser(user)) {
    // Admins land on the admin panel unless they were sent to sign-in from /admin/*.
    // Ignore workspace/marketing `from` paths — those CTAs default to /app/action.
    if (from && isAdminAreaPath(from)) return from
    return fallbackAdminPath()
  }
  if (from) return from
  return fallbackWorkspacePath()
}
