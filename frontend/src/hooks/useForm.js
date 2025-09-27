// src/hooks/useForm.js
import { useState } from 'react';

/**
 * Custom hook to handle form state, changes, and reset.
 * @param {object} initialValues - The initial state of the form fields.
 */
export const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });
    };

    const resetForm = () => {
        setValues(initialValues);
    };

    return {
        values,
        handleChange,
        resetForm,
        setValues
    };
};