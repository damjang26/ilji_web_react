
import styled from "styled-components";
import { BellOutlined } from "@ant-design/icons";

export const NotiPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
`;

export const NotiHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const NotiTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  gap: 8px;
`;

export const NotiButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #888;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const NotiList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

export const NotiEmpty = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #aaa;
  padding-bottom: 60px; /* Push content up */
`;

export const EmptyIcon = styled(BellOutlined)`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const EmptyText = styled.p`
  font-size: 16px;
`;

export const NotiItem = styled.div`
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: ${({ unread }) => (unread ? "#f8f9fa" : "transparent")};
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const ItemMain = styled.a`
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-decoration: none;
  color: inherit;
`;

export const ItemIcon = styled.div`
  position: relative;
  font-size: 20px;
  color: #555;
  flex-shrink: 0;
  margin-top: 4px;
`;

export const UnreadDot = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ff4d4f;
  border-radius: 50%;
  border: 1px solid white;
`;

export const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ItemTitle = styled.div`
  font-weight: 500;
  color: #333;
`;

export const ItemBody = styled.div`
  font-size: 14px;
  color: #666;
`;

export const ItemTime = styled.div`
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const ItemTail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #aaa;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;
