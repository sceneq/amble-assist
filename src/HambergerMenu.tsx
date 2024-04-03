import { ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";

function HamburgerIcon({ menuOpen }: { menuOpen: boolean }) {
  return (
    <svg
      className={`hamburger-icon ${menuOpen ? "open" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`bar ${menuOpen ? "open" : ""}`}
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`bar ${menuOpen ? "open" : ""}`}
      />
      <path
        d="M3 18H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`bar ${menuOpen ? "open" : ""}`}
      />
    </svg>
  );
}

interface Props {
  children: ReactNode;
}

export default function HamburgerMenu(props: Props) {
  const [menuOpen, setMenuOpen] = useLocalStorage("menuOpen", true);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="hamburger-menu">
      <button className="hamburger-button" onClick={toggleMenu}>
        <HamburgerIcon menuOpen={menuOpen} />
      </button>
      <div className={`menu ${menuOpen ? "open" : ""}`}>{props.children}</div>
    </div>
  );
}
