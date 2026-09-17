// src/components/Header.tsx
import { UserAvatar } from "../utils/userAvatar";
import { LogoutButton } from "./LougoutButton";

export const Header = () => {
  return (
    <header className="absolute top-4 left-4 right-4 flex justify-between items-center">
      <UserAvatar />
      <LogoutButton />
    </header>
  );
};