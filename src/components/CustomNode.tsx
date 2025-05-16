import React from "react";
import styled from "styled-components";

export interface CustomNodeProps {
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

const NodeContainer = styled.div<{
  color?: string;
}>`
  background: #444;
  border: 2px solid ${(props) => props.color || "#333"};
  border-radius: 2px;
  padding: 12px 20px;
  min-width: 50px;
  max-height: 40px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #0001;
  font-weight: 500;
  font-size: 1rem;
  gap: 8px;
`;

const CustomNode: React.FC<CustomNodeProps> = ({ label, color, icon }) => {
  return (
    <NodeContainer color={color}>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </NodeContainer>
  );
};

export default CustomNode;
