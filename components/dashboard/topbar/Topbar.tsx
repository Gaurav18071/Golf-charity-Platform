import {
  MobileMenuButton,
  NotificationButton,
  PageTitle,
  UserMenu,
} from ".";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          <MobileMenuButton />
          <PageTitle />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <NotificationButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}