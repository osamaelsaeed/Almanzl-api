import { checkEmail, checkPhoneNumber, checkPassword } from '../utils/regexExpressions.js';

const schema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            maxLength: 25,
        },
        email: {
            type: 'string',
            pattern: checkEmail.source,
        },
        password: {
            type: 'string',
            pattern: checkPassword.source,
            minLength: 8,
        },
        phone: {
            type: 'string',
            pattern: checkPhoneNumber.source,
        },
    },
    required: ['name', 'email', 'password', 'phone'],
    additionalProperties: false,
};

export default schema;
