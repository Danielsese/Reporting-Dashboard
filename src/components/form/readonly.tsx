"use client";

import * as React from "react";

const ReadOnlyContext = React.createContext(false);

export function ReadOnlyProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <ReadOnlyContext.Provider value={value}>
      {children}
    </ReadOnlyContext.Provider>
  );
}

export function useReadOnly() {
  return React.useContext(ReadOnlyContext);
}
