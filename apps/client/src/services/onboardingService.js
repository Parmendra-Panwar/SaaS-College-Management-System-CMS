import apiClient from '@services/apiClient';

const onboardingService = {
    requestCollege: (formData) => apiClient.post('/onboarding/request-college', formData),
};

export default onboardingService;
