import useScrollController from "../../hooks/useScrollController";
import React from "react";
import Modal from "react-modal";

type Props = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  children: React.ReactNode;
};

const CenterModal = ({ isOpen, setOpen, children }: Props) => {
  const onClose = () => {
    setOpen(false);
  };

  useScrollController(!isOpen);

  return (
    <Modal
      isOpen={isOpen}
      overlayClassName="top-0 left-0 w-screen h-screen fixed bg-black/30 focus:outline-none outline-none z-50"
      className="fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] focus:outline-none outline-none z-50"
      closeTimeoutMS={300}
      onRequestClose={onClose}
      ariaHideApp={false}
    >
      <div className="z-50 max-h-[80dvh]  overflow-y-scroll hide-scrollbar">{children}</div>
    </Modal>
  );
};

export default CenterModal;
