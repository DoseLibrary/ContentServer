type SimpleButtonProps = {
  className?: string;
  /**
   * Button text
   */
  children: string | JSX.Element;
  /**
   * Button click handler
   */
  onClick?: () => void;
  /**
   * Button type
   */
  type?: "button" | "submit" | "reset" | "alert";
  /**
   * Button disabled
   */
  disabled?: boolean;
};

const SimpleButton = ({ children, type, disabled, ...props }: SimpleButtonProps) => {
  const getColor = () => {
    if (disabled) {
      return "bg-gray-500";
    }
    if (type === "alert") {
      return "bg-red-500";
    }
    return "bg-blue-500";
  }

  return (
    <button
      {...props}
      disabled={disabled}
      className={`${getColor()} text-white p-2 rounded-md ${props.className}`}
    >
      {children}
    </button>
  );
}
export default SimpleButton;
