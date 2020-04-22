export interface Jwt {
    nbf: number;
    exp: number;
    iss: string;
    aud: string[];
    client_id: string;
    sub: string;
    auth_time: number;
    idp: string;
    name: string;
    "kreta:user_name": string;
    "kreta:institute_code": string;
    "kreta:institute_user_id": number;
    "kreta:institute_user_unique_id": string;
    "kreta:school_year_id": string;
    "kreta:school_year_unique_id": string;
    "kreta:user_type": string;
    role: string[];
    scope: string[];
    amr: string[];
}
