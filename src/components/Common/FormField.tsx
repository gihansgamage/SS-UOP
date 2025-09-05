import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  options?: string[];
  placeholder?: string;
  error?: string;
  rows?: number;
  as?: 'input' | 'select' | 'textarea';
  validate?: (value: string) => string | undefined;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  required = false,
  value,
  onChange,
  options,
  placeholder,
  error,
  rows = 3,
  as = 'input',
  validate
}) => {
  const [validationError, setValidationError] = React.useState<string | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e);
    
    if (validate && e.target.value) {
      const validationResult = validate(e.target.value);
      setValidationError(validationResult);
    } else {
      setValidationError(undefined);
    }
  };

  const displayError = error || validationError;
  const baseClasses = `mt-1 block w-full rounded-lg border ${
    displayError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  } shadow-sm focus:ring-2 focus:ring-opacity-50 px-3 py-2`;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {as === 'select' && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          className={baseClasses}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      
      {displayError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
};

export default FormField;