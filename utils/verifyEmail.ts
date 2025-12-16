// utils/verifyEmail.js
export async function verifyEmail(email: string) {
    if (!email) {
        throw new Error('Email is required');
    }

    try {
        const response = await fetch(
            `https://emailreputation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VERIF_API_KEY}&email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const isValidFormat = data.email_deliverability?.is_format_valid;
        const isDeliverable = data.email_deliverability?.status === 'deliverable';

        const isValid = Boolean(isValidFormat && isDeliverable);

        return {
            valid: isValid,
            details: data,
            reason: isValid ? null : 'Invalid format or undeliverable'
        };
    } catch (err: unknown) {
        const error = err as Error;
        throw new Error(`Email verification failed: ${error.message}`);
    }
}
