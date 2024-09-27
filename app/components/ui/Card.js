import React from "react";

const Card = ({ children }) => {
  return <div className="bg-white rounded-md shadow-md">{children}</div>;
};

const CardHeader = ({ children }) => {
  return <div className="p-4 border-b">{children}</div>;
};

const CardContent = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export { Card, CardHeader, CardContent };
