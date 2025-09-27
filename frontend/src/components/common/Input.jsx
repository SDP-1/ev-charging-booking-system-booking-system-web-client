// src/components/common/Input.jsx
import React from 'react';

const Input = ({ label, id, name, type = 'text', value, onChange, required = false, ...props }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full border border-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                {...props}
            />
        </div>
    );
};

export default Input;