import React from "react";
import classNames from "classnames";
import { Link } from "react-router";

type Props = {
  sections?: { content: any; link?: string; onClick?: () => void; clickable?: boolean }[][];
  isOpen?: boolean;
  className?: string;
};

const DropDown = ({ sections = [], isOpen, className }: Props) => {
  return (
    isOpen && (
      <div
        id=""
        className={classNames(
          "z-10  bg-white divide-y divide-gray-100 rounded-lg mt-1  w-44 overflow-y-auto max-h-[300px] border border-slate-300",
          className
        )}
      >
        {sections.map((section, index) => (
          <ul key={index} className="py-2 text-sm text-gray-700 ">
            {section.map((item, j) => (
              <li key={`${index}-${j}`}>
                <Link
                  to={item.link || "#"}
                  onClick={item.onClick}
                  className={classNames(`cursor-pointer block px-4 py-2`, {
                    "hover:bg-gray-100": item.clickable !== false,
                  })}
                >
                  {item.content}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>
    )
  );
};

export default DropDown;
