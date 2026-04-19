import { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden border">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">{children}</thead>;
}

export function TR({ children }: { children: ReactNode }) {
  return <tr className="border-t">{children}</tr>;
}

export function TH({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}

export function TD({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
