
export interface User {
    userId: string;
    userFirstName: string;
    userLastName: string;
    userLoginId: string;
    password?: string;
    createdAt: Date;
    unitPreference: 'KG' | 'LBS'
    enabled: boolean;
    locked: boolean;
    roles: string[];
}
