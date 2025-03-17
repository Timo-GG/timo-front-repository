function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-10
  "
    >
      {children}
    </div>
  );
}

export default Modal;
