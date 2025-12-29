import toast from 'react-hot-toast';

export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            style: {
                background: '#10B981',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
            },
            duration: 3000,
        });
    },

    error: (message: string) => {
        toast.error(message, {
            style: {
                background: '#EF4444',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
            },
            duration: 4000,
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            style: {
                background: '#FF5722',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
            },
        });
    },

    info: (message: string) => {
        toast(message, {
            icon: 'ℹ️',
            style: {
                background: '#3B82F6',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
            },
            duration: 3000,
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading,
                success: messages.success,
                error: messages.error,
            },
            {
                style: {
                    borderRadius: '8px',
                    padding: '16px',
                },
            }
        );
    },
};
