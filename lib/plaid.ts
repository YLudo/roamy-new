import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as string],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET_SANDBOX,
        },
    },
});

export const plaidClient = new PlaidApi(configuration);