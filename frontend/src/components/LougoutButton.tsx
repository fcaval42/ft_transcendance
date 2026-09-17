import { useNavigate } from "react-router-dom";

export const LogoutButton = () => {
  const navigate = useNavigate();



  return (
    <button
      className="absolute top-4 right-4 bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-bold"
    >
      Se déconnecter
    </button>
  );
};