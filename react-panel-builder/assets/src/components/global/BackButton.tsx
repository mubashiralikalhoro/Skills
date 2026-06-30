import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router";
import { cn } from "../../utils";

interface Props {
  onClick?: () => void;
  className?: string;
}

const BackButton = ({ onClick, className }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        `text-primary   flex gap-2 items-center cursor-pointer hover:scale-105 duration-200 w-fit `,
        className
      )}
      onClick={onClick ? onClick : () => navigate(-1)}
    >
      <IoArrowBack /> Back
    </div>
  );
};

export default BackButton;
