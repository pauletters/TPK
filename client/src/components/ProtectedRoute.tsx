import { Navigate } from 'react-router-dom';
import AuthService from '../utils/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isLoggedIn = AuthService.loggedIn();

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;