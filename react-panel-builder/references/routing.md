# Routing & auth guards

All routes in `src/pages/routes.tsx` (react-router v7, `BrowserRouter`). Nested layouts via `<Outlet/>`. Two guards: `PrivateRoute` (needs token) and `AuthRoute` (redirects logged-in users away from `/auth/*`).

## Structure

```tsx
<BrowserRouter>
  <Routes>
    <Route path="*" element={<_404 />} />
    <Route path="/" element={<Navigate to="/dashboard" />} />

    {/* Protected — wrapped in DashboardLayout (sidebar + header + Outlet) */}
    <Route path="/" element={<PrivateRoute layout={<DashboardLayout />} />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/listing" element={<ListingPage />} />
      <Route path="/listing/:id" element={<CreateListingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Route>

    {/* Public auth */}
    <Route path="/auth" element={<AuthRoute layout={<AuthLayout />} />}>
      <Route path="/auth/login" element={<LoginPage />} />
      {/* signup, forget-password, reset-password */}
    </Route>
  </Routes>
</BrowserRouter>
```

Guards:
```tsx
const PrivateRoute = ({ layout }) => {
  const { token } = useUserContext();
  return !!token ? layout : <Navigate to="/auth/login" />;
};
const AuthRoute = ({ layout }) => {
  const { token } = useUserContext();
  return !!token ? <Navigate to="/dashboard" /> : layout;
};
```

## Adding a resource route
Inside the `PrivateRoute` group add two routes:
```tsx
<Route path="/users" element={<UsersPage />} />
<Route path="/users/:id" element={<CreateUserPage />} />   {/* :id === "create" → create mode */}
```
Import the page components at the top of `routes.tsx`.

## Add the sidebar link
In `src/components/layout/DashboardLayout.tsx`, add to `sidebarItems`:
```tsx
{ name: "Users", path: "/users", icon: <FaUsers className="w-5 h-5" /> },
```
(Optionally add a `getPageTitle()` case for the header.)

## Rules
- Every authed page goes inside the `PrivateRoute` group — never outside.
- Resource = exactly two routes: `/res` and `/res/:id`. Create is `/res/create`.
- Read auth via `useUserContext()`; logout = `setUser(null)` then navigate to `/auth/login`.
