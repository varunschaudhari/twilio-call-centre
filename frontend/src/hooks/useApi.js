import { useCallback } from 'react';
import { useImmer } from 'use-immer';
import { apiUtils } from '../services/api';

export const useApi = () => {
    const [apiState, updateApiState] = useImmer({
        loading: false,
        error: null,
        data: null,
    });

    const executeRequest = useCallback(async (requestFn, options = {}) => {
        const {
            onSuccess,
            onError,
            showLoading = true,
            clearError = true,
        } = options;

        try {
            // Set loading state
            if (showLoading) {
                updateApiState(draft => {
                    draft.loading = true;
                    if (clearError) draft.error = null;
                });
            }

            // Execute the request
            const response = await requestFn();

            // Update state with success data
            updateApiState(draft => {
                draft.loading = false;
                draft.data = response.data;
                draft.error = null;
            });

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(response.data, response);
            }

            return response.data;
        } catch (error) {
            // Handle error
            const errorInfo = apiUtils.handleError(error);

            updateApiState(draft => {
                draft.loading = false;
                draft.error = errorInfo;
            });

            // Call error callback if provided
            if (onError) {
                onError(errorInfo, error);
            }

            throw errorInfo;
        }
    }, [updateApiState]);

    const resetState = useCallback(() => {
        updateApiState(draft => {
            draft.loading = false;
            draft.error = null;
            draft.data = null;
        });
    }, [updateApiState]);

    return {
        ...apiState,
        executeRequest,
        resetState,
    };
};

// Specialized hooks for common API patterns
export const useApiCall = (requestFn, options = {}) => {
    const api = useApi();

    const execute = useCallback(async (...args) => {
        return api.executeRequest(() => requestFn(...args), options);
    }, [api, requestFn, options]);

    return {
        ...api,
        execute,
    };
};

export const useApiWithRetry = (requestFn, options = {}) => {
    const api = useApi();

    const executeWithRetry = useCallback(async (...args) => {
        return api.executeRequest(
            () => apiUtils.retryRequest(() => requestFn(...args)),
            options
        );
    }, [api, requestFn, options]);

    return {
        ...api,
        execute: executeWithRetry,
    };
};
