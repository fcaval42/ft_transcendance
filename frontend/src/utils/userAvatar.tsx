import { Link } from "react-router-dom";
import { useUser } from "./useUser";

export const UserAvatar = () => {
  const { user, isLoading } = useUser();
  let username

  if (isLoading) {
    return <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>;
  }

  if (!user) {
    return null;
  } else {
    if (user.username.length > 7) {
        username = user.username.substring(0, 7) + "...";
    } else {
        username = user.username;
    }
  }

  return (
    <Link to={`/profile`}>
      <div className="flex items-center gap-2">
        <img
          src={user.avatarUrl || "/default-avatar.png"}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover border-3 border-black-400"
      />
        <span className="font-medium">{username}</span>
      </div>
    </Link>
  );
};