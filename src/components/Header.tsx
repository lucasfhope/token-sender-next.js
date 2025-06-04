import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
    return (
      <header className="flex items-center justify-between w-full px-6 py-4 bg-white shadow-md">
        <div className="flex items-center gap-3 text-gray-900">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            aria-label="GitHub repository"
          >
            <FaGithub className="h-6 w-6 text-gray-900" />
          </a>
  
          <h1 className="text-xl font-semibold text-gray-900">TSender</h1>
        </div>
  
        <ConnectButton />
      </header>
    );
  }