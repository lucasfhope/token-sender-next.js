export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  type?: string;
  large?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function InputField({
    label,
    placeholder = "",
    value,
    type = "text",
    large = false,
    onChange,
  }: InputFieldProps) {
    const baseClasses =
      "rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm w-full";
    const sizeClasses = large ? "py-3 px-2 h-32 text-base" : "px-3 py-2 text-base";
  
    return (
      <label className="flex flex-col gap-1 w-full">
        {label && <span className="font-medium text-gray-700">{label}</span>}
  
        {large ? (
          <textarea
            className={`${baseClasses} ${sizeClasses} resize-none`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={4}
          />
        ) : (
          <input
            className={`${baseClasses} ${sizeClasses}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )}
      </label>
    );
  }