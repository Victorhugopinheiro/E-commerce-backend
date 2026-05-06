export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
}

export interface User {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    cartData?: Record<string, any>;
    stripeCustomerId?: string;
    addresses?: Address[];
}

export interface UserProfile extends Omit<User, 'password'> {
    // User profile without sensitive password field
}
