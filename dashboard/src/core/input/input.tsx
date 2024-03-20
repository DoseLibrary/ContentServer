type InputProps = {
  /**
   * Input label
   */
  label?: string;
  /**
   * Input type
   */
  type?: "text" | "number" | "password";
  /**
   * Input placeholder
   */
  placeholder?: string;
  /**
   * Input value
   */
  value?: string;
  /**
   * Input change handler
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = (props: InputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-white">{props.label}</label>
      <input
        type={props.type || "text"}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        className="mt-1 p-2 w-full rounded-md"
      />
    </div>
  );
};

export default Input;
