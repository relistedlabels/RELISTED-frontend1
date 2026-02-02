# Copilot Instructions for RELISTED Frontend

## Project Overview
**RELISTED** is a peer-to-peer fashion rental platform (Next.js 16 + React 19). Key roles: **Dressers** (renters), **Listers** (sellers), **Admins** (curators).

## Tech Stack & Commands
- **Framework**: Next.js 16 with App Router, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + PostCSS
- **State**: Zustand (persistent stores) + TanStack React Query 5 (server state)
- **Forms**: Formik + Yup schema validation
- **Dev**: Biome 2.2 for linting/formatting
- **Commands**:
  - `npm run dev` - Start dev server
  - `npm run build` / `npm run start` - Production build
  - `npm run lint` - Biome check
  - `npm run format` - Format with Biome

## Architecture Patterns

### State Management
- **User Auth** → `useUserStore` (Zustand + localStorage persistence): `{ token, userId, name, email, role }`
- **Profile Data** → `useProfileStore` (nested objects: address, business info, bank accounts, emergency contacts)
- **Server Data** → TanStack React Query (5min staleTime, no refetch on window focus, 1 retry)

### API Layer
- **Base**: `src/lib/api/http.ts` exports `apiFetch<T>()` - attaches JWT token + handles 401 auto-logout
- **Queries**: Organized in `src/lib/queries/{auth,user,product,brand,category}/` with hooks (e.g., `useMe()`, `useLogin()`, `useUpdateProfile()`)
- **Environment**: `NEXT_PUBLIC_API_BASE_URL` required in `.env.local`

### Authentication & Authorization
- **Protected Routes**: `<Protected />` component checks `useMe()` query, redirects to `/auth/sign-in` if no user
- **Role-Based**: `requireRole(user, ['ADMIN'])` utility in `src/lib/requireRole.ts`
- **Dev Mode**: `<DevGuard />` (root layout) gates access via `devAuth.hasAccess()`:
  - Public: `/dev`, `/waitlist`, `/auth`, `/listers/inventory`
  - Others: Redirects to `/waitlist` or `/dev` if no access

### Component Structure
- **Shared UI**: `src/common/ui/` - `Button`, `Card1`, `ProductCard`, `BackHeader`, `Accordion`, `FileUploader`, etc.
- **Layout Layer**: `src/common/layer/` - `DesktopNavbar`, `MobileNavbar`, `Footer`, `Protected`, `DevGuard`, `AuthActions`
- **Feature Pages**: `src/app/{admin,listers,dressers,shop,home}/` with segment-specific layouts & route protection

## Key Workflows

### Adding a New API Endpoint
1. Create hook in `src/lib/queries/{domain}/useFeature.ts`
2. Use `useQuery()` for reads, `useMutation()` for writes
3. Call `apiFetch<ReturnType>("/api/path", options)` inside queryFn/mutationFn
4. Example: `useMe()` fetches current user from `/api/auth/me`

### Form Submission with Validation
1. Use Formik + Yup schema: `const validationSchema = Yup.object({ email: Yup.string().email() })`
2. Connect to mutation: `const mutation = useUpdateProfile(); mutation.mutate(values)`
3. Handle loading/error states from query: `{ isPending, isError, error }`

### Multi-Step Profile Setup
- Check `!user` (not authenticated) or `!profile` (incomplete profile)
- Route guards in layout files redirect: `router.replace("/auth/sign-in")` or `"/auth/profile-setup"`
- See `src/app/listers/layout.tsx` for pattern

### Image Upload
- Cloudinary integration via `useUpload()` mutation in `src/lib/queries/useUpload.ts`
- FormData auto-detection in `apiFetch`: skips JSON header if body is FormData

## File Paths & Key Locations
- **Store Definitions**: `src/store/use{User,Profile,ProductDraft}Store.ts`
- **Query Hooks**: `src/lib/queries/{auth,user,product}/*.ts`
- **Page Routes**: `src/app/{route}/page.tsx` (NextJS App Router)
- **Types**: `src/types/profile.ts`, `types/routes.d.ts`, `types/validator.ts`
- **Hooks**: `src/hooks/useAuthRedirect.ts`, `src/hooks/{users,products}/`

## Naming & Conventions
- **Components**: PascalCase, one file per component (or index.tsx for exports)
- **Hooks**: `use{Feature}` pattern
- **Stores**: `use{Entity}Store.ts` (e.g., `useUserStore.ts`)
- **Query Keys**: Implicit in hook definitions (e.g., `['user', 'profile']`)
- **CSS**: Tailwind utility classes; no CSS modules in use

## Common Issues & Solutions
- **401 Auto-Logout**: `apiFetch` automatically clears user store on 401 status
- **Missing Type**: Check `src/types/` before creating duplicate definitions
- **Environment Vars**: Must be `NEXT_PUBLIC_*` to expose to browser
- **Protected Page Loops**: Ensure layout guards don't create redirect loops (check both user & profile states)

## References
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- React Query: [@tanstack/react-query](https://tanstack.com/query)
- Zustand: [zustand-demo.vercel.app](https://zustand-demo.vercel.app)
- Tailwind: [tailwindcss.com](https://tailwindcss.com)
