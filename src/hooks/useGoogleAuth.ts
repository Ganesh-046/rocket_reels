import { useMutation } from '@tanstack/react-query';
import { googleAuthService } from '../services/googleAuth.service';

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: () => googleAuthService.loginWithGoogle(),
    onError: (error) => {
      console.error('Google login error:', error);
    },
  });
};

// Export availability check
export { googleSignInWrapper } from '../services/googleSignInWrapper'; 